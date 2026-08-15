import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const response = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', ...corsHeaders },
});

const getAuthenticatedUser = async (req: { headers: Headers }) => {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return null;

  const client = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authorization } } },
  );
  const { data: { user }, error } = await client.auth.getUser();
  return error ? null : user;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return response({ error: 'Method not allowed' }, 405);

  const user = await getAuthenticatedUser(req);
  if (!user) return response({ error: 'Authentication required' }, 401);

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!serviceRoleKey || !supabaseUrl) {
    return response({ error: 'Account deletion is not configured' }, 503);
  }

  try {
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return response({ error: 'Account deletion failed' }, 500);
    return response({ ok: true });
  } catch {
    return response({ error: 'Account deletion failed' }, 500);
  }
});
