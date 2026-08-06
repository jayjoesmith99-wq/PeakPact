<<<<<<< HEAD
export type DailySweepResult = {
  redState: boolean;
  status: 'ACTIVE' | 'ALERT' | 'REDSTATE';
  penalty: number;
  lastPactDate: string;
};

export const evaluateDailySweep = ({
  lastPactDate,
  today,
  currentRedState,
}: {
  lastPactDate: string;
  today: string;
  currentRedState: boolean;
}): DailySweepResult => {
  if (lastPactDate === today) {
    return {
      redState: currentRedState,
      status: currentRedState ? 'REDSTATE' : 'ACTIVE',
      penalty: 0,
      lastPactDate: today,
    };
  }

  const missedDays = Math.max(1, Math.round((Date.parse(today) - Date.parse(lastPactDate)) / 86400000));
  const penalty = Math.min(25, missedDays * 10);

  return {
    redState: false,
    status: penalty > 0 ? 'ALERT' : 'ACTIVE',
    penalty,
    lastPactDate: today,
  };
};
=======
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
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
