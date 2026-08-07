export async function ensureDevicePremiumTrialStarted(_storage: unknown): Promise<string | null> {
  return new Date().toISOString();
}

export function getDevicePremiumTrialStatus(startedAt: string | null, now: number) {
  if (!startedAt) {
    return { active: false, remainingDays: 0 };
  }
  const started = Date.parse(startedAt);
  const days = Math.max(0, Math.ceil((now - started) / 86400000));
  const remaining = Math.max(0, 7 - days);
  return { active: remaining > 0, remainingDays: remaining };
}
