import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
};

type VerificationResponse = {
  verified: boolean;
  pp_awarded: number;
  terminal_response: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  attribute_scale: string;
};

const systemPrompt = (content: string, contract?: VerificationRequest['contract']) => `You are the PeakPact Captain Overseer. Evaluate report: "${content}" against contract: "${contract?.task ?? 'NO CONTRACT'}". Match the language of the input. Use a strict cyber-industrial terminal tone. Reject vague contracts. Reject reports that do not match the contracted activity. Award PP only when the reported effort is specific, realistic, and aligned with the contract.`;

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
    const body = (await req.json()) as VerificationRequest;
    const content = body.content ?? '';
    const prompt = systemPrompt(content, body.contract);
    const result = heuristics(content, body.contract);

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

    return new Response(JSON.stringify({ ...result, system_prompt: prompt }), {
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
