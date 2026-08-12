export type ExecutionCoachInput = {
  streak: number;
  level: number;
  xp: number;
  missionsCreatedToday: number;
  missionsCompletedToday: number;
  squadsCount: number;
  redState: boolean;
};

export type ExecutionCoachSnapshot = {
  disciplineScore: number;
  consistencyScore: number;
  focusScore: number;
  recoveryScore: number;
  currentIdentity: 'Builder' | 'Athlete' | 'Scholar' | 'Creator' | 'Leader' | 'Warrior';
  dailyBriefing: string;
  weeklyReview: string;
  patterns: string[];
  recommendations: string[];
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveIdentity(input: ExecutionCoachInput): ExecutionCoachSnapshot['currentIdentity'] {
  if (input.streak >= 30) return 'Leader';
  if (input.level >= 20) return 'Builder';
  if (input.missionsCompletedToday >= 3) return 'Warrior';
  if (input.xp >= 3000) return 'Scholar';
  if (input.squadsCount >= 2) return 'Creator';
  return 'Athlete';
}

export function buildExecutionCoachSnapshot(input: ExecutionCoachInput): ExecutionCoachSnapshot {
  const completionRatio = input.missionsCreatedToday > 0
    ? input.missionsCompletedToday / input.missionsCreatedToday
    : 0;

  const disciplineScore = clamp((input.streak * 2.3) + (input.level * 1.6) + (completionRatio * 30));
  const consistencyScore = clamp((input.streak * 2.5) + (completionRatio * 35));
  const focusScore = clamp((input.missionsCompletedToday * 18) + (input.redState ? -20 : 12));
  const recoveryScore = clamp((input.redState ? 22 : 75) + (input.missionsCompletedToday > 2 ? -6 : 5));

  const identity = resolveIdentity(input);

  const patterns: string[] = [
    input.missionsCompletedToday >= 2
      ? 'Execution momentum is strongest after your first completed mission.'
      : 'Your mission completion velocity is low in the current cycle.',
    input.redState
      ? 'Risk overload is active. Recovery should happen before the next heavy lift.'
      : 'System stability is healthy and ready for a higher difficulty mission.',
    input.squadsCount > 1
      ? 'Social accountability is improving consistency.'
      : 'A second squad can materially improve adherence through visibility.',
  ];

  const recommendations: string[] = [
    completionRatio < 0.7
      ? 'Reduce active mission scope to one critical objective and close it before adding more.'
      : 'Keep your one-mission-at-a-time cadence to preserve completion quality.',
    input.redState
      ? 'Schedule a short recovery block before starting another stake-heavy mission.'
      : 'Use current stability to execute one higher-stake mission in your strongest window.',
    input.streak < 7
      ? 'Protect streak continuity with at least one low-friction completion today.'
      : 'Convert streak momentum into a strategic mission with measurable output.',
  ];

  return {
    disciplineScore,
    consistencyScore,
    focusScore,
    recoveryScore,
    currentIdentity: identity,
    dailyBriefing: `Today you are operating as ${identity}. Complete one decisive mission to strengthen identity alignment.`,
    weeklyReview: `This week your consistency is ${consistencyScore}/100 and focus is ${focusScore}/100. The next gain is in mission completion depth, not mission count.`,
    patterns,
    recommendations,
  };
}
