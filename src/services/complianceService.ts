export type ComplianceConsent = {
  privacyAccepted: boolean;
  termsAccepted: boolean;
  ageConfirmed: boolean;
  consentedAt: string | null;
};

export function createDefaultComplianceConsent(): ComplianceConsent {
  return {
    privacyAccepted: false,
    termsAccepted: false,
    ageConfirmed: false,
    consentedAt: null,
  };
}

export function hasRequiredComplianceConsent(consent: ComplianceConsent): boolean {
  return consent.privacyAccepted && consent.termsAccepted && consent.ageConfirmed;
}

export function buildComplianceNotice(consent: ComplianceConsent): string {
  if (hasRequiredComplianceConsent(consent)) {
    return "> COMPLIANCE CHECK PASSED.";
  }
  return "> CONSENT NEEDED BEFORE PROCEEDING. OPEN SYSTEM SETTINGS.";
}

const productionTermsOfService = [
  "WELCOME TO PEAKPACT.",
  "By accessing or using PeakPact, you agree to be bound by these Terms of Service. If you lack the discipline to accept these terms, do not use the app.",
  "1. THE CONTRACT & PEAK POINTS (PP)",
  "PeakPact is a strict accountability tool. When you commit to a pact, you stake Peak Points (PP). PP is a purely virtual currency intended solely for gamified accountability. It holds no real-world monetary value, cannot be purchased with real money, and cannot be exchanged, cashed out, or transferred.",
  "2. AI VERIFICATION & PENALTIES",
  "You agree that your submitted photo evidence will be evaluated by an automated Artificial Intelligence service. The AI's judgment is final. If you fail to complete a pact or submit invalid proof, you will lose your staked PP and enter a penalty state (\"Redstate\"). We are not responsible for subjective misclassifications by the AI, though you maintain the ability to govern your own inputs.",
  "3. USER CONDUCT & SQUAD VISIBILITY",
  "You agree not to use PeakPact to plan, execute, or verify any illegal, harmful, or illicit activities. By joining a Squad, you explicitly consent to sharing your accountability metrics, success rates, and failure states (including lost PP) with other members of that Squad in real-time.",
  "4. DISCLAIMER OF WARRANTIES",
  "PeakPact is provided \"as is.\" It is not a medical, psychological, or professional productivity service. We are not liable for any physical, mental, or emotional distress resulting from failed pacts, lost streaks, or Squad judgments. You alone are responsible for your actions and your discipline.",
];

const productionPrivacyPolicy = [
  "DATA & PRIVACY PROTOCOL",
  "PeakPact is designed to hold you accountable, not to harvest your data. This policy outlines exactly what we collect and why.",
  "1. DATA WE COLLECT",
  "- Account Information: Email address and authentication tokens (managed securely via our backend provider).",
  "- Performance Telemetry: Your PP balance, task descriptions, durations, active streaks, and penalty states (Redstate).",
  "- Media & Device Data: Photographs you explicitly upload for task verification.",
  "2. CAMERA & PHOTO VERIFICATION (THIRD-PARTY AI)",
  "To verify your pacts, PeakPact requires access to your device's camera or photo library. Crucially, the images you submit are sent to a third-party AI provider (OpenAI) for visual analysis. We do not use your photos for advertising, and they are processed strictly for the purpose of verifying your task completion. Do not upload photos containing sensitive, personal, or compromising information.",
  "3. SOCIAL SHARING (SQUADS)",
  "If you join a Squad, your basic profile telemetry (username, PP balance, adherence rate, and active/failed pacts) is visible to other members of that specific Crew to enforce social accountability.",
  "4. DATA RETENTION & DELETION",
  "You maintain total control. You can permanently delete your account and all associated personal data at any time via the System Preferences menu.",
];

const productionOperatorManual = [
  "OPERATOR MANUAL: THE PEAKPACT SYSTEM",
  "1. THE PACT: Define a single, sharp objective for the current day. Set your duration and stake your PP. You may only have one active pact at a time.",
  "2. THE EXECUTION: Once committed, the countdown begins. Do the work. Do not return until it is finished.",
  "3. THE VERIFICATION: Submit photographic proof of your completed task. Our AI Vision system will verify your claim.",
  "4. THE CONSEQUENCE: Success yields growth. Failure, missed deadlines, or rejected proof results in the loss of your staked PP and immediate demotion to Redstate.",
  "5. REDSTATE: A penalty state caused by broken discipline. You must pay a PP fine to stabilize the system and restore your privileges.",
  "6. SQUADS: Join a crew. Your successes and failures are public to your team. Leaving a squad incurs a permanent PP penalty.",
  "Proceed with absolute discipline.",
];

export function getPrivacyPolicyText(_language = "en"): string[] { return productionPrivacyPolicy; }
export function getTermsOfUseText(_language = "en"): string[] { return productionTermsOfService; }
export function getOperatorManualText(_language = "en"): string[] { return productionOperatorManual; }
