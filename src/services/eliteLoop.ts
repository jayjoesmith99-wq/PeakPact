<<<<<<< HEAD
export type DailyChallenge = {
  id: 'PACT' | 'RECOVERY' | 'SQUAD';
  title: string;
  body: string;
  rewardPP: number;
  premiumRewardPP: number;
  progress: {
    current: number;
    target: number;
  };
  accent: string;
};

export type PremiumBoostSummary = {
  label: string;
  body: string;
  bonusPP: number;
};

export const getDailyChallenge = ({
  dailyPactsToday,
  pp,
  streak,
  redState,
  isPremium,
}: {
  dailyPactsToday: number;
  pp: number;
  streak: number;
  redState: boolean;
  isPremium: boolean;
}): DailyChallenge => {
  if (redState) {
    return {
      id: 'RECOVERY',
      title: 'RECOVERY FIRST',
      body: 'Stabilize the node and protect your streak before pushing further.',
      rewardPP: 24,
      premiumRewardPP: 36,
      progress: { current: 0, target: 1 },
      accent: '#7FE7C9',
    };
  }

  if (dailyPactsToday >= 2) {
    return {
      id: 'SQUAD',
      title: 'SQUAD SIGNAL',
      body: 'Assign a captain task or update your crew to keep momentum alive.',
      rewardPP: 20,
      premiumRewardPP: 32,
      progress: { current: dailyPactsToday, target: 3 },
      accent: '#FFB000',
    };
  }

  return {
    id: 'PACT',
    title: 'PACT RUSH',
    body: 'Complete one disciplined pact to keep the tower climbing.',
    rewardPP: 16,
    premiumRewardPP: isPremium ? 40 : 24,
    progress: { current: dailyPactsToday, target: 2 },
    accent: '#00FF00',
  };
};

export const getPremiumBoostSummary = ({ isPremium, pp, streak }: { isPremium: boolean; pp: number; streak: number }): PremiumBoostSummary => {
  if (!isPremium) {
    return {
      label: 'BASELINE',
      body: 'Keep the core loop clean and unlock premium conveniences later.',
      bonusPP: 0,
    };
  }

  return {
    label: 'COMMAND BOOST',
    body: `Premium gives you faster recovery, Voice capture, and more breathing room. Your current command window is strong at ${pp} PP and ${streak} streak.`,
    bonusPP: 40,
  };
};
=======
export function getDailyChallenge({ dailyPactsToday, pp, streak, redState, isPremium, }: { dailyPactsToday: number; pp: number; streak: number; redState: boolean; isPremium: boolean; }) {
  return {
    title: "DISCIPLINE CHALLENGE",
    body: "Submit one more pact and keep your streak intact.",
    accent: "#00FF00",
    rewardPP: isPremium ? 30 : 15,
    premiumRewardPP: 30,
    progress: { current: dailyPactsToday, target: 3 },
  };
}

export function getPremiumBoostSummary({ isPremium, pp, streak, }: { isPremium: boolean; pp: number; streak: number; }) {
  return {
    label: isPremium ? "PREMIUM BOOST ACTIVE" : "BASIC BOOST ACTIVE",
    body: isPremium ? "Access premium mission tools and voice support." : "Upgrade for faster progression and extra rewards.",
    bonusPP: isPremium ? 20 : 5,
  };
}
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
