export type SquadVisibility = "PUBLIC" | "PRIVATE";

export type SquadMember = {
  id: string;
  name: string;
  role: string;
};

export type SquadMessage = {
  id: string;
  author: string;
  text: string;
  translatedText?: string;
};

export type Squad = {
  id: string;
  name: string;
  description: string;
  visibility: SquadVisibility;
  ownerName: string;
   focus: string;
  goal: string;
  plan: string;
  code: string;
  members: SquadMember[];
  progress: {
    current: number;
    target: number;
    label: string;
  };
  messages: SquadMessage[];
};

function randomId() {
  return `${Math.random().toString(36).slice(2, 8)}-${Date.now().toString().slice(-4)}`;
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
  visibility: SquadVisibility;
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
  _plan: string,
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

export function assignCaptainTask(
  squads: Squad[],
  squadId: string,
  operatorCodename: string,
  targetName: string,
  taskText: string,
  _language: string,
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