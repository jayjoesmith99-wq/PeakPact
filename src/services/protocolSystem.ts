export const DAILY_STABILIZATION_COST_PP = 15;
export const DAILY_STABILIZATION_LIMIT = 3;

export function applyRecoveryAction({
  pp,
  redState,
  stabilizationUsesToday,
  resetDate,
  now,
  costPP,
}: {
  pp: number;
  redState: boolean;
  stabilizationUsesToday: number;
  resetDate: string;
  now: Date;
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
