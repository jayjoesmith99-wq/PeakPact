import type { SupportedLanguage } from './i18n';

export type PactContract = {
  task: string;
  durationMinutes: number;
  stakePP: number;
  acceptedAt: string;
};

export type VerificationResult = {
  verified: boolean;
  pp_awarded: number;
  terminal_response: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  attribute_scale: string;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';

export const generatePayloadSignature = (userId: string, content: string, timestamp: string): string => {
  const value = `${userId}:${content}:${timestamp}:PEAKPACT_CYBER_SALT_2026`;
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return hash.toString(16);
};

const normalizeVerificationText = (input: string): string =>
  input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

const isHungarianInput = (input: string): boolean => {
  const normalized = normalizeVerificationText(input);
  return /\b(edzes|edz|edzés|futas|futás|futast|futást|futok|tanulas|tanulás|tanulok|olvastam|olvasas|olvasás|befejeztem|perc|perces|kodolas|kódolás|programozas|programozás|gyakorlat)\b/.test(normalized);
};

const strengthKeywords = ['heavy lifting', 'deadlift', 'squat', 'bench', 'press', 'workout', 'gym', 'sulyzo', 'sulyemeles', 'edzes', 'edz', 'gimnasztika', 'pesas', 'levantamiento', 'musculacion', 'musculation', 'krafttraining', 'treino', 'treinamento', 'halter', 'тренировка', 'подъём', 'силовая'];
const cardioKeywords = ['run', 'jog', 'cardio', 'sprint', 'bike', 'futas', 'futast', 'futok', 'bringazas', 'kardio', 'correr', 'carrera', 'corrí', 'running', 'course', 'lauf', 'cycling', 'ciclismo', 'vélo', 'corrida', 'correndo', 'ciclismo', 'бег', 'бегал', 'велосипед', 'кардио'];
const disciplineKeywords = ['study', 'read', 'learn', 'code', 'debug', 'build', 'write', 'tanulas', 'tanulok', 'olvasas', 'olvastam', 'kodolas', 'programozas', 'programozok', 'estudi', 'estudie', 'estudié', 'estudio', 'leer', 'leí', 'aprendí', 'aprendizaje', 'escribir', 'escribí', 'escritura', 'lecture', 'étudier', 'étudié', 'lecture', 'écrire', 'schreiben', 'lernen', 'gelernt', 'studieren', 'studierte', 'leggere', 'studio', 'scrivere', 'imparare', 'imparato', 'estudar', 'estudei', 'aprendi', 'escrever', 'leitura', 'escrita', 'изучал', 'учился', 'читал', 'писал', 'чтение', 'письмо', 'учеба'];
const vaguePhrases = ['no idea', 'nincs otlet', 'semm', 'nothing', 'nothing today', 'i have no idea', 'nincsen otlet', 'nem tudom', 'don\'t know', 'something productive', 'maybe later', 'valami', 'no se', 'nada', 'quizá luego', 'maybe', 'peut-être', 'vielleicht', 'forse', 'não sei', 'nada', 'talvez depois', 'не знаю', 'может позже', 'ничего'];
const concreteActionMarkers = ['completed', 'finished', 'done', 'went', 'ran', 'studied', 'read', 'wrote', 'coded', 'built', 'debugged', 'lifted', 'worked out', 'trained', 'practiced', 'terminé', 'acabé', 'estudié', 'leí', 'escribí', 'codifiqué', 'construí', 'corrí', 'entraîné', 'lu', 'écrit', 'programmiert', 'gelernt', 'studiert', 'trainiert', 'прочитал', 'писал', 'изучал', 'проделал', 'бегал', 'тренировался'];
const measurableDurationPatterns = /(\d+)\s*(?:min|minute|minutes|mins|hr|hour|hours|perc|perces|percet|percek|óra|órát|h|m|minut|minuta|minutos|minuti|мин|час|часа|часов|минут|минуты|分|時間|間|分間|分钟|小时)/i;

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

const getLocalizedVerificationMessage = (language: SupportedLanguage, kind: 'contract' | 'impossible' | 'vagueContract' | 'vaguePact' | 'mismatch' | 'fallback' | 'validated', fallbackPoints?: number, ppAwarded?: number): string => {
  const translations = {
    en: {
      contract: '> ACTION REJECTED. THIS PACT MUST BE ACCEPTED AS A CONTRACT FIRST. TASK, DURATION, AND STAKE ARE REQUIRED.',
      impossible: '> ACTION REJECTED. DISCIPLINE BREACH. PHYSICAL SANITY FILTER TRIGGERED. REDSTATE LOCKDOWN.',
      vagueContract: '> ACTION REJECTED. THE CONTRACT IS TOO VAGUE OR NOT VERIFIABLE. NO PP AWARDED.',
      vaguePact: '> ACTION REJECTED. NO CONCRETE EFFORT DESCRIBED. NO PP AWARDED.',
      mismatch: '> ACTION REJECTED. REPORTED ACTIVITY DOES NOT MATCH THE CONTRACT.',
      fallback: fallbackPoints && fallbackPoints > 0
        ? `> ACTION VALIDATED. BASELINE EFFORT ACCEPTED. +${fallbackPoints} PP.`
        : '> ACTION REJECTED. NO CONCRETE EFFORT DESCRIBED. NO PP AWARDED.',
      validated: `> ACTION VALIDATED. STR ATTRIBUTE SCALED. +${ppAwarded ?? 0} PP.`,
    },
    es: {
      contract: '> ACCIÓN RECHAZADA. ESTE PACTO DEBE ACEPTARSE PRIMERO COMO CONTRATO. SE REQUIEREN TAREA, DURACIÓN Y APUESTA.',
      impossible: '> ACCIÓN RECHAZADA. VIOLACIÓN DE DISCIPLINA. SE ACTIVÓ EL FILTRO DE SANIDAD FÍSICA. BLOQUEO DE REDSTATE.',
      vagueContract: '> ACCIÓN RECHAZADA. EL CONTRATO ES DEMASIADO VAGO O NO VERIFICABLE. NO SE OTORGA PP.',
      vaguePact: '> ACCIÓN RECHAZADA. NO SE DESCRIBE UN ESFUERZO CONCRETO. NO SE OTORGA PP.',
      mismatch: '> ACCIÓN RECHAZADA. LA ACTIVIDAD REPORTADA NO COINCIDE CON EL CONTRATO.',
      fallback: fallbackPoints && fallbackPoints > 0
        ? `> ACCIÓN VALIDADA. ESFUERZO BASE ACEPTADO. +${fallbackPoints} PP.`
        : '> ACCIÓN RECHAZADA. NO SE DESCRIBE UN ESFUERZO CONCRETO. NO SE OTORGA PP.',
      validated: `> ACCIÓN VALIDADA. ATRIBUTO STR ESCALADO. +${ppAwarded ?? 0} PP.`,
    },
    fr: {
      contract: '> ACTION REFUSÉE. CE PACTE DOIT D’ABORD ÊTRE ACCEPTÉ COMME CONTRAT. TÂCHE, DURÉE ET MISE SONT REQUISES.',
      impossible: '> ACTION REFUSÉE. VIOLATION DE DISCIPLINE. LE FILTRE DE SANTÉ PHYSIQUE S’EST DÉCLENCHÉ. VERROUILLAGE REDSTATE.',
      vagueContract: '> ACTION REFUSÉE. LE CONTRAT EST TROP VAGUE OU NON VÉRIFIABLE. AUCUN PP N’EST ATTRIBUÉ.',
      vaguePact: '> ACTION REFUSÉE. AUCUN EFFORT CONCRET N’EST DÉCRIT. AUCUN PP N’EST ATTRIBUÉ.',
      mismatch: '> ACTION REFUSÉE. L’ACTIVITÉ RAPPORTÉE NE CORRESPOND PAS AU CONTRAT.',
      fallback: fallbackPoints && fallbackPoints > 0
        ? `> ACTION VALIDÉE. EFFORT DE BASE ACCEPTÉ. +${fallbackPoints} PP.`
        : '> ACTION REFUSÉE. AUCUN EFFORT CONCRET N’EST DÉCRIT. AUCUN PP N’EST ATTRIBUÉ.',
      validated: `> ACTION VALIDÉE. ATTRIBUT STR MIS À L’ÉCHELLE. +${ppAwarded ?? 0} PP.`,
    },
    pt: {
      contract: '> AÇÃO RECUSADA. ESTE PACTO DEVE SER ACEITE PRIMEIRO COMO CONTRATO. TAREFA, DURAÇÃO E APOSTA SÃO NECESSÁRIAS.',
      impossible: '> AÇÃO RECUSADA. VIOLAÇÃO DE DISCIPLINA. O FILTRO DE SAÚDE FÍSICA FOI ATIVADO. BLOQUEIO REDSTATE.',
      vagueContract: '> AÇÃO RECUSADA. O CONTRATO É MUITO VAGO OU NÃO VERIFICÁVEL. NENHUM PP FOI ATRIBUÍDO.',
      vaguePact: '> AÇÃO RECUSADA. NENHUM ESFORÇO CONCRETO FOI DESCRITO. NENHUM PP FOI ATRIBUÍDO.',
      mismatch: '> AÇÃO RECUSADA. A ATIVIDADE REPORTADA NÃO CORRESPONDE AO CONTRATO.',
      fallback: fallbackPoints && fallbackPoints > 0
        ? `> AÇÃO VALIDADA. ESFORÇO BASE ACEITE. +${fallbackPoints} PP.`
        : '> AÇÃO RECUSADA. NENHUM ESFORÇO CONCRETO FOI DESCRITO. NENHUM PP FOI ATRIBUÍDO.',
      validated: `> AÇÃO VALIDADA. ATRIBUTO STR ESCALADO. +${ppAwarded ?? 0} PP.`,
    },
    de: {
      contract: '> AKTION ABGELEHNT. DIESER PAKT MUSS ZUERST ALS VERTRAG AKZEPTIERT WERDEN. AUFGABE, DAUER UND EINSATZ SIND ERFORDERLICH.',
      impossible: '> AKTION ABGELEHNT. DISCIPLINVERSTOSS. DER PHYSISCHE SANITÄTSFILTER WURDE AUSGELÖST. REDSTATE-SPERRE.',
      vagueContract: '> AKTION ABGELEHNT. DER VERTRAG IST ZU UNGENAU ODER NICHT VERIFIZIERBAR. KEINE PP VERGÜTET.',
      vaguePact: '> AKTION ABGELEHNT. KEIN KONKRETER EINSATZ BESCHRIEBEN. KEINE PP VERGÜTET.',
      mismatch: '> AKTION ABGELEHNT. DER GEMELDETE EINSATZ STIMMT NICHT MIT DEM VERTRAG ÜBEREIN.',
      fallback: fallbackPoints && fallbackPoints > 0
        ? `> AKTION VALIDIERT. BASIS-EINSATZ AKZEPTIERT. +${fallbackPoints} PP.`
        : '> AKTION ABGELEHNT. KEIN KONKRETER EINSATZ BESCHRIEBEN. KEINE PP VERGÜTET.',
      validated: `> AKTION VALIDIERT. STR-ATTRIBUT SKALIERT. +${ppAwarded ?? 0} PP.`,
    },
    ru: {
      contract: '> ДЕЙСТВИЕ ОТКЛОНЕНО. ЭТОТ ПАКТ СНАЧАЛА ДОЛЖЕН БЫТЬ ПРИНЯТ КАК КОНТРАКТ. НУЖНЫ ЗАДАЧА, ДЛИТЕЛЬНОСТЬ И СТАВКА.',
      impossible: '> ДЕЙСТВИЕ ОТКЛОНЕНО. НАРУШЕНИЕ ДИСЦИПЛИНЫ. АКТИВИРОВАН ФИЛЬТР ФИЗИЧЕСКОЙ БЕЗОПАСНОСТИ. БЛОКИРОВКА REDSTATE.',
      vagueContract: '> ДЕЙСТВИЕ ОТКЛОНЕНО. КОНТРАКТ СЛИШКОМ НЕОПРЕДЕЛЁН ИЛИ НЕПРОВЕРЯЕМ. PP НЕ НАЧИСЛЯЮТСЯ.',
      vaguePact: '> ДЕЙСТВИЕ ОТКЛОНЕНО. КОНКРЕТНЫЕ УСИЛИЯ НЕ ОПИСАНЫ. PP НЕ НАЧИСЛЯЮТСЯ.',
      mismatch: '> ДЕЙСТВИЕ ОТКЛОНЕНО. СООБЩЁННОЕ ДЕЙСТВИЕ НЕ СООТВЕТСТВУЕТ КОНТРАКТУ.',
      fallback: fallbackPoints && fallbackPoints > 0
        ? `> ДЕЙСТВИЕ ПРИНЯТО. БАЗОВЫЕ УСИЛИЯ ПРИНЯТЫ. +${fallbackPoints} PP.`
        : '> ДЕЙСТВИЕ ОТКЛОНЕНО. КОНКРЕТНЫЕ УСИЛИЯ НЕ ОПИСАНЫ. PP НЕ НАЧИСЛЯЮТСЯ.',
      validated: `> ДЕЙСТВИЕ ПРИНЯТО. АТРИБУТ STR МАСШТАБИРОВАН. +${ppAwarded ?? 0} PP.`,
    },
    zh: {
      contract: '> 操作已拒绝。此契约必须先被接受为合同。任务、时长和赌注都是必需的。',
      impossible: '> 操作已拒绝。纪律违规。物理理性过滤器已触发。红色状态封锁。',
      vagueContract: '> 操作已拒绝。合同过于模糊或不可验证。没有 PP 奖励。',
      vaguePact: '> 操作已拒绝。没有描述具体努力。没有 PP 奖励。',
      mismatch: '> 操作已拒绝。报告的活动与合同不匹配。',
      fallback: fallbackPoints && fallbackPoints > 0
        ? `> 操作已验证。基础努力已接受。+${fallbackPoints} PP。`
        : '> 操作已拒绝。没有描述具体努力。没有 PP 奖励。',
      validated: `> 操作已验证。STR 属性已调整。+${ppAwarded ?? 0} PP。`,
    },
    ja: {
      contract: '> アクションが拒否されました。この誓約は先に契約として受理される必要があります。タスク、期間、賭け金が必要です。',
      impossible: '> アクションが拒否されました。規律違反。身体的妥当性フィルターが作動しました。レッドステート封鎖。',
      vagueContract: '> アクションが拒否されました。契約が曖昧すぎるか、確認できません。PPは付与されません。',
      vaguePact: '> アクションが拒否されました。具体的な努力が記述されていません。PPは付与されません。',
      mismatch: '> アクションが拒否されました。報告された活動が契約と一致しません。',
      fallback: fallbackPoints && fallbackPoints > 0
        ? `> アクションが検証されました。基本努力が受理されました。+${fallbackPoints} PP。`
        : '> アクションが拒否されました。具体的な努力が記述されていません。PPは付与されません。',
      validated: `> アクションが検証されました。STR属性がスケーリングされました。+${ppAwarded ?? 0} PP。`,
    },
    ro: {
      contract: '> ACȚIUNEA A FOST RESPINSĂ. ACEST PACT TREBUIE ÎNTÂI ACCEPTAT CA CONTRACT. SUNT NECESARE TASK, DURATĂ ȘI PARIU.',
      impossible: '> ACȚIUNEA A FOST RESPINSĂ. ÎNCĂLCARE A DISCIPLINEI. FILTRUL DE SANITATE FIZICĂ A FOST DECLANȘAT. BLOCARE REDSTATE.',
      vagueContract: '> ACȚIUNEA A FOST RESPINSĂ. CONTRACTUL ESTE PREA VAG SAU INVERIFICABIL. NU SE ACORDA PP.',
      vaguePact: '> ACȚIUNEA A FOST RESPINSĂ. NU A FOST DESCRIS NICIUN EFFORT CONCRET. NU SE ACORDA PP.',
      mismatch: '> ACȚIUNEA A FOST RESPINSĂ. ACTIVITATEA RAPORTATĂ NU COINCIDE CU CONTRACTUL.',
      fallback: fallbackPoints && fallbackPoints > 0
        ? `> ACȚIUNEA A FOST VALIDATĂ. EFORTUL DE BAZĂ A FOST ACCEPTAT. +${fallbackPoints} PP.`
        : '> ACȚIUNEA A FOST RESPINSĂ. NU A FOST DESCRIS NICIUN EFFORT CONCRET. NU SE ACORDA PP.',
      validated: `> ACȚIUNEA A FOST VALIDATĂ. ATRIBUTUL STR A FOST SCALAT. +${ppAwarded ?? 0} PP.`,
    },
    ar: {
      contract: '> تم رفض الإجراء. يجب قبول هذا الاتفاق أولاً كعقد. المطلوب مهمة ومدّة ومبلغ الرهان.',
      impossible: '> تم رفض الإجراء. انتهاك للانضباط. تم تشغيل مرشح الصحة البدنية. قفل REDSTATE.',
      vagueContract: '> تم رفض الإجراء. العقد غير واضح جدًا أو غير قابل للتحقق. لا يتم منح أي PP.',
      vaguePact: '> تم رفض الإجراء. لم يُذكر أي جهد ملموس. لا يتم منح أي PP.',
      mismatch: '> تم رفض الإجراء. النشاط المبلغ عنه لا يطابق العقد.',
      fallback: fallbackPoints && fallbackPoints > 0
        ? `> تم التحقق من الإجراء. تم قبول الجهد الأساسي. +${fallbackPoints} PP.`
        : '> تم رفض الإجراء. لم يُذكر أي جهد ملموس. لا يتم منح أي PP.',
      validated: `> تم التحقق من الإجراء. تم قياس سمة STR. +${ppAwarded ?? 0} PP.`,
    },
    hi: {
      contract: '> क्रिया अस्वीकृत। इस pact को पहले अनुबंध के रूप में स्वीकार किया जाना चाहिए। कार्य, अवधि और दांव आवश्यक हैं।',
      impossible: '> क्रिया अस्वीकृत। अनुशासन उल्लंघन। शारीरिक तर्कशीलता फ़िल्टर सक्रिय हो गया। REDSTATE लॉकडाउन।',
      vagueContract: '> क्रिया अस्वीकृत। अनुबंध बहुत अस्पष्ट है या सत्यापित नहीं किया जा सकता। कोई PP नहीं दिया गया।',
      vaguePact: '> क्रिया अस्वीकृत। कोई ठोस प्रयास वर्णित नहीं है। कोई PP नहीं दिया गया।',
      mismatch: '> क्रिया अस्वीकृत। रिपोर्ट की गई गतिविधि अनुबंध से मेल नहीं खाती।',
      fallback: fallbackPoints && fallbackPoints > 0
        ? `> क्रिया मान्य। बेसलाइन प्रयास स्वीकार किया गया। +${fallbackPoints} PP.`
        : '> क्रिया अस्वीकृत। कोई ठोस प्रयास वर्णित नहीं है। कोई PP नहीं दिया गया।',
      validated: `> क्रिया मान्य। STR गुण स्केल किया गया। +${ppAwarded ?? 0} PP.`,
    },
    ko: {
      contract: '> 작업이 거부되었습니다. 이 pact는 먼저 계약으로 승인되어야 합니다. 작업, 기간, 베팅이 필요합니다.',
      impossible: '> 작업이 거부되었습니다. 규율 위반. 신체적 합리성 필터가 작동했습니다. REDSTATE 잠금.',
      vagueContract: '> 작업이 거부되었습니다. 계약이 너무 모호하거나 확인할 수 없습니다. PP가 지급되지 않습니다.',
      vaguePact: '> 작업이 거부되었습니다. 구체적인 노력이 설명되지 않았습니다. PP가 지급되지 않습니다.',
      mismatch: '> 작업이 거부되었습니다. 보고된 활동이 계약과 일치하지 않습니다.',
      fallback: fallbackPoints && fallbackPoints > 0
        ? `> 작업이 검증되었습니다. 기본 노력이 승인되었습니다. +${fallbackPoints} PP.`
        : '> 작업이 거부되었습니다. 구체적인 노력이 설명되지 않았습니다. PP가 지급되지 않습니다.',
      validated: `> 작업이 검증되었습니다. STR 속성이 스케일되었습니다. +${ppAwarded ?? 0} PP.`,
    },
    it: {
      contract: '> AZIONE RIFIUTATA. QUESTO PATTO DEVE ESSERE ACCETTATO PRIMA COME CONTRATTO. SONO RICHIESTI TASK, DURATA E STAKE.',
      impossible: '> AZIONE RIFIUTATA. VIOLAZIONE DELLA DISCIPLINA. IL FILTRO DI SANITÀ FISICA È STATO ATTIVATO. BLOCCO REDSTATE.',
      vagueContract: '> AZIONE RIFIUTATA. IL CONTRATTO È TROPPO VAGO O NON VERIFICABILE. NESSUN PP ASSEGNATO.',
      vaguePact: '> AZIONE RIFIUTATA. NON È DESCRITTO ALCUNO SFORZO CONCRETO. NESSUN PP ASSEGNATO.',
      mismatch: '> AZIONE RIFIUTATA. L’ATTIVITÀ SEGNALATA NON CORRISPONDE AL CONTRATTO.',
      fallback: fallbackPoints && fallbackPoints > 0
        ? `> AZIONE VALIDATA. SFORZO DI BASE ACCETTATO. +${fallbackPoints} PP.`
        : '> AZIONE RIFIUTATA. NON È DESCRITTO ALCUNO SFORZO CONCRETO. NESSUN PP ASSEGNATO.',
      validated: `> AZIONE VALIDATA. ATTRIBUTO STR SCALATO. +${ppAwarded ?? 0} PP.`,
    },
  } as const;

  return translations[language][kind] ?? translations.en[kind];
};

export const buildStructuredVerification = (input: string, contract?: PactContract, language: SupportedLanguage = 'en'): VerificationResult => {
  const normalized = normalizeVerificationText(input);
  const normalizedContractTask = normalizeVerificationText(contract?.task ?? '');
  const hungarian = isHungarianInput(input) || isHungarianInput(contract?.task ?? '');
  const durationMatch = normalized.match(measurableDurationPatterns);
  const minutes = contract?.durationMinutes ?? (durationMatch ? Number(durationMatch[1]) : 0);

  const distanceMatch = normalized.match(/(\d+)\s*(?:km|kilometers|miles|mi)\b/i);
  const distance = distanceMatch ? Number(distanceMatch[1]) : 0;
  const reportedCategory = inferEffortCategory(normalized);
  const contractCategory = inferEffortCategory(normalizedContractTask);

  const hasContract = Boolean(contract?.task && contract.durationMinutes > 0 && contract.stakePP > 0);
  const hasConcreteEvidence = Boolean(
    durationMatch || distanceMatch || concreteActionMarkers.some((marker) => new RegExp(`\\b${marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(normalized)),
  );

  if (!hasContract) {
    return {
      verified: false,
      pp_awarded: 0,
      terminal_response: hungarian
        ? '> MŰVELET ELUTASÍTVA. A PACTOT ELSŐRE SZERZŐDÉS KÉNT KELL ELFOGADNI. HIÁNYZIK A FELADAT, IDŐTARTAM VAGY PP-ÁR.'
        : getLocalizedVerificationMessage(language, 'contract'),
      severity: 'HIGH',
      attribute_scale: '0',
    };
  }

  const impossibleMetrics =
    (minutes > 0 && distance > 0 && distance / Math.max(1, minutes) > 0.6) ||
    (distance > 100 && minutes < 30) ||
    (minutes > 600);

  if (impossibleMetrics) {
    return {
      verified: false,
      pp_awarded: 0,
      terminal_response: hungarian
        ? '> MŰVELET ELUTASÍTVA. FIZIKAI ÉSSZERŰSÉGI SZŰRŐ AKTÍV. REDSTATE ZÁROLÁS.'
        : getLocalizedVerificationMessage(language, 'impossible'),
      severity: 'HIGH',
      attribute_scale: '0',
    };
  }

  const isVaguePact = vaguePhrases.some((phrase) => normalized.includes(phrase));
  const isVagueContract = vaguePhrases.some((phrase) => normalizedContractTask.includes(phrase));

  if (isVagueContract || !contractCategory) {
    return {
      verified: false,
      pp_awarded: 0,
      terminal_response: hungarian
        ? '> MŰVELET ELUTASÍTVA. A SZERZŐDÉS HOMÁLYOS VAGY NEM ELLENŐRIZHETŐ. NINCS PP-JUTALOM.'
        : getLocalizedVerificationMessage(language, 'vagueContract'),
      severity: 'HIGH',
      attribute_scale: '0',
    };
  }

  if (isVaguePact || !hasConcreteEvidence) {
    return {
      verified: false,
      pp_awarded: 0,
      terminal_response: hungarian
        ? '> MŰVELET ELUTASÍTVA. NEM TARTALMAZ KONKRÉT EFFORTET. NINCS PP-JUTALOM.'
        : getLocalizedVerificationMessage(language, 'vaguePact'),
      severity: 'HIGH',
      attribute_scale: '0',
    };
  }

  if (contractCategory && reportedCategory && contractCategory !== reportedCategory) {
    return {
      verified: false,
      pp_awarded: 0,
      terminal_response: hungarian
        ? '> MŰVELET ELUTASÍTVA. A JELENTETT TEVÉKENYSÉG NEM EGYEZIK A SZERZŐDÉSSEL.'
        : getLocalizedVerificationMessage(language, 'mismatch'),
      severity: 'HIGH',
      attribute_scale: '0',
    };
  }

  if (!reportedCategory) {
    const fallbackPoints = minutes > 0 ? Math.min(10, Math.floor(minutes / 30) + 5) : 0;
    return {
      verified: fallbackPoints > 0,
      pp_awarded: fallbackPoints,
      terminal_response: hungarian
        ? `> MŰVELET ${fallbackPoints > 0 ? 'ÉRVÉNYESÍTVE' : 'ELUTASÍTVA'}. ${fallbackPoints > 0 ? 'ALAPÖSSZEG ZÁRÓ.' : 'NEM TARTALMAZ KONKRÉT EFFORTET.'} ${fallbackPoints > 0 ? `+${fallbackPoints} PP.` : 'NINCS PP-JUTALOM.'}`
        : getLocalizedVerificationMessage(language, 'fallback', fallbackPoints),
      severity: fallbackPoints > 0 ? 'LOW' : 'HIGH',
      attribute_scale: fallbackPoints > 0 ? `+${fallbackPoints}` : '0',
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
      : getLocalizedVerificationMessage(language, 'validated', undefined, ppAwarded),
    severity: minutes >= 45 ? 'HIGH' : 'MEDIUM',
    attribute_scale: `+${ppAwarded}`,
  };
};

export const shouldFallbackToLocalHeuristic = (result: Partial<VerificationResult>): boolean => {
  const response = (result.terminal_response ?? '').toLowerCase();
  return response.includes('signature or timestamp window failed')
    || response.includes('anti-cheat lockout')
    || response.includes('aláírás vagy időablak hiba')
    || response.includes('csalás elleni');
};

export const submitToVerificationEngine = async (
  text: string,
  userId: string = 'local-user',
  deviceTimestamp: string = new Date().toISOString(),
  contract?: PactContract,
): Promise<VerificationResult> => {
  return buildStructuredVerification(text, contract);
};