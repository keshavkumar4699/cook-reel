import { t, type MessageKey } from '@/i18n';
import { formatDecimal } from '@/i18n/format';
import { canonicalUnitCode, FRACTIONAL_UNITS } from './units';

export { formatCurrency } from '@/i18n/format';

const FRACTIONS: [number, string][] = [
  [1 / 8, '⅛'],
  [1 / 4, '¼'],
  [1 / 3, '⅓'],
  [1 / 2, '½'],
  [2 / 3, '⅔'],
  [3 / 4, '¾'],
];

function toFraction(value: number): string {
  const whole = Math.floor(value);
  const rest = value - whole;
  if (rest < 0.06) return String(whole || (value > 0 ? '⅛' : '0'));
  if (rest > 0.94) return String(whole + 1);
  let best = FRACTIONS[0]!;
  for (const candidate of FRACTIONS) {
    if (Math.abs(candidate[0] - rest) < Math.abs(best[0] - rest)) best = candidate;
  }
  return whole > 0 ? `${whole}${best[1]}` : best[1];
}

/** Rounds metric amounts the way a recipe card would print them. */
function roundMetric(value: number): number {
  if (value >= 1000) return Math.round(value / 10) * 10;
  if (value >= 100) return Math.round(value / 5) * 5;
  if (value >= 10) return Math.round(value);
  return Math.round(value * 10) / 10;
}

/**
 * "½ tsp", "1½ cups", "1.5 kg" (or "1,5 kg", "大さじ½"…) in the app language. Unknown units are
 * shown as written.
 */
export function formatQuantity(quantity: number | null, unit: string): string {
  if (quantity === null || !Number.isFinite(quantity) || quantity <= 0) return '';
  let code = canonicalUnitCode(unit);
  let value = quantity;
  if (code === 'g' && value >= 1000) [code, value] = ['kg', value / 1000];
  if (code === 'ml' && value >= 1000) [code, value] = ['l', value / 1000];
  const fractional = code === null || FRACTIONAL_UNITS.has(code);
  const amount = fractional ? toFraction(value) : formatDecimal(roundMetric(value));
  if (code === null) return `${amount} ${unit.trim()}`;
  // Amounts of one or less read as singular in every language we support ("½ cup").
  return t(`common.units.${code}` as MessageKey, { n: amount, count: value <= 1 ? 1 : value });
}

export function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return t('common.duration.minutes', { n: String(m) });
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? t('common.duration.hoursMinutes', { h: String(h), m: String(rest) }) : t('common.duration.hours', { n: String(h) });
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return t('common.duration.seconds', { n: String(s) });
  return formatMinutes(Math.round(s / 60));
}

/** 75 → "1:15", 3725 → "1:02:05" */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

export function formatGrams(value: number): string {
  const amount = value >= 10 ? String(Math.round(value)) : formatDecimal(value);
  return t('common.units.g', { n: amount });
}

/**
 * @deprecated Use a plural message from the catalog, e.g. t('common.counts.recipes', { count }).
 * Kept only until every call site is migrated.
 */
export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return t('common.greeting.lateNight');
  if (h < 12) return t('common.greeting.morning');
  if (h < 17) return t('common.greeting.afternoon');
  return t('common.greeting.evening');
}

export function firstName(name: string | null | undefined): string | null {
  const first = (name ?? '').trim().split(/\s+/)[0];
  return first || null;
}
