<<<<<<< HEAD
export type ProtocolArchetype = {
  name: string;
  description: string;
  accent: string;
};

export type ProtocolStatusEffect = 'NONE' | 'DRIFT' | 'FRACTURE' | 'OVERCLOCK';

export const DAILY_STABILIZATION_LIMIT = 3;
export const DAILY_STABILIZATION_COST_PP = 10;

export type ProtocolContext = {
  pp: number;
  streak: number;
  redState: boolean;
  overclockCount: number;
  extensionsUsed: number;
};

export const deriveProtocolArchetype = (context: ProtocolContext): ProtocolArchetype => {
  const isHighRisk = context.overclockCount >= 3 || context.extensionsUsed >= 2;
  const isSteady = context.streak >= 4 && context.redState === false && context.overclockCount <= 1;

  if (isSteady) {
    return {
      name: 'STEADY NODE',
      description: 'A disciplined operator who favors stable execution over reckless escalation.',
      accent: '#00FF00',
    };
  }

  if (isHighRisk) {
    return {
      name: 'IRON OVERCLOCKER',
      description: 'A high-risk operator who turns pressure into momentum and overclocking into power.',
      accent: '#FFB000',
    };
  }

  return {
    name: 'ADAPTIVE PILOT',
    description: 'A flexible protocol runner whose behavior shifts with the current pressure.',
    accent: '#00FF00',
  };
};

export const getProtocolStatusEffect = (context: ProtocolContext): ProtocolStatusEffect => {
  if (context.redState) {
    return 'FRACTURE';
  }

  if (context.overclockCount >= 2) {
    return 'OVERCLOCK';
  }

  if (context.pp < 40) {
    return 'DRIFT';
  }

  return 'NONE';
};

export const evaluateFocusLockViolation = ({
  appState,
  activeContract,
  hasRedState,
}: {
  appState: 'active' | 'background' | 'inactive';
  activeContract: boolean;
  hasRedState: boolean;
}): { penaltyPP: number; redState: boolean; terminalLine: string } => {
  if (appState !== 'background' || !activeContract) {
    return {
      penaltyPP: 0,
      redState: hasRedState,
      terminalLine: '> FOCUS LOCK: NO BREACH DETECTED.',
    };
  }

  return {
    penaltyPP: 25,
    redState: true,
    terminalLine: '> DIGITAL OVERRIDE DETECTED. NEURAL LINK SEVERED. CONTRACT VOIDED.',
  };
};

export const getStabilizationUsageState = ({
  usedToday,
  resetDate,
  now,
}: {
  usedToday: number;
  resetDate: string;
  now: Date;
}): { remaining: number; canUse: boolean; resetDate: string } => {
  const currentDayKey = now.toISOString().slice(0, 10);
  const resetDayKey = resetDate.slice(0, 10);
  const isNewDay = currentDayKey !== resetDayKey;

  if (isNewDay) {
    return {
      remaining: DAILY_STABILIZATION_LIMIT,
      canUse: true,
      resetDate: currentDayKey,
    };
  }

  const remaining = Math.max(0, DAILY_STABILIZATION_LIMIT - usedToday);
  return {
    remaining,
    canUse: remaining > 0,
    resetDate,
  };
};

