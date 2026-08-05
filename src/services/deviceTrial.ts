export const DEVICE_PREMIUM_TRIAL_STORAGE_KEY = '@peakpact/device-premium-trial-started-at-v1';
export const DEVICE_PREMIUM_TRIAL_DAYS = 7;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type StorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

export type DevicePremiumTrialStatus = {
  active: boolean;
  startedAt: string | null;
  endsAt: string | null;
  remainingDays: number;
};

export const ensureDevicePremiumTrialStarted = async (
  storage: StorageLike,
  now: Date = new Date(),
): Promise<string> => {
  const existing = await storage.getItem(DEVICE_PREMIUM_TRIAL_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const startedAt = now.toISOString();
  await storage.setItem(DEVICE_PREMIUM_TRIAL_STORAGE_KEY, startedAt);
  return startedAt;
};

export const getDevicePremiumTrialStatus = (
  startedAt: string | null,
  nowMs: number = Date.now(),
): DevicePremiumTrialStatus => {
  if (!startedAt) {
    return {
      active: false,
      startedAt: null,
      endsAt: null,
      remainingDays: 0,
    };
  }

  const startedAtMs = Date.parse(startedAt);
  if (Number.isNaN(startedAtMs)) {
    return {
      active: false,
      startedAt: null,
      endsAt: null,
      remainingDays: 0,
    };
  }

  const endsAtMs = startedAtMs + DEVICE_PREMIUM_TRIAL_DAYS * DAY_IN_MS;
  const remainingMs = endsAtMs - nowMs;
  const active = remainingMs > 0;

  return {
    active,
    startedAt,
    endsAt: new Date(endsAtMs).toISOString(),
    remainingDays: active ? Math.ceil(remainingMs / DAY_IN_MS) : 0,
  };
};
