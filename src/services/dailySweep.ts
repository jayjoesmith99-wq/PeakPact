export function evaluateDailySweep({ lastPactDate, today, currentRedState }: { lastPactDate: string; today: string; currentRedState: boolean; }) {
  const last = Number.isFinite(Date.parse(lastPactDate)) ? Date.parse(lastPactDate) : Number.NaN;
  const current = Number.isFinite(Date.parse(today)) ? Date.parse(today) : Number.NaN;

  if (!Number.isFinite(last) || !Number.isFinite(current)) {
    return {
      penalty: 0,
      redState: currentRedState,
      lastPactDate: today,
      status: currentRedState ? 'REDSTATE' : 'ACTIVE',
    };
  }

  const daysMissed = Math.max(0, Math.floor((current - last) / 86400000));
  const penalty = daysMissed > 0 ? Math.min(25, daysMissed * 5) : 0;
  return {
    penalty,
    redState: penalty > 0 || currentRedState,
    lastPactDate: today,
    status: penalty > 0 ? 'REDSTATE' : 'ACTIVE',
  };
}
