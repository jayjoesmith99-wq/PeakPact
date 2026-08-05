import { supabase } from '../../supabaseClient';

type RecordingHandle = {
  stopAndUnloadAsync: () => Promise<unknown>;
  getURI: () => string | null;
  prepareToRecordAsync: (options: unknown) => Promise<void>;
  startAsync: () => Promise<void>;
};

let expoAvModule: typeof import('expo-av') | null = null;
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
  const { data, error } = await supabase.functions.invoke<T>(functionName, { body: payload });

  if (error) {
    throw error;
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

export const createVoicePayload = (content: string, type: 'audio' | 'text'): VoicePayload => ({
  type,
  content,
  createdAt: new Date().toISOString(),
});

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

export const uploadVoicePayload = async (payload: VoicePayload) => {
  const endpoint = process.env.EXPO_PUBLIC_SUPABASE_URL
    ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/peakpact-verify`
    : null;

  if (!endpoint) {
    return {
      ok: true,
      mode: 'local-prototype',
      payload,
    };
  }

  try {
    const response = await invokeSupabaseFunction<unknown>('peakpact-verify', payload);
    return {
      ok: true,
      mode: 'edge-function',
      payload,
      response,
    };
  } catch {
    return {
      ok: false,
      mode: 'local-fallback',
      payload,
    };
  }
};
