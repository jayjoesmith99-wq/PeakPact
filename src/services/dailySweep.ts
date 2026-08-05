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
