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

type VerificationRequest = {
  type?: 'audio' | 'text';
  content?: string;
  createdAt?: string;
  user_id?: string;
  device_timestamp?: string;
  signature?: string;
  contract?: {
    task?: string;
    durationMinutes?: number;
    stakePP?: number;
    acceptedAt?: string;
  };
  proof?: {
    photoPath?: string;
    photoMimeType?: string;
    latitude?: number;
    longitude?: number;
  };
};

type VerificationResponse = {
  verified: boolean;
  pp_awarded: number;
  terminal_response: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  attribute_scale: string;
};

const normalizeText = (text: string): string =>
  text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

const isHungarian = (text: string) => /\b(és|vagy|edzés|futás|futást|futok|tanulás|tanulok|olvastam|olvasás|befejeztem|perc|perces|kódolás|programozás|gyakorlat)\b/i.test(text);

const strengthKeywords = ['heavy lifting', 'deadlift', 'squat', 'bench', 'press', 'workout', 'gym', 'sulyzo', 'sulyemeles', 'edzes', 'gimnasztika', 'pesas', 'levantamiento', 'musculacion', 'musculation', 'krafttraining', 'treino', 'treinamento', 'halter', 'тренировка', 'подъём', 'силовая'];
const cardioKeywords = ['run', 'jog', 'cardio', 'sprint', 'bike', 'futas', 'futast', 'futok', 'bringazas', 'kardio', 'correr', 'carrera', 'corrí', 'running', 'course', 'lauf', 'cycling', 'ciclismo', 'vélo', 'corrida', 'correndo', 'ciclismo', 'бег', 'бегал', 'велосипед', 'кардио'];
const disciplineKeywords = ['study', 'read', 'learn', 'code', 'debug', 'build', 'write', 'tanulas', 'tanulok', 'olvasas', 'olvastam', 'kodolas', 'programozas', 'programozok', 'estudi', 'estudie', 'estudié', 'estudio', 'leer', 'leí', 'aprendí', 'aprendizaje', 'escribir', 'escribí', 'escritura', 'lecture', 'étudier', 'étudié', 'lecture', 'écrire', 'schreiben', 'lernen', 'gelernt', 'studieren', 'studierte', 'leggere', 'studio', 'scrivere', 'imparare', 'imparato', 'estudar', 'estudei', 'aprendi', 'escrever', 'leitura', 'escrita', 'изучал', 'учился', 'читал', 'писал', 'чтение', 'письмо', 'учеба'];
const vaguePhrases = ['no idea', 'nincs otlet', 'semm', 'nothing', 'nothing today', 'i have no idea', 'nincsen otlet', 'nem tudom', 'don\'t know', 'something productive', 'maybe later', 'valami', 'no se', 'nada', 'quizá luego', 'maybe', 'peut-être', 'vielleicht', 'forse', 'não sei', 'nada', 'talvez depois', 'не знаю', 'может позже', 'ничего'];

const inferEffortCategory = (normalized: string): 'STRENGTH' | 'CARDIO' | 'DISCIPLINE' | null => {
  const strengthScore = strengthKeywords.filter((keyword) => normalized.includes(keyword)).length;
  const cardioScore = cardioKeywords.filter((keyword) => normalized.includes(keyword)).length;
  const disciplineScore = disciplineKeywords.filter((keyword) => normalized.includes(keyword)).length;

  const bestScore = Math.max(strengthScore, cardioScore, disciplineScore);
  if (bestScore === 0) {
    return null;
  }

  if (disciplineScore === bestScore) {
    return 'DISCIPLINE';
  }

  if (cardioScore === bestScore) {
    return 'CARDIO';
  }

  if (strengthScore === bestScore) {
    return 'STRENGTH';
  }

  return null;
};

