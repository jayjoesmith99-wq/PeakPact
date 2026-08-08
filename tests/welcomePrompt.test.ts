import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getWelcomePromptHighlights } from '../src/services/welcomePrompt';

describe('welcome prompt highlights', () => {
  it('includes the core welcome briefing elements', () => {
    const highlights = getWelcomePromptHighlights('en');
    const titles = highlights.map((item) => item.title);

    assert.ok(titles.includes('WRITE THE CONTRACT'));
    assert.ok(titles.includes('AI VERIFICATION'));
    assert.ok(titles.includes('SQUAD ACCOUNTABILITY'));
    assert.ok(titles.includes('SYSTEM GALLERY'));
    assert.ok(titles.includes('OPERATOR PROFILE'));
    assert.ok(titles.includes('SYSTEM SETTINGS'));
  });
});
