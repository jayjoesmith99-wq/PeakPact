import type { ExecutionCoachSnapshot } from './aiExecutionCoach';
import type { FutureSelfSnapshot } from './futureSelfEngine';
import { formatLocalizedText, getLocalizedText, type SupportedLanguage } from './i18n';

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
  language: SupportedLanguage;
}): TransformationReport {
  const projection90 = input.future.projections.find((item) => item.windowDays === 90);
  const projection30 = input.future.projections.find((item) => item.windowDays === 30);

  return {
    period: 'monthly',
    headline: formatLocalizedText('reportMonthlyHeadline', { codename: input.codename }, input.language),
    summary: formatLocalizedText('reportMonthlySummary', {
      disciplineScore: `${input.coach.disciplineScore}/100`,
      trajectorySignal: input.future.trajectorySignal,
    }, input.language),
    highlights: [
      formatLocalizedText('reportMonthlyHighlight30', {
        level: projection30?.projectedLevel ?? '-',
        streak: projection30?.projectedStreak ?? '-',
        confidence: projection30?.confidenceBand ?? getLocalizedText('reportConfidenceStable', input.language),
      }, input.language),
      formatLocalizedText('reportMonthlyHighlight90', {
        level: projection90?.projectedLevel ?? '-',
        discipline: projection90?.projectedDisciplineScore ?? '-',
        momentum: projection90?.momentumIndex ?? '-',
      }, input.language),
      input.coach.weeklyReview,
    ],
    shareText: formatLocalizedText('reportMonthlyShareText', {
      disciplineScore: `${input.coach.disciplineScore}/100`,
      focusScore: `${input.coach.focusScore}/100`,
      trajectorySignal: input.future.trajectorySignal,
      currentIdentity: input.coach.currentIdentity,
    }, input.language),
    signal: input.future.trajectorySignal,
    kpis: [
      { label: getLocalizedText('dashboardDiscipline', input.language), value: `${input.coach.disciplineScore}/100` },
      { label: getLocalizedText('dashboardConsistency', input.language), value: `${input.coach.consistencyScore}/100` },
      { label: getLocalizedText('dashboardFocus', input.language), value: `${input.coach.focusScore}/100` },
      { label: getLocalizedText('reportKpi90Level', input.language), value: `L${projection90?.projectedLevel ?? '-'}` },
    ],
    strategicMemo: input.future.identityNarrative,
  };
}

export function buildAnnualTransformationReport(input: {
  codename: string;
  coach: ExecutionCoachSnapshot;
  future: FutureSelfSnapshot;
  language: SupportedLanguage;
}): TransformationReport {
  const projection365 = input.future.projections.find((item) => item.windowDays === 365);
  const projection90 = input.future.projections.find((item) => item.windowDays === 90);

  return {
    period: 'annual',
    headline: formatLocalizedText('reportAnnualHeadline', { codename: input.codename }, input.language),
    summary: formatLocalizedText('reportAnnualSummary', {
      level: projection365?.projectedLevel ?? '-',
      discipline: `${projection365?.projectedDisciplineScore ?? '-'}/100`,
      confidence: projection365?.confidenceBand ?? getLocalizedText('reportConfidenceStable', input.language),
    }, input.language),
    highlights: [
      formatLocalizedText('reportAnnualIdentityClass', { currentIdentity: input.coach.currentIdentity }, input.language),
      formatLocalizedText('reportAnnualMomentum', { momentum: projection90?.momentumIndex ?? '-' }, input.language),
      formatLocalizedText('reportAnnualStreak', { streak: projection365?.projectedStreak ?? '-' }, input.language),
      projection365?.executionFocus ?? input.coach.recommendations[0],
    ],
    shareText: formatLocalizedText('reportAnnualShareText', {
      level: projection365?.projectedLevel ?? '-',
      discipline: projection365?.projectedDisciplineScore ?? '-',
      streak: projection365?.projectedStreak ?? '-',
      identityShift: projection365?.identityShift ?? '-',
    }, input.language),
    signal: input.future.trajectorySignal,
    kpis: [
      { label: getLocalizedText('reportKpiAnnualLevel', input.language), value: `L${projection365?.projectedLevel ?? '-'}` },
      { label: getLocalizedText('reportKpiAnnualStreak', input.language), value: `${projection365?.projectedStreak ?? '-'}` },
      { label: getLocalizedText('dashboardDiscipline', input.language), value: `${projection365?.projectedDisciplineScore ?? '-'}/100` },
      { label: getLocalizedText('reportKpiConfidence', input.language), value: projection365?.confidenceBand?.toUpperCase() ?? getLocalizedText('reportConfidenceStable', input.language).toUpperCase() },
    ],
    strategicMemo: formatLocalizedText('reportAnnualStrategicMemo', {
      identityShift: projection365?.identityShift ?? '-',
      identityNarrative: input.future.identityNarrative,
    }, input.language),
  };
}
