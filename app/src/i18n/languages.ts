/** The languages CookReel ships in. Adding one means: a catalog in messages/, starter recipe text and a voice lexicon. */
export const LANGUAGES = ['en', 'es', 'fr', 'de', 'pt', 'it', 'ar', 'ja'] as const;
export type AppLanguage = (typeof LANGUAGES)[number];

export type Script = 'latin' | 'arabic' | 'cjk';

export interface LanguageInfo {
  code: AppLanguage;
  /** Name in its own language, for the picker. */
  nativeName: string;
  /** English name, sent to the AI and shown under the native name. */
  englishName: string;
  rtl: boolean;
  script: Script;
  /** Locale for Intl number/currency formatting (Arabic keeps Latin digits). */
  intlLocale: string;
  /** Speech recogniser locale when the device region doesn't speak this language. */
  defaultSpeechLocale: string;
  /** Regions whose locale variant we prefer for speech when the device is set there. */
  speechRegions: readonly string[];
}

export const LANGUAGE_INFO: Record<AppLanguage, LanguageInfo> = {
  en: { code: 'en', nativeName: 'English', englishName: 'English', rtl: false, script: 'latin', intlLocale: 'en', defaultSpeechLocale: 'en-US', speechRegions: ['US', 'GB', 'IN', 'AU', 'CA', 'IE', 'NZ', 'ZA', 'SG', 'PH', 'NG', 'KE'] },
  es: { code: 'es', nativeName: 'Español', englishName: 'Spanish', rtl: false, script: 'latin', intlLocale: 'es', defaultSpeechLocale: 'es-ES', speechRegions: ['ES', 'MX', 'US', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR'] },
  fr: { code: 'fr', nativeName: 'Français', englishName: 'French', rtl: false, script: 'latin', intlLocale: 'fr', defaultSpeechLocale: 'fr-FR', speechRegions: ['FR', 'CA', 'BE', 'CH', 'LU', 'MC', 'SN', 'CI', 'MA', 'TN', 'DZ'] },
  de: { code: 'de', nativeName: 'Deutsch', englishName: 'German', rtl: false, script: 'latin', intlLocale: 'de', defaultSpeechLocale: 'de-DE', speechRegions: ['DE', 'AT', 'CH', 'LI', 'LU'] },
  pt: { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', rtl: false, script: 'latin', intlLocale: 'pt-BR', defaultSpeechLocale: 'pt-BR', speechRegions: ['BR', 'PT', 'AO', 'MZ'] },
  it: { code: 'it', nativeName: 'Italiano', englishName: 'Italian', rtl: false, script: 'latin', intlLocale: 'it', defaultSpeechLocale: 'it-IT', speechRegions: ['IT', 'CH', 'SM'] },
  ar: { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', rtl: true, script: 'arabic', intlLocale: 'ar-u-nu-latn', defaultSpeechLocale: 'ar-SA', speechRegions: ['SA', 'AE', 'EG', 'JO', 'KW', 'QA', 'BH', 'OM', 'LB', 'MA', 'DZ', 'TN', 'IQ', 'SY', 'YE', 'PS', 'LY', 'SD'] },
  ja: { code: 'ja', nativeName: '日本語', englishName: 'Japanese', rtl: false, script: 'cjk', intlLocale: 'ja', defaultSpeechLocale: 'ja-JP', speechRegions: ['JP'] },
};

export function isAppLanguage(value: unknown): value is AppLanguage {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/** Maps a BCP-47 tag ("pt-PT", "es-419", "ar-EG", "ja-JP") to a supported language, or null. */
export function languageFromTag(tag: string | null | undefined): AppLanguage | null {
  const code = (tag ?? '').toLowerCase().split(/[-_]/)[0];
  return isAppLanguage(code) ? code : null;
}

/** Recogniser locale for a language, using the device region when it speaks that language. */
export function speechLocaleFor(language: AppLanguage, deviceRegion: string | null | undefined): string {
  const info = LANGUAGE_INFO[language];
  const region = (deviceRegion ?? '').toUpperCase();
  return region && info.speechRegions.includes(region) ? `${language}-${region}` : info.defaultSpeechLocale;
}
