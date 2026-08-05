export function appendPactHistory() {
  return;
}

export function canAccessFounderPrivileges({ level, pp }: { level: number; pp: number }) {
  return level >= 50 || pp >= 10000;
}

export async function createClientPayloadSignature(userId: string, text: string, timestamp?: string) {
  return `sig-${userId}-${Math.round(Date.now() / 1000)}`;
}

export function getLevelFromXP(xp: number) {
  return Math.max(1, Math.floor(xp / 1000) + 1);
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

export async function saveUserProfile(profile: Record<string, unknown>) {
  return;
}

export async function syncProgressToSupabase(progress: Record<string, unknown>, records: Record<string, unknown>[]) {
  return;
}
