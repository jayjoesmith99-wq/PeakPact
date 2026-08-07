import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getLocalizedText, getSupportedLanguages } from '../src/services/i18n';

describe('i18n service', () => {
  it('returns Spanish translations for the main dashboard actions', () => {
    const text = getLocalizedText('tabPact', 'es');
    assert.strictEqual(text, 'PACTO');
  });

  it('includes the requested languages in the supported list', () => {
    const languages = getSupportedLanguages();
    const codes = languages.map((language) => language.code);
    assert.ok(codes.includes('en'));
    assert.ok(codes.includes('es'));
    assert.ok(codes.includes('fr'));
    assert.ok(codes.includes('de'));
    assert.ok(codes.includes('pt'));
    assert.ok(codes.includes('ja'));
    assert.ok(codes.includes('zh'));
  });
});
