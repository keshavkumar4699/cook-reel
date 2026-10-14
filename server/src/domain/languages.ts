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

export function isAppLanguage(value: unknown): value is AppLanguage {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/** The app language for an ISO 639-1 code the model reports ("es", "pt-BR"), or null. */
export function languageFromCode(code: string | null | undefined): AppLanguage | null {
  const base = (code ?? '').trim().toLowerCase().split(/[-_]/)[0];
  return isAppLanguage(base) ? base : null;
}

/** Text the server fills in itself when the model or YouTube leaves a gap. */
export const FALLBACK_TEXT: Record<AppLanguage, { step: string; untitled: string; youtube: string }> = {
  en: { step: 'Next step', untitled: 'Untitled recipe', youtube: 'YouTube recipe' },
  es: { step: 'Siguiente paso', untitled: 'Receta sin título', youtube: 'Receta de YouTube' },
  fr: { step: 'Étape suivante', untitled: 'Recette sans titre', youtube: 'Recette YouTube' },
  de: { step: 'Nächster Schritt', untitled: 'Rezept ohne Titel', youtube: 'YouTube-Rezept' },
  pt: { step: 'Próximo passo', untitled: 'Receita sem título', youtube: 'Receita do YouTube' },
  it: { step: 'Passaggio successivo', untitled: 'Ricetta senza titolo', youtube: 'Ricetta da YouTube' },
  ar: { step: 'الخطوة التالية', untitled: 'وصفة بلا عنوان', youtube: 'وصفة من يوتيوب' },
  ja: { step: '次のステップ', untitled: '無題のレシピ', youtube: 'YouTubeのレシピ' },
};
