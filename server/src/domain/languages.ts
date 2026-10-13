import { z } from 'zod';

/** The languages CookReel's app ships in; AI output and narration follow the cook's choice. */
export const LANGUAGES = ['en', 'es', 'fr', 'de', 'pt', 'it', 'ar', 'ja'] as const;
export type AppLanguage = (typeof LANGUAGES)[number];

/** Old app builds don't send a language: they get English. */
export const LanguageSchema = z.enum(LANGUAGES).default('en');

export const LANGUAGE_INFO: Record<AppLanguage, { name: string; register: string; script: 'latin' | 'arabic' | 'cjk' }> = {
  en: { name: 'English', register: 'friendly, plain English', script: 'latin' },
  es: { name: 'Spanish', register: 'neutral Spanish, informal "tú"', script: 'latin' },
  fr: { name: 'French', register: 'French, polite "vous"', script: 'latin' },
  de: { name: 'German', register: 'German, informal "du"', script: 'latin' },
  pt: { name: 'Portuguese', register: 'Brazilian Portuguese, "você"', script: 'latin' },
  it: { name: 'Italian', register: 'Italian, informal "tu"', script: 'latin' },
  ar: { name: 'Arabic', register: 'Modern Standard Arabic, gender-neutral where possible, Western digits', script: 'arabic' },
  ja: { name: 'Japanese', register: 'Japanese, polite です/ます style', script: 'cjk' },
};
