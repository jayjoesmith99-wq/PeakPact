export type ParsedVoiceCommand = {
  transcript: string;
  task: string;
  duration?: string;
  stake?: string;
  requiresConfirmation: boolean;
};

const DURATION_PATTERN = /(\d+)\s*(?:minutes?|mins?|m)\b/i;
const STAKE_PATTERN = /(\d+)\s*(?:pp|points?)\b/i;

export function parseVoiceCommand(transcript: string): ParsedVoiceCommand {
  const normalized = transcript.trim().replace(/\s+/g, ' ');
  const durationMatch = normalized.match(DURATION_PATTERN);
  const stakeMatch = normalized.match(STAKE_PATTERN);
  const task = normalized
    .replace(/^(please\s+)?(?:start|create|set up|log|record)\s+/i, '')
    .replace(DURATION_PATTERN, '')
    .replace(STAKE_PATTERN, '')
    .replace(/\b(?:for|with)\b/gi, '')
    .replace(/\b(?:mission|pact|contract)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[,.!?]+$/, '') || normalized;

  return {
    transcript: normalized,
    task,
    duration: durationMatch?.[1],
    stake: stakeMatch?.[1],
    requiresConfirmation: Boolean(durationMatch || stakeMatch),
  };
}
