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

function resolveFocus(windowDays: 30 | 90 | 365): string {
  if (windowDays === 30) return 'Lock in completion reliability through tighter mission scope.';
  if (windowDays === 90) return 'Increase strategic difficulty while preserving streak continuity.';
  return 'Convert discipline into durable identity leadership and output quality.';
}

export function buildFutureSelfSnapshot(input: {
  currentIdentity: string;
  level: number;
  streak: number;
  disciplineScore: number;
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
      identityShift: `${input.currentIdentity} -> ${projectedDisciplineScore >= 85 ? 'Leader' : 'Builder'}`,
      confidenceBand,
      momentumIndex,
      executionFocus: resolveFocus(windowDays),
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
        ? 'Identity signal is dominant. Protect quality while scaling mission ambition.'
        : trajectorySignal === 'ascending'
          ? 'Identity signal is ascending. Keep consistency high and avoid mission sprawl.'
          : 'Identity signal is recovering. Prioritize completion discipline before difficulty.',
    transformationTimeline: projections.map((projection) => ({
      day: projection.windowDays,
      title: `Day ${projection.windowDays}: ${projection.identityShift}`,
      summary: projection.executionFocus,
      confidenceBand: projection.confidenceBand,
    })),
    projections,
  };
}
