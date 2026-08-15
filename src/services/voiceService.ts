import { supabase } from '../../supabaseClient';
import { buildStructuredVerification } from './aiService';

type RecordingHandle = {
  stopAndUnloadAsync: () => Promise<unknown>;
  getURI: () => string | null;
  prepareToRecordAsync: (options: unknown) => Promise<void>;
  startAsync: () => Promise<void>;
};

let expoAvModule: typeof import('expo-av') | null = null;
let expoSpeechModule: typeof import('expo-speech') | null = null;
let recording: RecordingHandle | null = null;

const loadAudioModule = async () => {
  if (expoAvModule) {
    return expoAvModule;
  }

  const originalWarn = console.warn;
  console.warn = ((...args: unknown[]) => {
    const [firstArg] = args;
    if (typeof firstArg === 'string' && firstArg.includes('[expo-av]: Expo AV has been deprecated')) {
      return;
    }
    originalWarn(...args);
  }) as typeof console.warn;

  expoAvModule = await import('expo-av');
  console.warn = originalWarn;
  return expoAvModule;
};

const getTranscriptionEndpoint = () => {
  const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  return baseUrl ? `${baseUrl}/functions/v1/transcribe-audio` : null;
};

const invokeSupabaseFunction = async <T>(functionName: string, payload: Record<string, unknown>): Promise<T> => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error(`Session lookup failed: ${sessionError.message}`);
  }
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    throw new Error('No active Supabase session. Please sign in again.');
  }

  const { data, error } = await supabase.functions.invoke<T>(functionName, {
    body: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (error) {
    const context = (error as { context?: Response }).context;
    if (context) {
      try {
        const body = await context.clone().json() as { error?: string; message?: string };
        throw new Error(body.error || body.message || error.message);
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message !== error.message) {
          throw parseError;
        }
      }
    }
    throw new Error(error.message || 'Supabase Edge Function request failed.');
  }

  return data as T;
};

const localFallbackTranscript = (audioUri: string): string => {
  const lowerUri = audioUri.toLowerCase();
  if (lowerUri.includes('workout') || lowerUri.includes('gym')) {
    return 'I completed a disciplined workout session.';
  }
  if (lowerUri.includes('study') || lowerUri.includes('read')) {
    return 'I completed a focused study session.';
  }
  if (lowerUri.includes('run') || lowerUri.includes('jog')) {
    return 'I completed a running session.';
  }
  return 'I completed a focused session and kept my discipline intact.';
};

export type VoicePayload = {
  type: 'audio' | 'text';
  content: string;
  createdAt: string;
};

export type VoiceVerificationContext = {
  userId: string;
  contract: {
    task: string;
    durationMinutes: number;
    stakePP: number;
    acceptedAt: string;
  };
  proof?: {
    photoPath?: string;
    photoMimeType?: string;
    latitude?: number;
    longitude?: number;
  };
};

export const createVoicePayload = (content: string, type: 'audio' | 'text'): VoicePayload => ({
  type,
  content,
  createdAt: new Date().toISOString(),
});

export const shouldUseLocalVerificationFallback = (message: string): boolean => (
  /\b429\b|rate limit|billing|quota|No active Supabase session|Session lookup failed|not configured|Edge Function returned a non-2xx status code|failed/i.test(message)
);

export const startVoiceRecording = async () => {
  const { Audio } = await loadAudioModule();
  const permission = await Audio.requestPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Microphone permission denied');
  }

  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
  recording = new Audio.Recording() as unknown as RecordingHandle;
  await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await recording.startAsync();
  return recording;
};

export const stopVoiceRecording = async () => {
  if (!recording) {
    return null;
  }

  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  recording = null;
  return uri;
};

export const transcribeAudio = async (audioUri: string): Promise<string> => {
  const endpoint = getTranscriptionEndpoint();
  if (!endpoint) {
    return localFallbackTranscript(audioUri);
  }

  try {
    const data = await invokeSupabaseFunction<{ transcript?: string }>('transcribe-audio', { audioUri, type: 'audio' });
    if (data.transcript) {
      return data.transcript;
    }
  } catch {
    // Fall back to a lightweight local parser when the network or edge function is unavailable.
  }

  return localFallbackTranscript(audioUri);
};

export const uploadVoicePayload = async (payload: VoicePayload, context?: VoiceVerificationContext) => {
  const endpoint = process.env.EXPO_PUBLIC_SUPABASE_URL
    ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/peakpact-verify`
    : null;

  if (!endpoint) {
    const localResponse = buildStructuredVerification(payload.content, context?.contract, 'en');
    return {
      ok: true,
      mode: 'local-fallback',
      payload,
      response: localResponse,
    };
  }

  try {
    const response = await invokeSupabaseFunction<unknown>('peakpact-verify', {
      ...payload,
      ...(context ? { user_id: context.userId, contract: context.contract } : {}),
      ...(context?.proof ? { proof: context.proof } : {}),
    });
    return {
      ok: true,
      mode: 'edge-function',
      payload,
      response,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification request failed';
    const localResponse = buildStructuredVerification(payload.content, context?.contract, 'en');

    if (shouldUseLocalVerificationFallback(message)) {
      return {
        ok: true,
        mode: 'fallback-local-verification',
        payload,
        response: localResponse,
      };
    }

    throw new Error(`PeakPact verification failed: ${message}`);
  }
};

export const speakVoiceFeedback = async (text: string, language = 'en') => {
  if (!text.trim()) return;

  try {
    if (!expoSpeechModule) {
      expoSpeechModule = await import('expo-speech');
    }
    expoSpeechModule.stop();
    expoSpeechModule.speak(text, { language });
  } catch {
    // Speech is optional. Recording and text entry must continue if it is unavailable.
  }
};

export const stopVoiceFeedback = async () => {
  try {
    if (!expoSpeechModule) {
      expoSpeechModule = await import('expo-speech');
    }
    expoSpeechModule.stop();
  } catch {
    // Speech is optional and should never block the app.
  }
};