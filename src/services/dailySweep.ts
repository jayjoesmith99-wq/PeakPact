export function evaluateDailySweep({ lastPactDate, today, currentRedState }: { lastPactDate: string; today: string; currentRedState: boolean; }) {
  const last = Date.parse(lastPactDate);
  const current = Date.parse(today);
  const daysMissed = Math.max(0, Math.floor((current - last) / 86400000));
  const penalty = daysMissed > 0 ? Math.min(25, daysMissed * 5) : 0;
  return {
    penalty,
    redState: penalty > 0 || currentRedState,
    lastPactDate: today,
    status: penalty > 0 ? "REDSTATE" : "ACTIVE",
  };
}
