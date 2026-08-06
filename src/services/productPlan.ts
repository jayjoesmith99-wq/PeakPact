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
