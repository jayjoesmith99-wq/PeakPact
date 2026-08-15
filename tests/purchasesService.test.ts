import test from 'node:test';
import assert from 'node:assert/strict';

import { getPurchasePlanSummary } from '../src/services/purchasesService';
import {
  ensureDevicePremiumTrialStarted,
  getDevicePremiumTrialStartedAt,
  getDevicePremiumTrialStatus,
} from '../src/services/deviceTrial';

test('returns premium purchase options for monthly, yearly, and lifetime offerings', () => {
  const summary = getPurchasePlanSummary();

  assert.equal(summary.monthly.enabled, true);
  assert.equal(summary.yearly.enabled, true);
  assert.equal(summary.lifetime.enabled, true);
  assert.equal(summary.monthly.id, 'monthly_premium');
  assert.equal(summary.yearly.id, 'yearly_premium');
  assert.equal(summary.lifetime.id, 'lifetime_premium');
});

test('starts a device trial only when explicitly requested and preserves its original start time', async () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      values.set(key, value);
    },
  };

  assert.equal(await getDevicePremiumTrialStartedAt(storage), null);
  const startedAt = await ensureDevicePremiumTrialStarted(storage);
  assert.equal(await ensureDevicePremiumTrialStarted(storage), startedAt);
  assert.equal(getDevicePremiumTrialStatus(startedAt, Date.parse(startedAt)).remainingDays, 7);
});
