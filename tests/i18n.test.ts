import assert from 'node:assert/strict';
import i18n from 'i18next';
import { describe, it } from 'node:test';
import { getLocalizedText, getSupportedLanguages, initializeI18n, resources } from '../src/services/i18n';

describe('i18n service', () => {
  it('returns Spanish translations for the main dashboard actions', () => {
    const text = getLocalizedText('tabPact', 'es');
    assert.strictEqual(text, 'PACTO');
  });

  it('loads every supported language bundle into i18next', async () => {
    await initializeI18n();
    const codes = getSupportedLanguages().map((language) => language.code);

    for (const code of codes) {
      assert.ok(i18n.hasResourceBundle(code, 'translation'));
    }
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
    assert.ok(codes.includes('ro'));
    assert.ok(codes.includes('it'));
  });

  it('keeps every supported language complete with non-empty translations', () => {
    const englishKeys = Object.keys(resources.en.translation);

    for (const language of getSupportedLanguages()) {
      const translations = resources[language.code].translation;

      for (const key of englishKeys) {
        assert.ok(Object.prototype.hasOwnProperty.call(translations, key), `${language.code} is missing ${key}`);
        assert.notStrictEqual(translations[key as keyof typeof translations], '', `${language.code}.${key} is empty`);
      }
    }
  });
});
