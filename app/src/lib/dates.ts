/** Local calendar helpers for the meal planner (dates are YYYY-MM-DD in the device's time zone). */

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Monday-based week containing `date`. */
export function weekDays(date: Date): Date[] {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offset);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const weekdayShort = (date: Date) => WEEKDAYS[date.getDay()]!;
export const monthShort = (date: Date) => MONTHS[date.getMonth()]!;

export function weekLabel(days: Date[]): string {
  const first = days[0]!;
  const last = days[days.length - 1]!;
  return first.getMonth() === last.getMonth()
    ? `${first.getDate()}–${last.getDate()} ${monthShort(last)}`
    : `${first.getDate()} ${monthShort(first)} – ${last.getDate()} ${monthShort(last)}`;
}