const createSignature = async (userId: string, content: string, deviceTimestamp: string): Promise<string> => {
  const encoder = new TextEncoder();
  const payload = `${userId}:${content}:${deviceTimestamp}:PEAKPACT_CYBER_SALT_2026`;
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(payload));
  return Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const heuristics = (text: string, contract?: VerificationRequest['contract']): VerificationResponse => {
  const normalized = normalizeText(text);
  const normalizedContractTask = normalizeText(contract?.task ?? '');
  const hungarian = isHungarian(text) || isHungarian(contract?.task ?? '');
  const durationMatch = normalized.match(/(\d+)\s*(?:min|minute|minutes|mins|hr|hour|hours|perc|perces|percet|percek|óra|órát)/i);
  const minutes = contract?.durationMinutes ?? (durationMatch ? Number(durationMatch[1]) : 0);

  const distanceMatch = normalized.match(/(\d+)\s*(?:km|kilometers|miles|mi)\b/i);
  const distance = distanceMatch ? Number(distanceMatch[1]) : 0;

  const reportedCategory = inferEffortCategory(normalized);
  const contractCategory = inferEffortCategory(normalizedContractTask);

  const hasContract = Boolean(contract?.task && contract.durationMinutes && contract.stakePP);
  if (!hasContract) {
    return {
      verified: false,
      pp_awarded: 0,
      terminal_response: hungarian
        ? '> MŰVELET ELUTASÍTVA. A PACTOT ELSŐRE SZERZŐDÉS KÉNT KELL ELFOGADNI. HIÁNYZIK A FELADAT, IDŐTARTAM VAGY PP-ÁR.'
        : '> ACTION REJECTED. THIS PACT MUST BE ACCEPTED AS A CONTRACT FIRST. TASK, DURATION, AND STAKE ARE REQUIRED.',
      severity: 'HIGH',
      attribute_scale: '0',
    };
  }

  const impossibleMetrics =
    (minutes > 0 && distance > 0 && distance / Math.max(1, minutes) > 0.6) ||
    (distance > 100 && minutes < 30) ||
    (minutes > 600);

  const isVagueContract = vaguePhrases.some((phrase) => normalizedContractTask.includes(phrase));
  if (isVagueContract || !contractCategory) {
    return {
      verified: false,
      pp_awarded: 0,
      terminal_response: hungarian
        ? '> MŰVELET ELUTASÍTVA. A SZERZŐDÉS HOMÁLYOS VAGY NEM ELLENŐRIZHETŐ. NINCS PP-JUTALOM.'
        : '> ACTION REJECTED. THE CONTRACT IS TOO VAGUE OR NOT VERIFIABLE. NO PP AWARDED.',
      severity: 'HIGH',
      attribute_scale: '0',
    };
  }

  if ((contractCategory && reportedCategory && contractCategory !== reportedCategory) || impossibleMetrics) {
    return {
      verified: false,
      pp_awarded: 0,
      terminal_response: hungarian
        ? '> MŰVELET ELUTASÍTVA. A JELENTETT TEVÉKENYSÉG NEM EGYEZIK A SZERZŐDÉSSEL.'
        : '> ACTION REJECTED. REPORTED ACTIVITY DOES NOT MATCH THE CONTRACT.',
      severity: 'HIGH',
      attribute_scale: '0',
    };
  }

  if (!reportedCategory) {
    return {
      verified: false,
      pp_awarded: 0,
      terminal_response: hungarian
        ? '> MŰVELET ELUTASÍTVA. FIZIKAI ÉSSZERŰSÉGI SZŰRŐ AKTÍV. REDSTATE ZÁROLÁS.'
        : '> ACTION REJECTED. DISCIPLINE BREACH. PHYSICAL SANITY FILTER TRIGGERED. REDSTATE LOCKDOWN.',
      severity: 'HIGH',
      attribute_scale: '0',
    };
  }

  const basePoints = reportedCategory === 'STRENGTH' ? 15 : reportedCategory === 'CARDIO' ? 12 : 10;
  const durationBonus = minutes > 0 ? Math.min(8, Math.floor(minutes / 15)) : 0;
  const ppAwarded = Math.max(contract?.stakePP ?? 0, basePoints + durationBonus);

  return {
    verified: true,
    pp_awarded: ppAwarded,
    terminal_response: hungarian
      ? `> MŰVELET ÉRVÉNYESÍTVE. STR ATTRIBÚTUM SKÁLÁZVA. +${ppAwarded} PP.`
      : `> ACTION VALIDATED. STR ATTRIBUTE SCALED. +${ppAwarded} PP.`,
    severity: minutes >= 45 ? 'HIGH' : 'MEDIUM',
    attribute_scale: `+${ppAwarded}`,
  };
};

