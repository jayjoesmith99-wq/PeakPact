<<<<<<< HEAD
export type ProductPlan = 'BASIC' | 'PREMIUM';

export type PlanFeatures = {
  missionAutoload: boolean;
  voiceCapture: boolean;
  timeDilation: boolean;
};

export const getActiveProductPlan = (): ProductPlan => {
  const rawValue = (process.env.EXPO_PUBLIC_PEAKPACT_PLAN || 'basic').trim().toUpperCase();
  return rawValue === 'PREMIUM' ? 'PREMIUM' : 'BASIC';
};

export const getPlanFeatures = (plan: ProductPlan): PlanFeatures => ({
  missionAutoload: plan === 'PREMIUM',
  voiceCapture: plan === 'PREMIUM',
  timeDilation: plan === 'PREMIUM',
});

export const resolveEffectiveProductPlan = (basePlan: ProductPlan, hasDevicePremiumTrial: boolean): ProductPlan => (
  basePlan === 'PREMIUM' || hasDevicePremiumTrial ? 'PREMIUM' : 'BASIC'
);

export const getFeatureLockMessage = (feature: keyof PlanFeatures): string => {
  switch (feature) {
    case 'missionAutoload':
      return 'MISSION AUTOLOAD IS A PREMIUM CONVENIENCE TOOL. BASIC OPERATORS BUILD CONTRACTS MANUALLY.';
    case 'voiceCapture':
      return 'VOICE CAPTURE IS A PREMIUM CONVENIENCE TOOL. BASIC OPERATORS LOG DISCIPLINE MANUALLY.';
    case 'timeDilation':
      return 'TIME DILATION IS A PREMIUM RECOVERY TOOL. BASIC OPERATORS HOLD THE ORIGINAL DEADLINE.';
    default:
      return 'THIS OVERRIDE REQUIRES PREMIUM ACCESS.';
  }
};
=======
export type ProductPlan = "BASIC" | "PREMIUM";

export function getActiveProductPlan(): ProductPlan {
  return "BASIC";
}

export function getFeatureLockMessage(feature: string): string {
  return `PREMIUM FEATURE LOCKED: ${feature}`;
}

export function getPlanFeatures(plan: ProductPlan) {
  return {
    voiceCapture: plan === "PREMIUM",
    missionAutoload: plan === "PREMIUM",
    timeDilation: plan === "PREMIUM",
  };
}

export function resolveEffectiveProductPlan(basePlan: ProductPlan, trialActive: boolean) {
  return trialActive ? "PREMIUM" : basePlan;
}
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
