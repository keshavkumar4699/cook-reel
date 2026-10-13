const FRACTIONS: [number, string][] = [
  [1 / 8, '⅛'],
  [1 / 4, '¼'],
  [1 / 3, '⅓'],
  [1 / 2, '½'],
  [2 / 3, '⅔'],
  [3 / 4, '¾'],
];

/** Units measured with spoons/cups or counted — shown as friendly fractions, not decimals. */
const FRACTIONAL_UNITS = new Set([
  '',
  'tsp',
  'tbsp',
  'cup',
  'cups',
  'piece',
  'pieces',
  'clove',
  'cloves',
  'slice',
  'slices',
  'can',
  'cans',
  'bunch',
  'pinch',
  'handful',
  'sprig',
  'sprigs',
  'stick',
  'sticks',
  'packet',
]);

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
function roundMetric(value: number): string {
  if (value >= 1000) return String(Math.round(value / 10) * 10);
  if (value >= 100) return String(Math.round(value / 5) * 5);
  if (value >= 10) return String(Math.round(value));
  return String(Math.round(value * 10) / 10);
}

export function formatQuantity(quantity: number | null, unit: string): string {
  if (quantity === null || !Number.isFinite(quantity) || quantity <= 0) return '';
  const u = unit.trim().toLowerCase();
  if (u === 'g' && quantity >= 1000) return `${roundMetric(quantity / 1000)} kg`;
  if (u === 'ml' && quantity >= 1000) return `${roundMetric(quantity / 1000)} l`;
  const amount = FRACTIONAL_UNITS.has(u) ? toFraction(quantity) : roundMetric(quantity);
  return unit.trim() ? `${amount} ${unit.trim()}` : amount;
}

export function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} h ${rest} min` : `${h} h`;
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} sec`;
  const m = Math.round(s / 60);
  return formatMinutes(m);
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
  return value >= 10 ? `${Math.round(value)} g` : `${Math.round(value * 10) / 10} g`;
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: amount >= 10 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount * 100) / 100}`;
  }
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return 'Late-night cravings?';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstName(name: string | null | undefined): string | null {
  const first = (name ?? '').trim().split(/\s+/)[0];
  return first || null;
}
