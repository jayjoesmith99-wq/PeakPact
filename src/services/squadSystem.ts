<<<<<<< HEAD
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

=======
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
export type Squad = {
  id: string;
  name: string;
  description: string;
<<<<<<< HEAD
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
=======
  visibility: "PUBLIC" | "PRIVATE";
  ownerName: string;
  focus: string;
  goal: string;
  plan: string;
  code: string;
  members: Array<{ id: string; name: string; role: string }>;
  progress: { current: number; target: number; label: string };
  messages: Array<{ id: string; author: string; text: string; translatedText?: string }>;
};

function randomId() {
  return `${Math.random().toString(36).slice(2, 8)}-${Date.now().toString().slice(-4)}`;
}

export function createSeedSquads(): Squad[] {
  return [
    {
      id: "seed-1",
      name: "Horizon Crew",
      description: "A starter crew for consistency.",
      visibility: "PUBLIC",
      ownerName: "OPERATOR",
      focus: "Study and recovery",
      goal: "Complete 5 shared missions this week",
      plan: "BASIC",
      code: "AB12CD",
      members: [
        { id: "m1", name: "Nova", role: "member" },
        { id: "m2", name: "Atlas", role: "member" },
      ],
      progress: { current: 1, target: 5, label: "MISSIONS" },
      messages: [
        { id: "msg-1", author: "Nova", text: "Ready to move on the next challenge." },
      ],
    },
  ];
}

export function createSquad({
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
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
<<<<<<< HEAD
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
=======
  visibility: "PUBLIC" | "PRIVATE";
  ownerName: string;
  focus: string;
  goal: string;
  plan: string;
}): Squad {
  return {
    id: randomId(),
    name,
    description,
    visibility,
    ownerName,
    focus,
    goal,
    plan,
    code: randomId().toUpperCase().slice(0, 6),
    members: [{ id: randomId(), name: ownerName, role: "owner" }],
    progress: { current: 0, target: 5, label: "MISSIONS" },
    messages: [],
  };
}

export function joinSquad(
  squads: Squad[],
  code: string,
  memberName: string,
  plan: string,
) {
  const squad = squads.find((entry) => entry.code.toUpperCase() === code.toUpperCase());
  if (!squad) {
    return { error: "SQUAD NOT FOUND" as const };
  }
  squad.members.push({ id: randomId(), name: memberName, role: "member" });
  return { squad, error: null };
}

export function leaveSquad(
  squads: Squad[],
  squadId: string,
  memberName: string,
  plan: string,
  currentPP: number,
) {
  const squad = squads.find((entry) => entry.id === squadId);
  if (!squad) {
    return { error: "SQUAD NOT FOUND" as const };
  }
  const fee = plan === "PREMIUM" ? 8 : 12;
  const remainingPP = Math.max(0, currentPP - fee);
  squad.members = squad.members.filter((member) => member.name !== memberName);
  return { squad, feePP: fee, remainingPP, error: null };
}

export function sendSquadMessage(
  squads: Squad[],
  squadId: string,
  author: string,
  text: string,
  language: string,
) {
  const squad = squads.find((entry) => entry.id === squadId);
  if (!squad) {
    return { error: "SQUAD NOT FOUND" as const };
  }
  squad.messages.push({ id: randomId(), author, text });
  return { squad, error: null };
}

export function assignCaptainTask(
  squads: Squad[],
  squadId: string,
  operatorCodename: string,
  targetName: string,
  taskText: string,
  language: string,
) {
  const squad = squads.find((entry) => entry.id === squadId);
  if (!squad) {
    return { error: "SQUAD NOT FOUND" as const };
  }
  const member = squad.members.find((entry) => entry.name.toLowerCase() === targetName.toLowerCase());
  if (!member) {
    return { error: "MEMBER NOT FOUND" as const };
  }
  squad.messages.push({
    id: randomId(),
    author: operatorCodename,
    text: `CAPTAIN TASK: ${taskText}`,
  });
  return { squad, error: null };
}
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
