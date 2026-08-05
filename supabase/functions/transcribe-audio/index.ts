import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

  try {
    const body = await req.json() as { audioUri?: string; type?: string };
    const audioUri = body.audioUri ?? '';
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
