import type { ExecutionCoachSnapshot } from './aiExecutionCoach';
import type { FutureSelfSnapshot } from './futureSelfEngine';

export type TransformationReport = {
  period: 'monthly' | 'annual';
  headline: string;
  summary: string;
  highlights: string[];
  shareText: string;
  signal: 'recovering' | 'ascending' | 'dominant';
  kpis: Array<{ label: string; value: string }>;
  strategicMemo: string;
};

export function buildMonthlyTransformationReport(input: {
  codename: string;
  coach: ExecutionCoachSnapshot;
  future: FutureSelfSnapshot;
}): TransformationReport {
  const projection90 = input.future.projections.find((item) => item.windowDays === 90);
  const projection30 = input.future.projections.find((item) => item.windowDays === 30);

  return {
    period: 'monthly',
    headline: `${input.codename} Monthly Executive Brief`,
    summary: `Discipline is ${input.coach.disciplineScore}/100 with a ${input.future.trajectorySignal} trajectory. Consistency and focus remain the main multipliers for next-cycle output quality.`,
    highlights: [
      `30-day vector: Level ${projection30?.projectedLevel ?? '-'} with streak ${projection30?.projectedStreak ?? '-'} (${projection30?.confidenceBand ?? 'stable'} confidence).`,
      `90-day vector: Level ${projection90?.projectedLevel ?? '-'} with discipline ${projection90?.projectedDisciplineScore ?? '-'} and momentum ${projection90?.momentumIndex ?? '-'}.`,
      input.coach.weeklyReview,
    ],
    shareText: `PeakPact Monthly Brief: Discipline ${input.coach.disciplineScore}/100, Focus ${input.coach.focusScore}/100, Trajectory ${input.future.trajectorySignal}, Identity ${input.coach.currentIdentity}.`,
    signal: input.future.trajectorySignal,
    kpis: [
      { label: 'Discipline', value: `${input.coach.disciplineScore}/100` },
      { label: 'Consistency', value: `${input.coach.consistencyScore}/100` },
      { label: 'Focus', value: `${input.coach.focusScore}/100` },
      { label: '90D Level', value: `L${projection90?.projectedLevel ?? '-'}` },
    ],
    strategicMemo: input.future.identityNarrative,
  };
}

export function buildAnnualTransformationReport(input: {
  codename: string;
  coach: ExecutionCoachSnapshot;
  future: FutureSelfSnapshot;
}): TransformationReport {
  const projection365 = input.future.projections.find((item) => item.windowDays === 365);
  const projection90 = input.future.projections.find((item) => item.windowDays === 90);

  return {
    period: 'annual',
    headline: `${input.codename} Annual Transformation Dossier`,
    summary: `Annual projection targets Level ${projection365?.projectedLevel ?? '-'} and discipline ${projection365?.projectedDisciplineScore ?? '-'}/100 with a ${projection365?.confidenceBand ?? 'stable'} confidence profile.`,
    highlights: [
      `Current identity class: ${input.coach.currentIdentity}`,
      `Projected 90-day momentum index: ${projection90?.momentumIndex ?? '-'}`,
      `Projected 365-day streak: ${projection365?.projectedStreak ?? '-'}`,
      projection365?.executionFocus ?? input.coach.recommendations[0],
    ],
    shareText: `PeakPact Annual Dossier: Level ${projection365?.projectedLevel ?? '-'}, Discipline ${projection365?.projectedDisciplineScore ?? '-'}, Streak ${projection365?.projectedStreak ?? '-'}, Identity shift ${projection365?.identityShift ?? '-'}.`,
    signal: input.future.trajectorySignal,
    kpis: [
      { label: 'Annual Level', value: `L${projection365?.projectedLevel ?? '-'}` },
      { label: 'Annual Streak', value: `${projection365?.projectedStreak ?? '-'}` },
      { label: 'Discipline', value: `${projection365?.projectedDisciplineScore ?? '-'}/100` },
      { label: 'Confidence', value: projection365?.confidenceBand?.toUpperCase() ?? 'STABLE' },
    ],
    strategicMemo: `Identity shift forecast: ${projection365?.identityShift ?? '-'}. ${input.future.identityNarrative}`,
  };
}
