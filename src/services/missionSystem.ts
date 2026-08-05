export type MissionBriefing = {
  title: string;
  description: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  rewardBonus: number;
  timeWindowMinutes: number;
  contractTemplate: string;
  recommendedStake: number;
};

export function generateMissionBriefing(context: Record<string, unknown>, language: string): MissionBriefing {
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

export function getConsequencePacket(reason: string, context: Record<string, unknown>, language: string) {
  return {
    terminalLine: `> CONSEQUENCE: ${reason}`,
    overseerLine: `> OVERSEER NOTICE: ${reason}`,
    statusLine: `STATUS: ${reason}`,
  };
}

export function getDailyLoopGuide(language: string) {
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

export function getDisciplineBanner(context: Record<string, unknown>, language: string) {
  return "DISCIPLINE STATUS STABLE.";
}

export function getFirstSessionGuide(language: string) {
  return {
    title: "FIRST SESSION GUIDE",
    body: "Welcome operator. Start with a minimal pact and learn the loop.",
    steps: [
      { title: "Set a task", body: "Choose something achievable." },
      { title: "Submit", body: "Send the pact for verification." },
      { title: "Review", body: "Check your rewards and status." },
    ],
    primaryAction: "START YOUR FIRST PACT",
  };
}

export function getHeroSummary(context: Record<string, unknown>, missionTitle: string, missionRisk: string, language: string) {
  return {
    title: "SYSTEM PILOT READY",
    subtitle: `Mission: ${missionTitle}`,
    emphasis: "Stay sharp and monitor the timer.",
    statusLabel: "COMMAND CORE",
  };
}

export function getHowToUseSystemSteps(language: string) {
  return [
    { title: "WRITE YOUR PACT", body: "Describe what you accomplished." },
    { title: "SUBMIT PROOF", body: "Send the pact for verification." },
    { title: "EARN PP", body: "Use points to unlock templates." },
  ];
}

export function getMissionGuidance(context: Record<string, unknown>, language: string) {
  return {
    title: "MISSION GUIDANCE",
    body: "Keep your goal clear and your pact concise.",
    nextAction: "Submit a completion summary now.",
  };
}

export function getOperatorInsight(context: Record<string, unknown>, language: string) {
  return {
    title: "OPERATOR INSIGHT",
    body: "Your consistency is your strongest asset.",
  };
}

export function getOperatorManualEntries(language: string) {
  return [
    { title: "Pact Formation", body: "Write clear commitments to earn PP." },
    { title: "Recovery", body: "Use stabilization when needed." },
  ];
}

export function getProgressionSnapshot(context: Record<string, unknown>, language: string) {
  return {
    nextLevelProgress: { percent: 40 },
    hallOfFame: [
      { title: "Execution", value: "Stable", detail: "Maintain daily streak." },
    ],
    towerFloors: [
      { floor: 1, label: "INIT", active: true, unlocked: true },
      { floor: 2, label: "RAMP", active: false, unlocked: false },
    ],
    skills: [
      { title: "FOCUS", value: "3", description: "Maintain attention on objective." },
    ],
    ascension: {
      title: "PATH FORGE",
      subtitle: "Progress through daily discipline.",
      rewardLabel: "New template unlock",
    },
  };
}

export function getStatusEffectTags(context: Record<string, unknown>, language: string) {
  return [{ label: "STABLE" }];
}

export function getTerminalGlitchEvent(context: Record<string, unknown>, language: string) {
  return { title: "MINOR GLITCH" };
}
