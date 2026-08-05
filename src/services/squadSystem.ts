import type { ProductPlan } from './productPlan';

export type SquadVisibility = 'PUBLIC' | 'PRIVATE';
export type SquadMemberRole = 'OWNER' | 'MEMBER';

export type SquadMember = {
  id: string;
  name: string;
  role: SquadMemberRole;
};

export type SquadMessage = {
  id: string;
  author: string;
  text: string;
  translatedText?: string;
  language: string;
  createdAt: string;
};

export type Squad = {
  id: string;
  name: string;
  description: string;
  visibility: SquadVisibility;
  code: string;
  focus: string;
  goal: string;
  plan: ProductPlan;
  members: SquadMember[];
  messages: SquadMessage[];
  progress: {
    current: number;
    target: number;
    label: string;
  };
};

const createJoinCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const translateText = (text: string, language: string) => {
  if (language === 'en') {
    return text;
  }

  const translations: Record<string, string> = {
    es: `[ES] ${text}`,
    fr: `[FR] ${text}`,
    ru: `[RU] ${text}`,
    zh: `[ZH] ${text}`,
    ja: `[JA] ${text}`,
  };

  return translations[language] ?? `[${language.toUpperCase()}] ${text}`;
};

export const createSquad = ({
  name,
  description,
  visibility,
  ownerName,
  focus,
  goal,
  plan,
}: {
  name: string;
  description: string;
  visibility: SquadVisibility;
  ownerName: string;
  focus: string;
  goal?: string;
  plan?: ProductPlan;
}): Squad => ({
  id: `squad-${Math.random().toString(36).slice(2, 10)}`,
  name,
  description,
  visibility,
  code: createJoinCode(),
  focus,
  goal: goal ?? focus,
  plan: plan ?? 'PREMIUM',
  members: [{ id: `member-${Math.random().toString(36).slice(2, 8)}`, name: ownerName, role: 'OWNER' }],
  messages: [],
  progress: {
    current: 0,
    target: 5,
    label: 'Shared missions completed',
  },
});

export const createSeedSquads = (): Squad[] => [
  createSquad({
    name: 'North Star Crew',
    description: 'A disciplined crew for daily focus.',
    visibility: 'PUBLIC',
    ownerName: 'Rook',
    focus: 'Study and recovery',
    goal: 'Complete 5 shared missions this week',
    plan: 'PREMIUM',
  }),
  createSquad({
    name: 'Quiet Architects',
    description: 'Private squad for close accountability.',
    visibility: 'PRIVATE',
    ownerName: 'Mira',
    focus: 'Deep work and consistency',
    goal: 'Maintain a 7-day streak together',
    plan: 'BASIC',
  }),
];

const getLeaveFeePP = (plan: ProductPlan) => (plan === 'PREMIUM' ? 8 : 12);

export const joinSquad = (squads: Squad[], code: string, memberName: string, plan: ProductPlan = 'PREMIUM') => {
  const squad = squads.find((entry) => entry.code === code);

  if (!squad) {
    return { error: 'Squad not found', squad: undefined };
  }

  const normalizedName = memberName.trim().toLowerCase();
  const alreadyMember = squads.some((entry) => entry.members.some((member) => member.name.toLowerCase() === normalizedName));
  if (alreadyMember) {
    return { error: 'Member already belongs to another crew', squad };
  }

  if (squad.plan === 'BASIC' && squad.members.length >= 2) {
    return { error: 'Basic crews are limited to two users', squad };
  }

  squad.members.push({
    id: `member-${Math.random().toString(36).slice(2, 8)}`,
    name: memberName,
    role: 'MEMBER',
  });

  return { squad, plan };
};

export const leaveSquad = (squads: Squad[], squadId: string, memberName: string, plan: ProductPlan = 'PREMIUM', currentPP = 0) => {
  const squad = squads.find((entry) => entry.id === squadId);

  if (!squad) {
    return { error: 'Squad not found', squad: undefined, feePP: 0, remainingPP: currentPP };
  }

  const memberIndex = squad.members.findIndex((member) => member.name.toLowerCase() === memberName.trim().toLowerCase());
  if (memberIndex < 0) {
    return { error: 'Member not found', squad, feePP: 0, remainingPP: currentPP };
  }

  const feePP = getLeaveFeePP(plan);
  if (currentPP < feePP) {
    return { error: 'Insufficient PP to leave crew', squad, feePP, remainingPP: currentPP };
  }

  const remainingPP = currentPP - feePP;
  squad.members.splice(memberIndex, 1);

  return { squad, feePP, remainingPP };
};

export const sendSquadMessage = (squads: Squad[], squadId: string, author: string, text: string, language: string) => {
  const squad = squads.find((entry) => entry.id === squadId);

  if (!squad) {
    return { error: 'Squad not found', squad: undefined };
  }

  const message: SquadMessage = {
    id: `message-${Math.random().toString(36).slice(2, 10)}`,
    author,
    text,
    translatedText: translateText(text, language),
    language,
    createdAt: new Date().toISOString(),
  };

  squad.messages.push(message);
  squad.progress.current = Math.min(squad.progress.target, squad.progress.current + 1);

  return { squad };
};

export const assignCaptainTask = (squads: Squad[], squadId: string, captainName: string, targetName: string, taskText: string, language: string) => {
  const squad = squads.find((entry) => entry.id === squadId);

  if (!squad) {
    return { error: 'Squad not found', squad: undefined };
  }

  const captainExists = squad.members.some((member) => member.name.toLowerCase() === captainName.trim().toLowerCase());
  const targetExists = squad.members.some((member) => member.name.toLowerCase() === targetName.trim().toLowerCase());

  if (!captainExists) {
    return { error: 'Captain not found', squad };
  }

  if (!targetExists) {
    return { error: 'Target member not found', squad };
  }

  const taskTextTrimmed = taskText.trim();
  if (!taskTextTrimmed) {
    return { error: 'Task required', squad };
  }

  return sendSquadMessage(squads, squadId, `${captainName} [CAPTAIN]`, `TASK FOR ${targetName}: ${taskTextTrimmed}`, language);
};
