import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getFirstSessionGuide } from '../src/services/missionSystem';

describe('first-session onboarding', () => {
  it('uses clearer plain-language guidance for new users', () => {
    const guide = getFirstSessionGuide('en');

    assert.ok(guide.body.toLowerCase().includes('small win'));
    assert.ok(guide.steps.some((step) => step.title.toLowerCase().includes('pick')));
    assert.ok(guide.steps.some((step) => step.body.toLowerCase().includes('finish today')));
    assert.ok(guide.primaryAction.toLowerCase().includes('task'));
  });
});