const verifyPhotoProof = async (proof: VerificationRequest['proof'], task: string): Promise<boolean> => {
  if (!proof?.photoPath) return true;
  const openAiKey = Deno.env.get('OPENAI_API_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!openAiKey || !serviceRoleKey || !supabaseUrl) {
    throw new Error('Photo verification is not configured on the server');
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const storageClient = (admin as any).storage as {
    from: (bucket: string) => { createSignedUrl: (path: string, expiresIn: number) => Promise<{ data?: { signedUrl?: string }; error?: { message?: string } }> };
  };
  const { data, error } = await storageClient.from('pact-proofs').createSignedUrl(proof.photoPath, 300);
  if (error || !data?.signedUrl) {
    throw new Error(`Photo proof could not be read: ${error?.message ?? 'signed URL unavailable'}`);
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openAiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 20,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: `Does this image provide credible visual evidence for this completed task? Task: ${task}. Reply only MATCH or MISMATCH.` },
          { type: 'image_url', image_url: { url: data.signedUrl } },
        ],
      }],
    }),
  });
  if (!response.ok) throw new Error(`Photo verification failed (${response.status})`);
  const result = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return result.choices?.[0]?.message?.content?.trim().toUpperCase().startsWith('MATCH') ?? false;
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

  const authenticatedUser = await getAuthenticatedUser(req);
  if (!authenticatedUser) {
    return unauthorizedResponse();
  }

  try {
    const body = (await req.json()) as VerificationRequest;
    const content = body.content?.trim() ?? '';
    if (body.type !== 'audio' && body.type !== 'text') {
      return invalidPayloadResponse('Verification type must be audio or text');
    }
    if (!content || content.length > 20000) {
      return invalidPayloadResponse('Verification content is required and must be at most 20000 characters');
    }
    if (!body.createdAt || !Number.isFinite(Date.parse(body.createdAt))) {
      return invalidPayloadResponse('A valid createdAt timestamp is required');
    }
    const createdDay = new Date(body.createdAt).toISOString().slice(0, 10);
    const currentDay = new Date().toISOString().slice(0, 10);
    if (createdDay !== currentDay) {
      return invalidPayloadResponse('Pacts can only be committed for the current day');
    }
    if (body.user_id !== authenticatedUser.id) {
      return new Response(JSON.stringify({ error: 'User identity mismatch' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    const contract = body.contract;
    if (!contract?.task || contract.task.trim().length > 500) {
      return invalidPayloadResponse('A contract task is required and must be at most 500 characters');
    }
    const durationMinutes = contract.durationMinutes;
    const stakePP = contract.stakePP;
    if (typeof durationMinutes !== 'number' || !Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 1440) {
      return invalidPayloadResponse('Contract duration must be an integer from 1 to 1440 minutes');
    }
    if (typeof stakePP !== 'number' || !Number.isInteger(stakePP) || stakePP < 1 || stakePP > 100000) {
      return invalidPayloadResponse('Contract stake must be an integer from 1 to 100000 PP');
    }
    if (body.signature || body.device_timestamp) {
      if (!body.signature || !body.device_timestamp || !Number.isFinite(Date.parse(body.device_timestamp))) {
        return invalidPayloadResponse('Signature and a valid device timestamp must be provided together');
      }
    }
    const result = heuristics(content, body.contract);
    const photoMatches = await verifyPhotoProof(body.proof, contract.task);
    if (!photoMatches) {
      return new Response(JSON.stringify({
        ...result,
        verified: false,
        pp_awarded: 0,
        terminal_response: '> ACTION REJECTED. PHOTO PROOF DOES NOT MATCH THE CONTRACT.',
        severity: 'MEDIUM',
        attribute_scale: '0',
      }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    if (body.user_id && body.device_timestamp && body.signature) {
      const expectedSignature = await createSignature(body.user_id, content, body.device_timestamp);
      const clientTimestamp = Date.parse(body.device_timestamp);
      const now = Date.now();
      const skew = Math.abs(now - clientTimestamp);
      const signatureValid = expectedSignature === body.signature;
      const timestampValid = Number.isFinite(clientTimestamp) && skew <= 15 * 60 * 1000;

      if (!signatureValid || !timestampValid) {
        return new Response(JSON.stringify({
          ...result,
          verified: false,
          pp_awarded: 0,
          terminal_response: isHungarian(content)
            ? '> MŰVELET ELUTASÍTVA. ALÁÍRÁS VAGY IDŐABLAK HIBA. CSALÁS ELLENI ZÁROLÁS AKTÍV.'
            : '> ACTION REJECTED. SIGNATURE OR TIMESTAMP WINDOW FAILED. ANTI-CHEAT LOCKOUT ENGAGED.',
          severity: 'HIGH',
          attribute_scale: '0',
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    return new Response(JSON.stringify(result), {
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
