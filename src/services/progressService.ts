import { supabase } from '../../supabaseClient';

export function appendPactHistory() {
  return;
}

export function canAccessFounderPrivileges({ level, pp }: { level: number; pp: number }) {
  return level >= 50 || pp >= 10000;
}

export async function createClientPayloadSignature(userId: string, text: string, timestamp?: string) {
  return `sig-${userId}-${Math.round(Date.now() / 1000)}`;
}

const MAX_LEVEL = 99;
const LEVEL_CAP_XP = 50000;

function getXpThresholdForLevel(level: number) {
  if (level <= 1) return 0;
  return 500 * (level - 1) * level / 2;
}

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

export async function uploadPactProof({
  userId,
  uri,
  mimeType = 'image/jpeg',
}: {
  userId: string;
  uri: string;
  mimeType?: string | null;
}): Promise<string> {
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();
  if (sessionError) {
    throw new Error(`Photo upload session check failed: ${sessionError.message}`);
  }
  if (!user?.id) {
    throw new Error('Photo upload requires an authenticated session.');
  }
  if (user.id !== userId) {
    throw new Error('Photo upload user does not match the active session.');
  }

  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Proof image could not be read (${response.status}).`);
  }

  const fileData = await response.arrayBuffer();
  const extension = (mimeType?.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg';
  const path = `${userId}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from('pact-proofs').upload(path, fileData, {
    contentType: mimeType || 'image/jpeg',
    upsert: false,
  });

  if (error) {
    throw new Error(`Proof upload failed: ${error.message}`);
  }

  return path;
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
      tutorial_completed?: boolean;
    }
  | null
> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('pp, level, xp, streak, last_pact_date, active_pact_deadline, extensions_used, red_state, tutorial_completed')
    .maybeSingle();

  if (error) {
    throw new Error(`Profile load failed: ${error.message}`);
  }

  return data;
}

export async function saveUserProfile(profile: Record<string, unknown>) {
  const { error } = await supabase.from('user_profiles').upsert(profile, { onConflict: 'user_id' });
  if (error) {
    throw new Error(`Profile save failed: ${error.message}`);
  }
}

export async function syncProgressToSupabase(progress: Record<string, unknown>, records: Record<string, unknown>[]) {
  if (!progress.user_id || records.some((record) => record.user_id !== progress.user_id)) {
    throw new Error('Progress payload has inconsistent user_id values.');
  }

  const { error } = await supabase.rpc('commit_pact_progress', {
    progress_payload: progress,
    pact_records: records,
  });

  if (error) {
    throw new Error(`Pact persistence failed: ${error.message}`);
  }
}
