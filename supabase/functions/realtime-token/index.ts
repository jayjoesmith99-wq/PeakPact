import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', ...corsHeaders },
});

const getAuthenticatedUser = async (req: { headers: Headers }) => {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return null;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authorization } } },
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  return error ? null : user;
};

const allowedVoices = new Set(['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse']);

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  if (!await getAuthenticatedUser(req)) {
    return json({ error: 'Authentication required' }, 401);
  }

  const openAiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAiKey) {
    return json({ error: 'Realtime voice is not configured' }, 503);
  }

  try {
    const body = await req.json() as { voice?: string };
    const voice = allowedVoices.has(body.voice ?? '') ? body.voice : 'sage';
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'gpt-realtime',
          audio: { output: { voice } },
        },
      }),
    });

    if (!response.ok) {
      console.error('OpenAI Realtime client-secret request failed', response.status);
      return json({ error: 'Realtime voice is temporarily unavailable' }, 502);
    }

    const session = await response.json() as { value?: string; expires_at?: number };
    if (!session.value) {
      return json({ error: 'Realtime voice secret was unavailable' }, 502);
    }

    return json({ value: session.value, expires_at: session.expires_at });
  } catch (error) {
    console.error('Realtime token request failed', error);
    return json({ error: 'Realtime voice request failed' }, 500);
  }
});