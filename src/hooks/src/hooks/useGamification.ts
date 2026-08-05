// src/hooks/useGamification.ts
import { useState, useEffect } from 'react';

export interface OperatorStats {
  level: number;
  xp: number;
  peakPoints: number;
  nextLevelXP: number;
}

export function useGamification(initialXP: number = 0) {
  const [stats, setStats] = useState<OperatorStats>({
    level: 1,
    xp: initialXP,
    peakPoints: 100,
    nextLevelXP: 100,
  });

  const addXP = (amount: number) => {
    setStats((prev) => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let threshold = prev.nextLevelXP;

      while (newXP >= threshold && newLevel < 99) {
        newXP -= threshold;
        newLevel++;
        threshold = Math.floor(threshold * 1.15);
      }

      if (newLevel >= 99) {
        newLevel = 99;
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXP,
        nextLevelXP: threshold,
      };
    });
  };

  return { stats, addXP };
}