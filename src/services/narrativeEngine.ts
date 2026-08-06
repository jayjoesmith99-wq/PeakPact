export function getNarrativeProgress(level: number, language: string) {
  const total = 10;
  const unlocked = Math.min(total, Math.floor(level / 2));
  return {
    unlockedCount: unlocked,
    totalCount: total,
    episodes: Array.from({ length: total }, (_, index) => ({
      title: `Episode ${index + 1}`,
      requiredLevel: (index + 1) * 2,
      unlocked: index < unlocked,
    })),
  };
}

export function getNewlyUnlockedEpisodes(oldLevel: number, nextLevel: number, language: string) {
  if (nextLevel <= oldLevel) {
    return [];
  }
  return Array.from({ length: nextLevel - oldLevel }, (_, index) => ({
    title: `Episode ${oldLevel + index + 1}`,
    episodeNumber: oldLevel + index + 1,
  }));
}
