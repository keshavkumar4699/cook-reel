import { t, type MessageKey } from '@/i18n';

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

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;

export const weekdayShort = (date: Date) => t(`common.dates.weekdaysShort.${WEEKDAY_KEYS[date.getDay()]!}` as MessageKey);
export const monthShort = (date: Date) => t(`common.dates.monthsShort.${MONTH_KEYS[date.getMonth()]!}` as MessageKey);

/** "Tue 13" for the planner's day strip. */
export const weekdayDay = (date: Date) => t('common.dates.weekdayDay', { weekday: weekdayShort(date), day: String(date.getDate()) });

/** "12 Oct" */
export const formatDayMonth = (date: Date) => t('common.dates.dayMonth', { day: String(date.getDate()), month: monthShort(date) });

/** "12 Oct 2026" */
export const formatDate = (date: Date) =>
  t('common.dates.dayMonthYear', { day: String(date.getDate()), month: monthShort(date), year: String(date.getFullYear()) });

export function weekLabel(days: Date[]): string {
  const first = days[0]!;
  const last = days[days.length - 1]!;
  return first.getMonth() === last.getMonth()
    ? t('common.dates.weekRangeSameMonth', { start: String(first.getDate()), end: String(last.getDate()), month: monthShort(last) })
    : t('common.dates.weekRangeCrossMonth', {
        start: String(first.getDate()),
        startMonth: monthShort(first),
        end: String(last.getDate()),
        endMonth: monthShort(last),
      });
}