export const applyRecoveryAction = ({
=======
export const DAILY_STABILIZATION_COST_PP = 15;
export const DAILY_STABILIZATION_LIMIT = 3;

export function applyRecoveryAction({
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
  pp,
  redState,
  stabilizationUsesToday,
  resetDate,
  now,
<<<<<<< HEAD
  costPP = DAILY_STABILIZATION_COST_PP,
=======
  costPP,
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
}: {
  pp: number;
  redState: boolean;
  stabilizationUsesToday: number;
  resetDate: string;
  now: Date;
<<<<<<< HEAD
  costPP?: number;
}): {
  applied: boolean;
  nextPP: number;
  nextRedState: boolean;
  nextFlashSuppressed: boolean;
  nextStabilizationUsesToday: number;
  remaining: number;
  resetDate: string;
} => {
  const usageState = getStabilizationUsageState({ usedToday: stabilizationUsesToday, resetDate, now });

  if (!redState || !usageState.canUse || pp < costPP) {
    return {
      applied: false,
      nextPP: pp,
      nextRedState: redState,
      nextFlashSuppressed: false,
      nextStabilizationUsesToday: stabilizationUsesToday,
      remaining: usageState.remaining,
      resetDate: usageState.resetDate,
    };
  }

  const nextUsesToday = stabilizationUsesToday + 1;

  return {
    applied: true,
    nextPP: pp - costPP,
    nextRedState: false,
    nextFlashSuppressed: true,
    nextStabilizationUsesToday: nextUsesToday,
    remaining: Math.max(0, DAILY_STABILIZATION_LIMIT - nextUsesToday),
    resetDate: usageState.resetDate,
  };
};

export const consumeStabilization = ({
  usedToday,
  resetDate,
  now,
}: {
  usedToday: number;
  resetDate: string;
  now: Date;
}): { consumed: boolean; remaining: number; resetDate: string } => {
  const state = getStabilizationUsageState({ usedToday, resetDate, now });
  if (!state.canUse) {
    return {
      consumed: false,
      remaining: state.remaining,
      resetDate: state.resetDate,
    };
  }

  return {
    consumed: true,
    remaining: Math.max(0, state.remaining - 1),
    resetDate: state.resetDate,
  };
};

export const applyStatusEffectToReward = ({
  baseReward,
  effect,
}: {
  baseReward: number;
  effect: ProtocolStatusEffect;
}): number => {
  if (effect === 'DRIFT') {
    return Math.max(0, baseReward - 3);
  }

  if (effect === 'FRACTURE') {
    return Math.max(0, baseReward - 5);
  }

  if (effect === 'OVERCLOCK') {
    return Math.max(0, baseReward + 2);
  }

  return baseReward;
};
=======
  costPP: number;
  }): {
  applied: boolean;
  nextPP: number;
  nextStabilizationUsesToday: number;
  resetDate: string;
  nextFlashSuppressed: boolean;
  nextRedState: boolean;
  remaining: number;
} {
  const sameDay = resetDate === now.toISOString().slice(0, 10);
  const uses = sameDay ? stabilizationUsesToday + 1 : 1;
  const applied = redState && uses <= DAILY_STABILIZATION_LIMIT && pp >= costPP;
  return {
    applied,
    nextPP: applied ? Math.max(0, pp - costPP) : pp,
    nextStabilizationUsesToday: uses,
    resetDate: now.toISOString().slice(0, 10),
    nextFlashSuppressed: applied,
    nextRedState: applied ? false : redState,
    remaining: Math.max(0, DAILY_STABILIZATION_LIMIT - uses),
  };
}

export function applyStatusEffectToReward({ baseReward, effect }: { baseReward: number; effect: string; }) {
  if (effect === "OVERCLOCK") {
    return Math.floor(baseReward * 1.1);
  }
  return baseReward;
}

export function consumeStabilization() {
  return;
}

export function deriveProtocolArchetype({ pp, streak, redState, overclockCount, extensionsUsed, }: { pp: number; streak: number; redState: boolean; overclockCount: number; extensionsUsed: number; }) {
  if (redState) {
    return { name: "FRACTURED RUNNER", description: "Operating under duress with emergency protocols." };
  }
  if (pp > 200) {
    return { name: "OPTIMAL COMMAND", description: "Steady, disciplined, and mission-focused." };
  }
  return { name: "ADAPTIVE PILOT", description: "A flexible protocol runner whose behavior shifts with pressure." };
}

export function evaluateFocusLockViolation({ appState, activeContract, hasRedState, }: { appState: string; activeContract: boolean; hasRedState: boolean; }) {
  return {
    penaltyPP: activeContract && appState === "background" ? 10 : 0,
    terminalLine: activeContract && appState === "background" ? "> FOCUS LOCK VIOLATION DETECTED." : "> FOCUS LOCK STABLE.",
  };
}

export function getProtocolStatusEffect({ pp, streak, redState, overclockCount, extensionsUsed, }: { pp: number; streak: number; redState: boolean; overclockCount: number; extensionsUsed: number; }) {
  if (redState) {
    return "FRACTURE";
  }
  if (pp > 300) {
    return "OVERCLOCK";
  }
  return "NONE";
}

export function getStabilizationUsageState({ usedToday, resetDate, now, }: { usedToday: number; resetDate: string; now: Date; }) {
  const currentDay = now.toISOString().slice(0, 10);
  const remaining = resetDate === currentDay ? Math.max(0, DAILY_STABILIZATION_LIMIT - usedToday) : DAILY_STABILIZATION_LIMIT;
  return {
    canUse: remaining > 0,
    remaining,
  };
}
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
