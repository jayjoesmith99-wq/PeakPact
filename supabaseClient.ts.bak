import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vkhychuzirljwsmiswdn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZraHljaHV6aXJsandzbWlzd2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMDcxNTMsImV4cCI6MjA5OTc4MzE1M30.BLRf_5IlR_ywZIYJi69qVbU2ZelxJNtfrRaVvpX9LNk';
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
  Boolean(supabaseUrl)
  && Boolean(supabaseAnonKey)
  && !supabaseUrl.includes('your-project')
  && !supabaseAnonKey.includes('demo-key')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: !isNodeLikeRuntime,
    detectSessionInUrl: !isNodeLikeRuntime,
    storage: isNodeLikeRuntime ? fallbackStorage : AsyncStorage,
  },
});