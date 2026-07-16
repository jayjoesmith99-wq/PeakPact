import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vkhychuzirljwsmiswdn.supabase.co';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // We will replace this in a moment

export const supabase = createClient(supabaseUrl, supabaseAnonKey );
