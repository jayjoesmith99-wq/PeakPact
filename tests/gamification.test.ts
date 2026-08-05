// PeakPact Gamification Core Engine - Full 1-99 Progression & Conversion Verification

const calculateLevelFromXP = (xp: number): { level: number; currentLevelXP: number; nextLevelXP: number } => {
  let level = 1;
  let remainingXP = xp;
  let threshold = 100;

  while (remainingXP >= threshold && level < 99) {
    remainingXP -= threshold;
    level++;
    threshold = Math.floor(threshold * 1.15);
  }

  // Cap at max level 99
  if (level >= 99) {
    level = 99;
  }

  return { level, currentLevelXP: remainingXP, nextLevelXP: threshold };
};

const convertRiskerPointsToXP = (riskPoints: number, multiplier: number = 1.5): number => {
  return Math.floor(riskPoints * multiplier);
};

describe('PeakPact Gamification Core Engine - Max Level 99 Verification', () => {

  // Programmatically generate exact threshold XP requirements for every level up to 99
  const generateLevelTestCases = () => {
    const cases = [{ xp: 0, expectedLevel: 1 }];
    let accumulatedXP = 0;
    let threshold = 100;

    for (let lvl = 2; lvl <= 99; lvl++) {
      accumulatedXP += threshold;
      cases.push({ xp: accumulatedXP, expectedLevel: lvl });
      threshold = Math.floor(threshold * 1.15);
    }
    return cases;
  };

  const levelTestCases = generateLevelTestCases();

  levelTestCases.forEach(({ xp, expectedLevel }) => {
    it(`validates level calculation for ${xp} XP -> Level ${expectedLevel}`, () => {
      const result = calculateLevelFromXP(xp);
      expect(result.level).toBe(expectedLevel);
    });
  });

  // Verify Peak Points Risker to XP Conversions & Bounds
  for (let i = 1; i <= 25; i++) {
    it(`validates risked Peak Points conversion accuracy for amount ${i * 10}`, () => {
      const riskedPoints = i * 10;
      const convertedXP = convertRiskerPointsToXP(riskedPoints, 1.5);
      expect(convertedXP).toBe(Math.floor(riskedPoints * 1.5));
      expect(Number.isInteger(convertedXP)).toBe(true);
    });
  }
});