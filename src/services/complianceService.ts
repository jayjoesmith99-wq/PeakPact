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
