import { I18nManager, Platform } from 'react-native';
import { reloadAppAsync } from 'expo';
import { getLocales } from 'expo-localization';
import en from './messages/en';
import { isAppLanguage, LANGUAGE_INFO, languageFromTag, LANGUAGES, type AppLanguage } from './languages';
import type { Plural } from './catalog';
import { selectPlural, type PluralForms } from './plural';

export { LANGUAGES, LANGUAGE_INFO, isAppLanguage, type AppLanguage } from './languages';
export { plural, type Plural } from './catalog';

/**
 * CookReel's translations. The language is fixed for the life of the JS process: it is read
 * synchronously at startup, and changing it saves the choice and reloads the app (Arabic needs a
 * reload for right-to-left layout anyway). So `t()` is a plain function — no hooks, no stale strings.
 */

type Widen<T> = T extends Plural ? PluralForms : T extends string ? string : { [K in keyof T]: Widen<T[K]> };
/** Shape every catalog must have: TypeScript rejects a translation with missing or extra keys. */
export type Messages = Widen<typeof en>;

type Join<K extends string, P extends string> = `${K}.${P}`;
type Leaves<T> = {
  [K in keyof T & string]: T[K] extends string | Plural ? K : Join<K, Leaves<T[K]>>;
}[keyof T & string];
export type MessageKey = Leaves<typeof en>;
export type Params = Record<string, string | number>;

export type LanguageSetting = 'system' | AppLanguage;
const LANGUAGE_KEY = 'cookreel.language';
const RTL_RELOAD_KEY = 'cookreel.rtlReload';

/* eslint-disable @typescript-eslint/no-require-imports -- catalogs load lazily, only the one in use */
const loaders: Record<AppLanguage, () => Messages> = {
  en: () => en,
  es: () => require('./messages/es').default as Messages,
  fr: () => require('./messages/fr').default as Messages,
  de: () => require('./messages/de').default as Messages,
  pt: () => require('./messages/pt').default as Messages,
  it: () => require('./messages/it').default as Messages,
  ar: () => require('./messages/ar').default as Messages,
  ja: () => require('./messages/ja').default as Messages,
};

function storage(): { getItemSync(key: string): string | null; setItemSync(key: string, value: string): void } | null {
  try {
    return require('@/native/kv').kv;
  } catch {
    return null; // tests and environments without the native store
  }
}
/* eslint-enable @typescript-eslint/no-require-imports */

