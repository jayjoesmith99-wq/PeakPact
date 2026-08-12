import test from 'node:test';
import assert from 'node:assert/strict';

import { getPurchasePlanSummary } from '../src/services/purchasesService';

test('returns premium purchase options for monthly, yearly, and lifetime offerings', () => {
  const summary = getPurchasePlanSummary();

  assert.equal(summary.monthly.enabled, true);
  assert.equal(summary.yearly.enabled, true);
  assert.equal(summary.lifetime.enabled, true);
  assert.equal(summary.monthly.id, 'premium_monthly');
  assert.equal(summary.yearly.id, 'premium_yearly');
  assert.equal(summary.lifetime.id, 'lifetime_premium');
});
