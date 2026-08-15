import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const unauthorizedResponse = () => new Response(JSON.stringify({ error: 'Authentication required' }), {
  status: 401,
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

const invalidPayloadResponse = (message: string) => new Response(JSON.stringify({ error: message }), {
  status: 400,
  headers: { 'Content-Type': 'application/json', ...corsHeaders },
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  if (!await getAuthenticatedUser(req)) {
    return unauthorizedResponse();
  }

  try {
    const body = await req.json() as { audioUri?: string; type?: string };
    if (body.type !== 'audio') {
      return invalidPayloadResponse('Audio payload type is required');
    }

    const audioUri = body.audioUri?.trim() ?? '';
    if (!audioUri || audioUri.length > 4096) {
      return invalidPayloadResponse('Audio URI is required and must be at most 4096 characters');
    }

    const lowerUri = audioUri.toLowerCase();

    let transcript = 'I completed a focused session and kept my discipline intact.';
    if (lowerUri.includes('workout') || lowerUri.includes('gym')) {
      transcript = 'I completed a disciplined workout session.';
    } else if (lowerUri.includes('study') || lowerUri.includes('read')) {
      transcript = 'I completed a focused study session.';
    } else if (lowerUri.includes('run') || lowerUri.includes('jog')) {
      transcript = 'I completed a running session.';
    }

    return new Response(JSON.stringify({ transcript }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
