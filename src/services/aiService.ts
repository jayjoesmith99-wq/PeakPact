export type PactContract = {
  task: string;
  durationMinutes: number;
  stakePP: number;
  acceptedAt: string;
};

export function buildStructuredVerification(text: string, contract?: PactContract) {
  const verified = text.trim().length > 0;
  return {
    verified,
    pp_awarded: verified ? Math.max(1, Math.min(60, Math.round((contract?.stakePP ?? 10) / 2))) : -10,
    terminal_response: verified
      ? "> PACT VERIFIED. REWARD ALLOCATED."
      : "> PACT REJECTED. NO PROGRESS DETECTED.",
    severity: verified ? "LOW" : "HIGH",
    attribute_scale: verified ? 0.75 : 0.2,
  };
}

export async function submitToVerificationEngine(
  text: string,
  userId: string,
  timestamp: string,
  contract?: PactContract,
) {
  return buildStructuredVerification(text, contract);
}
