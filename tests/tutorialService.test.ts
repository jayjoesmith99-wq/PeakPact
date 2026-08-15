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

  it('teaches optional voice confirmation in every supported language', () => {
    for (const language of ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh', 'ro', 'it']) {
      const voiceStep = getTutorialSteps(language).at(-1);
      assert.ok(voiceStep);
      assert.equal(voiceStep?.tab, 'PACT');
      assert.ok(voiceStep?.title);
      assert.ok(voiceStep?.body.includes('optional') || voiceStep?.body.includes('opcional') || voiceStep?.body.includes('facultatif') || voiceStep?.body.includes('facultative') || voiceStep?.body.includes('opțional') || voiceStep?.body.includes('facoltativa') || voiceStep?.body.includes('任意') || voiceStep?.body.includes('可选'));
      assert.ok(voiceStep?.hint);
    }
  });
});
