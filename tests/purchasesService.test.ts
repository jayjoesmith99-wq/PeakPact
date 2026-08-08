import test from 'node:test';
import assert from 'node:assert/strict';

import { getPurchasePlanSummary } from '../src/services/purchasesService';

test('returns premium purchase options for monthly and lifetime offerings', () => {
  const summary = getPurchasePlanSummary();

  assert.equal(summary.monthly.enabled, true);
  assert.equal(summary.lifetime.enabled, true);
  assert.equal(summary.monthly.title, 'PeakPact Pro');
  assert.equal(summary.lifetime.title, 'PeakPact Lifetime');
});
