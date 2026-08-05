export type LaunchCopyPack = {
  appTitleOptions: string[];
  shortDescription: string;
  longDescription: string[];
  screenshotCaptions: string[];
  marketingHooks: string[];
};

export const getLaunchCopyPack = (): LaunchCopyPack => ({
  appTitleOptions: [
    'PeakPact: Discipline Contracts',
    'PeakPact: Zero Tolerance Focus',
    'PeakPact: Contract Productivity',
  ],
  shortDescription: 'Contract-first, founder-grade productivity with strict verification, cinematic progression, and elite launch polish.',
  longDescription: [
    'PeakPact is a discipline system built around binding contracts, not motivation hype.',
    'Define your task, time window, and PP stake. Execute. Submit. Get verified. Progress only through completion.',
    'Core loop includes manual contract logging, verification and progression, mission briefings, narrative unlocks, and offline-safe operation.',
    'Premium conveniences include mission autoload, voice capture, launch visuals, and time dilation recovery tools.',
    'Trial and pricing model: 7-day premium trial per new device, PP-first economy, and EUR pricing at checkout.',
  ],
  screenshotCaptions: [
    'Define the contract. Execute with intent.',
    'Task + time + stake. No excuses.',
    'Verification that enforces reality, not wishful thinking.',
    'Device-based trial. Strict core stays free.',
    'Unlock transmissions by proving consistency.',
  ],
  marketingHooks: [
    'Motivation fades. Contracts don’t.',
    'If it can’t be verified, it doesn’t count.',
    'Your focus app should feel like a mission terminal.',
    'No streak repairs. No cheat passes. Just execution.',
    'Build discipline with visible consequences.',
    'One contract at a time. One level at a time.',
    'Stop planning. Start submitting proof.',
    'The strict core is free. Convenience is premium.',
    'Turn your goals into enforceable pacts.',
    'PeakPact is where accountability gets technical.',
  ],
});
