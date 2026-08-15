import { formatLocalizedText, getLocalizedText, type SupportedLanguage } from './i18n';

export type FutureSelfProjection = {
  windowDays: 30 | 90 | 365;
  projectedLevel: number;
  projectedStreak: number;
  projectedDisciplineScore: number;
  identityShift: string;
  confidenceBand: 'stable' | 'strong' | 'elite';
  momentumIndex: number;
  executionFocus: string;
};

export type FutureSelfSnapshot = {
  currentIdentity: string;
  trajectorySignal: 'recovering' | 'ascending' | 'dominant';
  identityNarrative: string;
  transformationTimeline: Array<{
    day: 30 | 90 | 365;
    title: string;
    summary: string;
    confidenceBand: FutureSelfProjection['confidenceBand'];
  }>;
  projections: FutureSelfProjection[];
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function resolveTrajectorySignal(score: number): FutureSelfSnapshot['trajectorySignal'] {
  if (score >= 85) return 'dominant';
  if (score >= 65) return 'ascending';
  return 'recovering';
}

function resolveFocus(windowDays: 30 | 90 | 365, language: SupportedLanguage): string {
  if (windowDays === 30) return getLocalizedText('futureFocus30', language);
  if (windowDays === 90) return getLocalizedText('futureFocus90', language);
  return getLocalizedText('futureFocus365', language);
}

export function buildFutureSelfSnapshot(input: {
  currentIdentity: string;
  level: number;
  streak: number;
  disciplineScore: number;
  language: SupportedLanguage;
}): FutureSelfSnapshot {
  const trajectorySignal = resolveTrajectorySignal(input.disciplineScore);

  const makeProjection = (windowDays: 30 | 90 | 365, levelRate: number, streakRate: number) => {
    const projectedLevel = clamp(input.level + levelRate, 1, 99);
    const projectedStreak = clamp(input.streak + streakRate, 0, 999);
    const projectedDisciplineScore = clamp(input.disciplineScore + (windowDays / 20), 0, 100);
    const confidenceBand: FutureSelfProjection['confidenceBand'] =
      projectedDisciplineScore >= 90 ? 'elite' : projectedDisciplineScore >= 75 ? 'strong' : 'stable';
    const momentumIndex = clamp((projectedLevel * 0.9) + (projectedStreak * 0.15) + (projectedDisciplineScore * 0.7), 0, 100);

    return {
      windowDays,
      projectedLevel,
      projectedStreak,
      projectedDisciplineScore,
      identityShift: formatLocalizedText(
        'futureIdentityShift',
        {
          currentIdentity: input.currentIdentity,
          nextIdentity: projectedDisciplineScore >= 85
            ? getLocalizedText('futureIdentityLeader', input.language)
            : getLocalizedText('futureIdentityBuilder', input.language),
        },
        input.language,
      ),
      confidenceBand,
      momentumIndex,
      executionFocus: resolveFocus(windowDays, input.language),
    };
  };

  const projections = [
    makeProjection(30, 2, 6),
    makeProjection(90, 6, 18),
    makeProjection(365, 22, 84),
  ];

  return {
    currentIdentity: input.currentIdentity,
    trajectorySignal,
    identityNarrative:
      trajectorySignal === 'dominant'
        ? getLocalizedText('futureNarrativeDominant', input.language)
        : trajectorySignal === 'ascending'
          ? getLocalizedText('futureNarrativeAscending', input.language)
          : getLocalizedText('futureNarrativeRecovering', input.language),
    transformationTimeline: projections.map((projection) => ({
      day: projection.windowDays,
      title: formatLocalizedText('futureTimelineTitle', {
        day: projection.windowDays,
        identityShift: projection.identityShift,
      }, input.language),
      summary: projection.executionFocus,
      confidenceBand: projection.confidenceBand,
    })),
    projections,
  };
}
