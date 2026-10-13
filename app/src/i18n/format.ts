import { getLanguage, intlLocale, t } from './index';

/** Full-width (Japanese IME) and Arabic-Indic digits → ASCII, so typed numbers parse anywhere. */
export function normalizeDigits(text: string): string {
  return text
    .replace(/[\uFF10-\uFF19]/g, (d) => String(d.charCodeAt(0) - 0xff10))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\u066B/g, '.') // Arabic decimal separator
    .replace(/\uFF0F/g, '/') // full-width slash
    .replace(/\uFF0E/g, '.'); // full-width full stop
}

/** Parses a number typed with any digits and either decimal separator; NaN when it isn't one. */
export function parseLocaleNumber(text: string): number {
  const cleaned = normalizeDigits(text).trim().replace(/\s/g, '');
  if (!cleaned) return Number.NaN;
  return Number(cleaned.replace(',', '.'));
}

/** Plain decimal in the app language (1.5 → "1,5" in German). */
export function formatDecimal(value: number, maxFractionDigits = 1): string {
  const rounded = Math.round(value * 10 ** maxFractionDigits) / 10 ** maxFractionDigits;
  const [whole, fraction] = String(rounded).split('.');
  return fraction ? `${whole}${t('common.format.decimalSeparator')}${fraction}` : (whole ?? '0');
}

/** Grouped integer ("1,200" / "1.200" / "1 200"). */
export function formatInteger(value: number): string {
  const n = Math.round(value);
  try {
    return new Intl.NumberFormat(intlLocale(), { maximumFractionDigits: 0 }).format(n);
  } catch {
    return String(n);
  }
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(intlLocale(), {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: amount >= 10 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${formatDecimal(amount, 2)}`;
  }
}

/** Joins items for running text with the language's list separator. */
export function joinList(items: string[]): string {
  return items.filter(Boolean).join(t('common.format.listSeparator'));
}

/** Joins short facts with the language's middle-dot separator ("25 min · 2 servings"). */
export function joinFacts(items: (string | null | false | undefined)[]): string {
  return items.filter((item): item is string => !!item).join(t('common.format.dot'));
}

export { getLanguage };
