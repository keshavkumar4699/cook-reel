import type { AppLanguage } from './languages';

export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/** A pluralised message. Only `other` is required; each language fills the categories it uses. */
export interface PluralForms {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

/**
 * CLDR plural category for `count` (hand-written for our languages so we don't depend on
 * Intl.PluralRules, which Hermes may not ship). n = |count|, i = integer digits, v = visible
 * fraction digits — so 1.5 is "one" in French/Portuguese but "other" in English.
 */
export function pluralCategory(language: AppLanguage, count: number): PluralCategory {
  const n = Math.abs(count);
  const i = Math.floor(n);
  const fraction = String(n).split('.')[1] ?? '';
  const v = fraction.length;
  switch (language) {
    case 'en':
    case 'de':
    case 'it':
      return i === 1 && v === 0 ? 'one' : 'other';
    case 'es':
      return n === 1 ? 'one' : 'other';
    case 'fr':
      return i === 0 || i === 1 ? 'one' : 'other';
    case 'pt':
      return i === 0 || i === 1 ? 'one' : 'other';
    case 'ar': {
      if (v !== 0) return 'other';
      if (n === 0) return 'zero';
      if (n === 1) return 'one';
      if (n === 2) return 'two';
      const mod = n % 100;
      if (mod >= 3 && mod <= 10) return 'few';
      if (mod >= 11 && mod <= 99) return 'many';
      return 'other';
    }
    case 'ja':
      return 'other';
  }
}

export function selectPlural(language: AppLanguage, count: number, forms: PluralForms): string {
  return forms[pluralCategory(language, count)] ?? forms.other;
}

export function isPluralForms(value: unknown): value is PluralForms {
  return typeof value === 'object' && value !== null && typeof (value as PluralForms).other === 'string';
}
