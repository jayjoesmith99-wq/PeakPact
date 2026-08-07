export function appendPactHistory() {
  return;
}

export function canAccessFounderPrivileges({ level, pp }: { level: number; pp: number }) {
  return level >= 50 || pp >= 10000;
}

export async function createClientPayloadSignature(userId: string, _text: string, _timestamp?: string) {
  return `sig-${userId}-${Math.round(Date.now() / 1000)}`;
}

const MAX_LEVEL = 99;
const LEVEL_CAP_XP = 50000;

export function getLevelFromXP(xp: number) {
  if (xp >= LEVEL_CAP_XP) {
    return MAX_LEVEL;
  }

  let currentLevel = 1;
  let threshold = 500;
  let remainingXp = xp;

  while (remainingXp >= threshold && currentLevel < MAX_LEVEL) {
    remainingXp -= threshold;
    currentLevel += 1;
    threshold += 500;
  }

  return Math.min(currentLevel, MAX_LEVEL);
}

export function getXpForPactStake(stakePP: number) {
  return Math.max(0, stakePP * 10);
}

export async function loadUserProfile(): Promise<
  | {
      pp: number;
      level: number;
      xp?: number;
      streak: number;
      last_pact_date?: string;
      active_pact_deadline?: string;
      extensions_used?: number;
      red_state: boolean;
    }
  | null
> {
  return null;
}

export async function saveUserProfile(_profile: Record<string, unknown>) {
  return;
}

export async function syncProgressToSupabase(_progress: Record<string, unknown>, _records: Record<string, unknown>[]) {
  return;
}
