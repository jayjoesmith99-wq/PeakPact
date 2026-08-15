import { getLocalizedText } from './i18n';

export type MissionBriefing = {
  title: string;
  description: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  rewardBonus: number;
  timeWindowMinutes: number;
  contractTemplate: string;
  recommendedStake: number;
};

export function generateMissionBriefing(_context: Record<string, unknown>, _language: string): MissionBriefing {
  return {
    title: "OPERATIONAL BRIEFING",
    description: "Maintain discipline and execute the current task with precision.",
    risk: "LOW",
    rewardBonus: 5,
    timeWindowMinutes: 45,
    contractTemplate: "Complete a focused execution block and report progress.",
    recommendedStake: 20,
  };
}

export function getConsequencePacket(reason: string, _context: Record<string, unknown>, _language: string) {
  return {
    terminalLine: `> CONSEQUENCE: ${reason}`,
    overseerLine: `> OVERSEER NOTICE: ${reason}`,
    statusLine: `STATUS: ${reason}`,
  };
}

export function getDailyLoopGuide(_language: string) {
  return {
    title: "DAILY LOOP",
    body: "Stay consistent with your core discipline and avoid gaps in routine.",
    nextAction: "Submit your next pact before the timer expires.",
    steps: [
      { title: "Plan", body: "Define the next execution task." },
      { title: "Execute", body: "Complete the task with focus." },
      { title: "Review", body: "Report your progress honestly." },
    ],
  };
}

export function getDisciplineBanner(_context: Record<string, unknown>, _language: string) {
  return "DISCIPLINE STATUS STABLE.";
}

export function getFirstSessionGuide(language: string) {
  const localized = (key: string) => getLocalizedText(key, language);
  return {
    title: localized('firstSessionGuideTitle'),
    body: localized('firstSessionGuideBody'),
    steps: [
      { title: localized('firstSessionGuidePickTitle'), body: localized('firstSessionGuidePickBody') },
      { title: localized('firstSessionGuideSubmitTitle'), body: localized('firstSessionGuideSubmitBody') },
      { title: localized('firstSessionGuideReviewTitle'), body: localized('firstSessionGuideReviewBody') },
    ],
    primaryAction: localized('firstSessionGuidePrimaryAction'),
  };
}

export function getHeroSummary(_context: Record<string, unknown>, missionTitle: string, _missionRisk: string, _language: string) {
  return {
    title: "SYSTEM PILOT READY",
    subtitle: `Mission: ${missionTitle}`,
    emphasis: "Stay sharp and monitor the timer.",
    statusLabel: "COMMAND CORE",
  };
}

export function getHowToUseSystemSteps(_language: string) {
  return [
    { title: "WRITE YOUR PACT", body: "Describe what you accomplished." },
    { title: "SUBMIT PROOF", body: "Send the pact for verification." },
    { title: "EARN PP", body: "Use points to unlock templates." },
  ];
}

export function getMissionGuidance(_context: Record<string, unknown>, _language: string) {
  return {
    title: "MISSION GUIDANCE",
    body: "Keep your goal clear and your pact concise.",
    nextAction: "Submit a completion summary now.",
  };
}

export function getOperatorInsight(_context: Record<string, unknown>, _language: string) {
  return {
    title: "OPERATOR INSIGHT",
    body: "Your consistency is your strongest asset.",
  };
}

export function getOperatorManualEntries(_language: string) {
  return [
    { title: "Pact Formation", body: "Write clear commitments to earn PP." },
    { title: "Recovery", body: "Use stabilization when needed." },
  ];
}

function getLevelFromXP(xp: number) {
  if (xp >= 50000) {
    return 99;
  }

  let currentLevel = 1;
  let threshold = 500;
  let remainingXp = xp;

  while (remainingXp >= threshold && currentLevel < 99) {
    remainingXp -= threshold;
    currentLevel += 1;
    threshold += 500;
  }

  return Math.min(currentLevel, 99);
}

function getXpThresholdForLevel(level: number) {
  if (level <= 1) return 0;
  return 500 * (level - 1) * level / 2;
}

export function getProgressionSnapshot(context: Record<string, unknown>, _language: string) {
  const xp = typeof context.xp === 'number' ? context.xp : 0;
  const level = typeof context.level === 'number' ? context.level : getLevelFromXP(xp);
  const activeLevel = Math.min(Math.max(level, 1), 99);
  const currentThreshold = getXpThresholdForLevel(activeLevel);
  const nextThreshold = activeLevel >= 99 ? currentThreshold : getXpThresholdForLevel(activeLevel + 1);
  const progressPercent = activeLevel >= 99
    ? 100
    : xp === currentThreshold
      ? 100
      : Math.min(100, Math.max(0, Math.round(((xp - currentThreshold) / Math.max(1, nextThreshold - currentThreshold)) * 100)));

  return {
    nextLevelProgress: { percent: progressPercent },
    hallOfFame: [
      { title: 'Execution', value: 'Stable', detail: 'Maintain daily streak.' },
    ],
    towerFloors: Array.from({ length: 99 }, (_, index) => {
      const floor = index + 1;
      return {
        floor,
        label: `FLOOR ${floor}`,
        active: floor === activeLevel,
        unlocked: floor <= activeLevel,
      };
    }),
    skills: [
      { title: 'FOCUS', value: '3', description: 'Maintain attention on objective.' },
    ],
    ascension: {
      title: 'PATH FORGE',
      subtitle: 'Progress through daily discipline.',
      rewardLabel: 'New template unlock',
    },
  };
}

export function getStatusEffectTags(_context: Record<string, unknown>, _language: string) {
  return [{ label: "STABLE" }];
}

export function getTerminalGlitchEvent(_context: Record<string, unknown>, _language: string) {
  return { title: "MINOR GLITCH" };
}
