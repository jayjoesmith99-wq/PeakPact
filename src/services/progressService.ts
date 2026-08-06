<<<<<<< HEAD
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../supabaseClient';

const APP_SALT = 'PEAKPACT_CYBER_SALT_2026';

export const createClientPayloadSignature = async (
  userId: string,
  pactContent: string,
  deviceTimestamp: string,
  salt: string = APP_SALT,
): Promise<string> => {
  const payload = `${userId}:${pactContent}:${deviceTimestamp}:${salt}`;
  const textEncoder = new TextEncoder();
  const encodedPayload = textEncoder.encode(payload);

  if (typeof globalThis !== 'undefined' && typeof globalThis.crypto !== 'undefined' && 'subtle' in globalThis.crypto) {
    try {
      const digest = await globalThis.crypto.subtle.digest('SHA-256', encodedPayload);
      return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fall back to deterministic local hashing when Web Crypto is unavailable.
    }
  }

  let hash = 0;
  for (let index = 0; index < payload.length; index += 1) {
    hash = (hash << 5) - hash + payload.charCodeAt(index);
    hash |= 0;
  }

  return hash.toString(16);
};

export type PeakPactProfile = {
  id?: string;
  user_id: string;
  level: number;
  pp: number;
  streak: number;
  red_state: boolean;
  last_pact_date: string;
  active_pact_deadline?: string | null;
  extensions_used?: number;
  updated_at: string;
  xp?: number;
};

export type PactHistoryEntry = {
  id?: string;
  user_id: string;
  content: string;
  result: string;
  pp_awarded: number;
  created_at: string;
  synced: boolean;
  signature?: string;
  device_timestamp?: string;
  active_pact_deadline?: string | null;
  extensions_used?: number;
};

export type SupabaseProfilePayload = {
  user_id: string;
  level: number;
  pp: number;
  streak: number;
  red_state: boolean;
  last_pact_date: string;
  updated_at: string;
  xp?: number;
};

export type SupabaseHistoryPayload = {
  user_id: string;
  content: string;
  result: string;
  pp_awarded: number;
  created_at: string;
  synced: boolean;
  signature?: string;
  device_timestamp?: string;
};

const USER_ID = 'local-user';
const PROFILE_STORAGE_KEY = '@peakpact/profile';
const HISTORY_STORAGE_KEY = '@peakpact/history';

let remoteSyncStatus: boolean | null = null;
let remoteSyncPromise: Promise<boolean> | null = null;

const isBackendConfigured = () => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

  return Boolean(url && key && !url.includes('your-project') && !key.includes('demo-key'));
};

const canUseRemoteSync = async (): Promise<boolean> => {
  if (remoteSyncStatus === true) {
    return true;
  }

  if (remoteSyncStatus === false) {
    return false;
  }

  if (remoteSyncPromise) {
    return remoteSyncPromise;
  }

  remoteSyncPromise = (async () => {
    if (!isBackendConfigured()) {
      remoteSyncStatus = false;
      return false;
    }

    try {
      const { error } = await supabase.from('user_profiles').select('user_id').limit(1);
      const available = !error;
      remoteSyncStatus = available;
      return available;
    } catch {
      remoteSyncStatus = false;
      return false;
    }
  })();

  return remoteSyncPromise;
};

const readStoredJson = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const storedValue = await AsyncStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) as T : fallback;
  } catch {
    return fallback;
  }
};

const writeStoredJson = async <T>(key: string, value: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures and keep the app working offline.
  }
};

const getLocalProfile = async (): Promise<PeakPactProfile | null> => {
  const stored = await readStoredJson<PeakPactProfile | null>(PROFILE_STORAGE_KEY, null);
  return stored;
};

const saveLocalProfile = async (profile: PeakPactProfile): Promise<PeakPactProfile> => {
  await writeStoredJson(PROFILE_STORAGE_KEY, profile);
  return profile;
};

const getLocalHistory = async (): Promise<Array<PactHistoryEntry>> => {
  const stored = await readStoredJson<Array<PactHistoryEntry>>(HISTORY_STORAGE_KEY, []);
  return stored ?? [];
};

const appendLocalHistory = async (entry: PactHistoryEntry): Promise<PactHistoryEntry> => {
  const history = await getLocalHistory();
  const nextHistory = [...history, entry];
  await writeStoredJson(HISTORY_STORAGE_KEY, nextHistory);
  return entry;
};

export const getLevelFromXP = (xp: number): number => {
  if (xp <= 499) {
    return 1;
  }

  if (xp < 1500) {
    return 2 + Math.floor((xp - 500) / 500);
  }

  return Math.min(99, Math.floor(xp / 500));
};

export const getXpForPactStake = (stakePP: number): number => stakePP * 100;

export const canAccessFounderPrivileges = ({ level, pp }: { level: number; pp: number }): boolean => level >= 99 && pp >= 50000;

