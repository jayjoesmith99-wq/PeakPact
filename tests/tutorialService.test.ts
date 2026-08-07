import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getTutorialSteps } from '../src/services/tutorialService';

describe('tutorial localization', () => {
  it('returns localized tutorial content for Spanish', () => {
    const steps = getTutorialSteps('es');
    assert.ok(steps[0].title.toLowerCase().includes('operador'));
    assert.ok(steps[0].body.toLowerCase().includes('contratos'));
    assert.ok(steps[0].hint.toLowerCase().includes('desliza'));
  });
});
