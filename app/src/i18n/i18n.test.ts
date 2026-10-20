import { I18nManager } from 'react-native';
import { languageFromTag, speechLocaleFor } from './languages';
import { pluralCategory } from './plural';
import { syncLayoutDirection } from './index';

jest.mock('@/native/kv', () => {
  const store = new Map<string, string>();
  return { kv: { getItemSync: (key: string) => store.get(key) ?? null, setItemSync: (key: string, value: string) => store.set(key, value) } };
});

describe('plural categories', () => {
  it.each([
    ['en', 1, 'one'],
    ['en', 1.5, 'other'],
    ['en', 0, 'other'],
    ['de', 1, 'one'],
    ['es', 1, 'one'],
    ['es', 1.5, 'other'],
    ['fr', 0, 'one'],
    ['fr', 1.5, 'one'],
    ['fr', 2, 'other'],
    ['pt', 0, 'one'],
    ['pt', 2, 'other'],
    ['ar', 0, 'zero'],
    ['ar', 1, 'one'],
    ['ar', 2, 'two'],
    ['ar', 3, 'few'],
    ['ar', 10, 'few'],
    ['ar', 11, 'many'],
    ['ar', 99, 'many'],
    ['ar', 100, 'other'],
    ['ar', 103, 'few'],
    ['ar', 1.5, 'other'],
    ['ja', 1, 'other'],
  ] as const)('%s %d → %s', (language, count, expected) => {
    expect(pluralCategory(language, count)).toBe(expected);
  });
});

describe('language resolution', () => {
  it('maps device locales to app languages, and nothing else', () => {
    expect(languageFromTag('pt-PT')).toBe('pt');
    expect(languageFromTag('es-419')).toBe('es');
    expect(languageFromTag('ar_EG')).toBe('ar');
    expect(languageFromTag('ja-JP')).toBe('ja');
    expect(languageFromTag('hi-IN')).toBeNull();
    expect(languageFromTag('zh-Hans-CN')).toBeNull();
    expect(languageFromTag(undefined)).toBeNull();
  });

  it('listens in the cook’s regional variant when their region speaks the language', () => {
    expect(speechLocaleFor('es', 'MX')).toBe('es-MX');
    expect(speechLocaleFor('es', 'JP')).toBe('es-ES');
    expect(speechLocaleFor('en', 'IN')).toBe('en-IN');
    expect(speechLocaleFor('pt', 'PT')).toBe('pt-PT');
    expect(speechLocaleFor('ar', null)).toBe('ar-SA');
  });
});

describe('right-to-left layout', () => {
  it('asks for one restart per direction change, never a loop', () => {
    const forceRTL = jest.spyOn(I18nManager, 'forceRTL').mockImplementation(() => undefined);
    expect(I18nManager.isRTL).toBe(false);
    expect(syncLayoutDirection('ar')).toBe(true);
    expect(forceRTL).toHaveBeenCalledWith(true);
    // The platform ignored the change (still LTR after the restart): don't restart again.
    expect(syncLayoutDirection('ar')).toBe(false);
    // Already left-to-right: nothing to do, and the guard resets for the next change.
    expect(syncLayoutDirection('en')).toBe(false);
    expect(syncLayoutDirection('ar')).toBe(true);
    forceRTL.mockRestore();
  });
});
