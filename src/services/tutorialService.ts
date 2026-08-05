export type TutorialStep = {
  id: number;
  title: string;
  body: string;
  hint: string;
  tab: 'PACT' | 'SQUAD' | 'STORE' | 'PROFILE' | 'SYSTEM';
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 0,
    title: 'WELCOME, OPERATOR',
    body: 'PeakPact is a personal discipline engine. You write contracts with yourself, stake Pact Points (PP), and prove you completed them. The AI verifies your report — miss a deadline and the system penalises you automatically.',
    hint: 'Swipe through this intro to learn the key mechanics before you begin.',
    tab: 'PACT',
  },
  {
    id: 1,
    title: 'PACT POINTS (PP)',
    body: 'PP is your discipline score. Earn PP by submitting verified pacts. Spend PP to unlock premium features, or lose it for missed contracts and breaches. Your current balance is always visible top-left in the OPERATOR LEDGER.',
    hint: 'Look at the top-left pane — that number is your live PP balance.',
    tab: 'PACT',
  },
  {
    id: 2,
    title: 'THE PACT RING',
    body: 'The crimson fractured ring represents an active, unverified contract. When you complete a task and submit proof, the ring seals into a clean, unbroken white circle. That visual confirmation is your daily win signal.',
    hint: 'The two rings shown are the before (crimson) and after (white) states.',
    tab: 'PACT',
  },
  {
    id: 3,
    title: 'CREATING A CONTRACT',
    body: 'Scroll down on the PACT tab to the contract form. Describe what you completed, set a time duration in minutes, and set a PP stake. Press SUBMIT PACT — the AI reads your report and awards PP if it passes verification.',
    hint: 'Start with a low stake (10–20 PP) while you get familiar with the system.',
    tab: 'PACT',
  },
  {
    id: 4,
    title: 'THE SEVERANCE TIMER',
    body: 'The countdown in the top-right SEVERANCE TIMER pane shows time until the daily reset. If you have an active contract and let the clock hit zero without submitting, your streak breaks and PP is deducted. This pressure is intentional.',
    hint: 'Set your contract early in the day — do not wait for the last hour.',
    tab: 'PACT',
  },
  {
    id: 5,
    title: 'SQUAD NETWORK',
    body: 'Tap the SQUAD tab to create or join a crew. Squad members see each other\'s live adherence status. Social accountability raises completion rates significantly. Warning: leaving a squad costs a Severance Toll (PP).',
    hint: 'Tap SQUAD in the navigation bar at the bottom of the header.',
    tab: 'SQUAD',
  },
  {
    id: 6,
    title: 'DESIGN TEMPLATES & STORE',
    body: 'Tap the STORE tab to browse premium visual themes unlockable with earned PP. Each template has unique colors, animations, and press sounds matched to its aesthetic. You earn your way to better visuals.',
    hint: 'Tap STORE — the BASE PROTOCOL template is yours from day one.',
    tab: 'STORE',
  },
  {
    id: 7,
    title: 'THE COMMAND BAR',
    body: 'The bar at the very bottom of the screen is your system CLI. Type /log pact to view your history, /search [name] to find operators, /override premium to access the upgrade panel, or /uplink to connect to Overseer.',
    hint: 'You are ready. Build the habit. The system holds you to it.',
    tab: 'PACT',
  },
];
