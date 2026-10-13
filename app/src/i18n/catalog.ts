import type { PluralForms } from './plural';

declare const pluralBrand: unique symbol;

/** A message that varies with a count. Branded so the type system can tell it apart from a namespace. */
export type Plural = PluralForms & { readonly [pluralBrand]: true };

/**
 * Marks a pluralised message: `plural({ one: '{count} recipe', other: '{count} recipes' })`.
 * Each language lists the CLDR categories it needs (Arabic: zero/one/two/few/many/other; Japanese: other).
 */
export function plural(forms: PluralForms): Plural {
  return forms as Plural;
}
