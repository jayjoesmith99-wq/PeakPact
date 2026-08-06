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