export const createSupabaseProfilePayload = (profile: Partial<PeakPactProfile>): SupabaseProfilePayload => ({
  user_id: profile.user_id ?? USER_ID,
  level: profile.level ?? 1,
  pp: profile.pp ?? 0,
  streak: profile.streak ?? 0,
  red_state: profile.red_state ?? false,
  last_pact_date: profile.last_pact_date ?? new Date().toISOString().slice(0, 10),
  updated_at: profile.updated_at ?? new Date().toISOString(),
});

export const createSupabaseHistoryPayload = (entry: Partial<PactHistoryEntry>): SupabaseHistoryPayload => ({
  user_id: entry.user_id ?? USER_ID,
  content: entry.content ?? '',
  result: entry.result ?? 'No result',
  pp_awarded: entry.pp_awarded ?? 0,
  created_at: entry.created_at ?? new Date().toISOString(),
  synced: entry.synced ?? true,
  signature: entry.signature,
  device_timestamp: entry.device_timestamp,
});

export const loadUserProfile = async (): Promise<PeakPactProfile | null> => {
  const localProfile = await getLocalProfile();
  if (localProfile) {
    return localProfile;
  }

  if (!(await canUseRemoteSync())) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', USER_ID)
      .maybeSingle();

    if (error || !data) {
      remoteSyncStatus = false;
      return null;
    }

    const hydratedProfile = data as PeakPactProfile;
    await saveLocalProfile(hydratedProfile);
    return hydratedProfile;
  } catch {
    remoteSyncStatus = false;
    return null;
  }
};

export const saveUserProfile = async (profile: Partial<PeakPactProfile>): Promise<PeakPactProfile | null> => {
  const payload: PeakPactProfile = {
    user_id: USER_ID,
    level: profile.level ?? 1,
    pp: profile.pp ?? 0,
    streak: profile.streak ?? 0,
    red_state: profile.red_state ?? false,
    last_pact_date: profile.last_pact_date ?? new Date().toISOString().slice(0, 10),
    active_pact_deadline: profile.active_pact_deadline ?? null,
    extensions_used: profile.extensions_used ?? 0,
    updated_at: profile.updated_at ?? new Date().toISOString(),
    xp: profile.xp ?? 0,
  };

  const remotePayload = createSupabaseProfilePayload(payload);

  await saveLocalProfile(payload);

  if (!(await canUseRemoteSync())) {
    return payload;
  }

  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert(remotePayload, { onConflict: 'user_id' });

    if (error) {
      remoteSyncStatus = false;
      return payload;
    }

    return payload;
  } catch {
    remoteSyncStatus = false;
    return payload;
  }
};

export const appendPactHistory = async (entry: Partial<PactHistoryEntry>): Promise<PactHistoryEntry | null> => {
  const payload: PactHistoryEntry = {
    user_id: USER_ID,
    content: entry.content ?? '',
    result: entry.result ?? 'No result',
    pp_awarded: entry.pp_awarded ?? 0,
    created_at: entry.created_at ?? new Date().toISOString(),
    synced: entry.synced ?? true,
    signature: entry.signature,
    device_timestamp: entry.device_timestamp,
    active_pact_deadline: entry.active_pact_deadline ?? null,
    extensions_used: entry.extensions_used ?? 0,
  };

  const remotePayload = createSupabaseHistoryPayload(payload);

  await appendLocalHistory(payload);

  if (!(await canUseRemoteSync())) {
    return payload;
  }

  try {
    const { error } = await supabase
      .from('pact_history')
      .insert(remotePayload);

    if (error) {
      remoteSyncStatus = false;
      return payload;
    }

    return payload;
  } catch {
    remoteSyncStatus = false;
    return payload;
  }
};

export const syncProgressToSupabase = async (
  profile: Partial<PeakPactProfile>,
  historyEntries: Array<Partial<PactHistoryEntry>> = []
) => {
  const [savedProfile, ...savedHistory] = await Promise.all([
    saveUserProfile(profile),
    ...historyEntries.map((entry) => appendPactHistory(entry)),
  ]);

  return {
    profile: savedProfile,
    history: savedHistory,
  };
};
=======
export function appendPactHistory() {
  return;
}

export function canAccessFounderPrivileges({ level, pp }: { level: number; pp: number }) {
  return level >= 50 || pp >= 10000;
}

export async function createClientPayloadSignature(userId: string, text: string, timestamp?: string) {
  return `sig-${userId}-${Math.round(Date.now() / 1000)}`;
}

export function getLevelFromXP(xp: number) {
  return Math.max(1, Math.floor(xp / 1000) + 1);
}

export function getXpForPactStake(stakePP: number) {
  return Math.max(0, stakePP * 10);
}

export async function loadUserProfile(): Promise<
  | {
      pp: number;
      level: number;
      xp?: number;
      streak: number;
      last_pact_date?: string;
      active_pact_deadline?: string;
      extensions_used?: number;
      red_state: boolean;
    }
  | null
> {
  return null;
}

export async function saveUserProfile(profile: Record<string, unknown>) {
  return;
}

export async function syncProgressToSupabase(progress: Record<string, unknown>, records: Record<string, unknown>[]) {
  return;
}
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