function readSetting(): LanguageSetting {
  try {
    const stored = storage()?.getItemSync(LANGUAGE_KEY);
    return isAppLanguage(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

/** First supported language in the device's preference list, else English. */
export function deviceLanguage(): AppLanguage {
  try {
    for (const locale of getLocales()) {
      const language = languageFromTag(locale.languageTag ?? locale.languageCode);
      if (language) return language;
    }
  } catch {
    // no localisation module (tests)
  }
  return 'en';
}

const cache = new Map<AppLanguage, Messages>();
function catalogFor(language: AppLanguage): Messages {
  let catalog = cache.get(language);
  if (!catalog) {
    try {
      catalog = loaders[language]();
    } catch {
      catalog = en;
    }
    cache.set(language, catalog);
  }
  return catalog;
}

let setting: LanguageSetting = readSetting();
let current: AppLanguage = setting === 'system' ? deviceLanguage() : setting;

export const getLanguage = (): AppLanguage => current;
export const getLanguageSetting = (): LanguageSetting => setting;
export const isRTL = (): boolean => LANGUAGE_INFO[current].rtl;
export const intlLocale = (language: AppLanguage = current): string => LANGUAGE_INFO[language].intlLocale;

function lookup(catalog: Messages, key: string): string | PluralForms | undefined {
  let node: unknown = catalog;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' || (typeof node === 'object' && node !== null) ? (node as string | PluralForms) : undefined;
}

// Isolate interpolated values in right-to-left text so numbers and Latin words keep their order.
const FSI = '\u2068';
const PDI = '\u2069';

function interpolate(template: string, language: AppLanguage, params?: Params): string {
  if (!params) return template;
  const rtl = LANGUAGE_INFO[language].rtl;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    if (value === undefined) return match;
    const text = typeof value === 'number' ? formatCount(value, language) : value;
    return rtl ? `${FSI}${text}${PDI}` : text;
  });
}

function formatCount(value: number, language: AppLanguage): string {
  try {
    return new Intl.NumberFormat(LANGUAGE_INFO[language].intlLocale, { maximumFractionDigits: 2 }).format(value);
  } catch {
    return String(value);
  }
}

function translate(language: AppLanguage, key: MessageKey, params?: Params): string {
  const node = lookup(catalogFor(language), key) ?? lookup(en as Messages, key);
  if (node === undefined) return key;
  if (typeof node === 'string') return interpolate(node, language, params);
  const count = typeof params?.count === 'number' ? params.count : Number(params?.count ?? 0);
  return interpolate(selectPlural(language, count, node), language, params);
}

/** Translate into the app language. Plural messages pick their form from `params.count`. */
export function t(key: MessageKey, params?: Params): string {
  return translate(current, key, params);
}

/** Translate into a specific language — for text spoken in a recipe's own language. */
export function tFor(language: AppLanguage, key: MessageKey, params?: Params): string {
  return translate(language, key, params);
}

/** Raw catalog node (string or plural forms) — for lists such as weekday names. */
export function messageNode(key: MessageKey, language: AppLanguage = current): string | PluralForms | undefined {
  return lookup(catalogFor(language), key) ?? lookup(en as Messages, key);
}

/** Removes the bidi isolates `t()` adds, e.g. before text goes to speech synthesis or the clipboard. */
export function stripBidi(text: string): string {
  return text.replace(/[\u2066-\u2069\u200E\u200F]/g, '');
}

/**
 * Makes the native layout direction match the language. Returns true when the app must reload
 * for the change to take effect (React Native reads the direction once at startup).
 */
export function syncLayoutDirection(language: AppLanguage = current): boolean {
  const wantRTL = LANGUAGE_INFO[language].rtl;
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = wantRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
    return false;
  }
  if (I18nManager.isRTL === wantRTL) {
    try {
      storage()?.setItemSync(RTL_RELOAD_KEY, '');
    } catch {
      // ignore
    }
    return false;
  }
  I18nManager.allowRTL(wantRTL);
  I18nManager.forceRTL(wantRTL);
  // Only one reload per direction change, so a platform that ignores forceRTL can't loop.
  const marker = wantRTL ? 'rtl' : 'ltr';
  try {
    const store = storage();
    if (store?.getItemSync(RTL_RELOAD_KEY) === marker) return false;
    store?.setItemSync(RTL_RELOAD_KEY, marker);
  } catch {
    return false;
  }
  return true;
}

/** Saves the language choice and reloads the app in that language. */
export async function setLanguageSetting(next: LanguageSetting): Promise<void> {
  try {
    storage()?.setItemSync(LANGUAGE_KEY, next === 'system' ? '' : next);
  } catch {
    // the choice still applies to this session below
  }
  const resolved = next === 'system' ? deviceLanguage() : next;
  setting = next;
  if (resolved === current) return;
  syncLayoutDirection(resolved);
  await reloadAppAsync('Language changed');
}

/** Called when the OS language changes while the app runs with the "system" setting. */
export async function reloadIfDeviceLanguageChanged(): Promise<void> {
  if (setting !== 'system') return;
  const device = deviceLanguage();
  if (device === current) return;
  syncLayoutDirection(device);
  await reloadAppAsync('Device language changed');
}

/** Test hook: switch language without reloading. */
export function __setLanguageForTests(language: AppLanguage): void {
  current = language;
  setting = language;
}

export const SUPPORTED_LANGUAGES = LANGUAGES;
