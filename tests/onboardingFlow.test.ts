import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  advanceLaunchStep,
  getInitialLaunchStep,
  isLanguageGateVisible,
  type LaunchStep,
} from '../src/services/onboardingFlow';
import { evaluateDailySweep } from '../src/services/dailySweep';
import { formatMissionCountdown } from '../src/services/missionTimer';
import { applyRecoveryAction } from '../src/services/protocolSystem';
import { extractActiveProductIds } from '../src/services/purchasesService';

describe('onboarding launch flow', () => {
  it('moves from language selection into the cinematic when confirmed', () => {
    assert.strictEqual(advanceLaunchStep('language', 'confirm-language'), 'cinematic');
  });

  it('moves from the cinematic into auth once the tutorial is dismissed or complete', () => {
    assert.strictEqual(advanceLaunchStep('cinematic', 'cinematic-complete'), 'auth');
  });

  it('does not reopen the language gate once the app has advanced beyond it', () => {
    const step: LaunchStep = 'auth';
    assert.strictEqual(isLanguageGateVisible(step), false);
    assert.strictEqual(getInitialLaunchStep(true, 'auth'), 'auth');
  });

  it('keeps new users on the language gate until they confirm a language', () => {
    assert.strictEqual(getInitialLaunchStep(false, null), 'language');
  });

  it('returns a safe zero countdown when the pact deadline is invalid', () => {
    assert.strictEqual(formatMissionCountdown('invalid-date'), '00:00:00');
  });

  it('never turns stale sweep dates into NaN penalties', () => {
    const next = evaluateDailySweep({
      lastPactDate: '',
      today: '2026-08-13',
      currentRedState: false,
    });

    assert.strictEqual(next.penalty, 0);
    assert.strictEqual(next.redState, false);
    assert.strictEqual(next.status, 'ACTIVE');
  });

  it('blocks recovery when the operator cannot afford the stabilization cost', () => {
    const result = applyRecoveryAction({
      pp: 10,
      redState: true,
      stabilizationUsesToday: 0,
      resetDate: '2026-08-13',
      now: new Date('2026-08-13T12:00:00Z'),
      costPP: 15,
    });

    assert.strictEqual(result.applied, false);
    assert.strictEqual(result.nextRedState, true);
  });

  it('extracts RevenueCat entitlements from nested active product state', () => {
    const ids = extractActiveProductIds({
      entitlements: {
        active: {
          pro_access: {
            productIdentifier: 'pro_access',
          },
        },
      },
    });

    assert.deepStrictEqual(ids, ['pro_access']);
  });
});
