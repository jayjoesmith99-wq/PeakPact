type StorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

const DEVICE_PREMIUM_TRIAL_KEY = '@peakpact/device-premium-trial-started-at';

export async function getDevicePremiumTrialStartedAt(storage: StorageLike): Promise<string | null> {
  const startedAt = await storage.getItem(DEVICE_PREMIUM_TRIAL_KEY);
  return startedAt && Number.isFinite(Date.parse(startedAt)) ? startedAt : null;
}

export async function ensureDevicePremiumTrialStarted(storage: StorageLike): Promise<string> {
  const existingStart = await getDevicePremiumTrialStartedAt(storage);
  if (existingStart) {
    return existingStart;
  }

  const startedAt = new Date().toISOString();
  await storage.setItem(DEVICE_PREMIUM_TRIAL_KEY, startedAt);
  return startedAt;
}

export function getDevicePremiumTrialStatus(startedAt: string | null, now: number) {
  if (!startedAt) {
    return { active: false, remainingDays: 0 };
  }
  const started = Date.parse(startedAt);
  const days = Math.max(0, Math.ceil((now - started) / 86400000));
  const remaining = Math.max(0, 7 - days);
  return { active: remaining > 0, remainingDays: remaining };
}
