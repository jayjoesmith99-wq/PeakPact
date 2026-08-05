export type Squad = {
  id: string;
  name: string;
  description: string;
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
