import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const configuredSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const configuredSupabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseUrl = configuredSupabaseUrl || 'https://placeholder.supabase.co';
const supabaseAnonKey = configuredSupabaseAnonKey || 'placeholder-anon-key';
const isNodeLikeRuntime = typeof window === 'undefined';

const memoryStore = new Map<string, string>();

const fallbackStorage = {
  getItem: async (key: string): Promise<string | null> => memoryStore.get(key) ?? null,
  setItem: async (key: string, value: string): Promise<void> => {
    memoryStore.set(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    memoryStore.delete(key);
  },
};

export const isSupabaseConfigured = (): boolean => (
  Boolean(configuredSupabaseUrl)
  && Boolean(configuredSupabaseAnonKey)
  && !configuredSupabaseUrl.includes('your-project')
  && !configuredSupabaseAnonKey.includes('demo-key')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: !isNodeLikeRuntime,
    detectSessionInUrl: false,
    storage: isNodeLikeRuntime ? fallbackStorage : AsyncStorage,
  },
});