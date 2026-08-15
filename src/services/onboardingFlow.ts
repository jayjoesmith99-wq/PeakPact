export type LaunchStep = 'language' | 'cinematic' | 'auth';

export type LaunchAction =
  | 'confirm-language'
  | 'cinematic-complete'
  | 'reopen-language';

export function advanceLaunchStep(currentStep: LaunchStep | null, action: LaunchAction): LaunchStep {
  switch (currentStep) {
    case 'language':
      if (action === 'confirm-language') return 'cinematic';
      return 'language';
    case 'cinematic':
      if (action === 'cinematic-complete') return 'auth';
      return 'cinematic';
    case 'auth':
      return 'auth';
    default:
      return action === 'confirm-language' ? 'cinematic' : 'language';
  }
}

export function resolveLaunchStep({
  hasBootstrapped,
  persistedOnboardingSeen,
  currentStep,
}: {
  hasBootstrapped: boolean;
  persistedOnboardingSeen: boolean;
  currentStep: LaunchStep | null;
}): LaunchStep {
  if (!hasBootstrapped) return 'language';
  if (persistedOnboardingSeen) return 'auth';
  if (currentStep === 'cinematic' || currentStep === 'auth') return currentStep;
  return 'language';
}

export function isLanguageGateVisible(currentStep: LaunchStep | null): boolean {
  return currentStep === 'language';
}

export function getInitialLaunchStep(hasBootstrapped: boolean, currentStep: LaunchStep | null): LaunchStep {
  return resolveLaunchStep({
    hasBootstrapped,
    persistedOnboardingSeen: currentStep === 'auth',
    currentStep,
  });
}
