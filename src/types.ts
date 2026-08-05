export interface UserProfile {
  id?: string;
  user_id: string;
  level: number;
  pp: number;
  streak: number;
  red_state: boolean;
  last_pact_date: string;
  active_pact_deadline?: string | null;
  extensions_used?: number;
  updated_at?: string;
}

export interface PactEntry {
  id?: string;
  user_id: string;
  content: string;
  result: 'VERIFIED' | 'REJECTED' | 'SUSPICIOUS' | 'RED_STATE_PENALTY';
  pp_awarded: number;
  created_at: string;
  synced: boolean;
  signature?: string;
  active_pact_deadline?: string | null;
  extensions_used?: number;
}

export interface VerificationResult {
  verified: boolean;
  awarded_pp: number;
  terminal_response: string;
  severity: 'NORMAL' | 'ALERT' | 'RED_STATE';
  reasoning: string;
}

export interface AudioEpisode {
  episodeNumber: number;
  title: string;
  requiredLevel: number;
  unlocked: boolean;
  audioUrl: string;
}