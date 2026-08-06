export type ComplianceConsent = {
  privacyAccepted: boolean;
  termsAccepted: boolean;
  ageConfirmed: boolean;
  consentedAt: string | null;
};

<<<<<<< HEAD
export const hasRequiredComplianceConsent = (consent: ComplianceConsent): boolean => (
  consent.privacyAccepted
  && consent.termsAccepted
  && consent.ageConfirmed
  && Boolean(consent.consentedAt)
);

export const buildComplianceNotice = (consent: ComplianceConsent): string => {
  if (!hasRequiredComplianceConsent(consent)) {
    return '> GDPR / ROMANIA NOTICE: EXPLICIT CONSENT REQUIRED BEFORE VOICE OR PERSONAL DATA PROCESSING.';
  }

  return '> GDPR / ROMANIA NOTICE: CONSENT RECORDED. VOICE AND PACT DATA PROCESSING IS AUTHORIZED UNDER THE ACTIVE CONSENT RECORD.';
};

export const createDefaultComplianceConsent = (): ComplianceConsent => ({
  privacyAccepted: false,
  termsAccepted: false,
  ageConfirmed: false,
  consentedAt: null,
});

export const getPrivacyPolicyText = (): string[] => [
  'PeakPact is a discipline and accountability application designed to help users track pacts, missions, and progress.',
  'To provide the experience, PeakPact may process account information, pact logs, progress data, and optional voice content when a user chooses to record or submit it.',
  'We do not sell personal data. Data may be stored in secure cloud infrastructure and retained only as long as necessary to operate the service, protect integrity, and comply with applicable law.',
  'Users may request access, correction, or deletion of their data where applicable. Voice content is optional and should only be provided with informed consent.',
  'For users in the European Union and Romania, explicit consent should be obtained before processing sensitive or personal data, and the final legal text should be reviewed by qualified local counsel.',
];

export const getTermsOfUseText = (): string[] => [
  'Operators agree to use PeakPact in good faith and to provide truthful account of completed tasks and pacts.',
  'The app may apply penalties, contract voids, red-state lockouts, or other discipline consequences when a user fails to meet the conditions of an active pact.',
  'Users must not impersonate others, submit false data, or misuse the voice or verification systems.',
  'PeakPact is provided as a self-improvement and accountability tool and is not a substitute for professional medical, legal, or psychological advice.',
  'The operator remains responsible for their own decisions, and the company may suspend or restrict access for abuse or misconduct.',
];
=======
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

export function getPrivacyPolicyText(): string[] {
  return [
    "We collect minimal usage data to maintain playback and progress.",
    "Local storage is used for session persistence and onboarding state.",
  ];
}

export function getTermsOfUseText(): string[] {
  return [
    "Do not use this app for harmful or illicit tasks.",
    "This is a demo scaffold and not a legal agreement.",
  ];
}
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
