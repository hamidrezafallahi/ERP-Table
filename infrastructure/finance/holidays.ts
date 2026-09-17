/**
 * Iranian official holidays (Jalali fixed dates) (PR-140).
 * Lunar/Islamic moveable holidays can be merged via `extra`.
 */

import {
  gregorianDateToJalali,
  jalaliToGregorianDate,
} from '../date/jalaliMath';
import { jalaliAdapter } from '../date/jalaliAdapter';

export type IranHoliday = {
  /** Jalali month 1–12 */
  jm: number;
  /** Jalali day */
  jd: number;
  title: string;
  /** When set, holiday applies only to that Jalali year */
  jy?: number;
};

/** Civil / solar fixed holidays observed every Jalali year. */
export const IRAN_FIXED_HOLIDAYS: readonly IranHoliday[] = [
  { jm: 1, jd: 1, title: 'نوروز' },
  { jm: 1, jd: 2, title: 'عید نوروز' },
  { jm: 1, jd: 3, title: 'عید نوروز' },
  { jm: 1, jd: 4, title: 'عید نوروز' },
  { jm: 1, jd: 12, title: 'روز جمهوری اسلامی' },
  { jm: 1, jd: 13, title: 'سیزده‌به‌در' },
  { jm: 3, jd: 14, title: 'رحلت امام خمینی' },
  { jm: 3, jd: 15, title: 'قیام ۱۵ خرداد' },
  { jm: 11, jd: 22, title: 'پیروزی انقلاب اسلامی' },
  { jm: 12, jd: 29, title: 'ملی شدن صنعت نفت' },
];

function utcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12),
  );
}

export function iranHolidaysForYear(
  jalaliYear: number,
  extra: readonly IranHoliday[] = [],
): Array<IranHoliday & { date: Date }> {
  const combined = [...IRAN_FIXED_HOLIDAYS, ...extra].filter(
    (h) => h.jy == null || h.jy === jalaliYear,
  );
  return combined.map((h) => ({
    ...h,
    jy: jalaliYear,
    date: jalaliToGregorianDate(jalaliYear, h.jm, h.jd),
  }));
}

export function isIranHoliday(
  date: Date,
  extra: readonly IranHoliday[] = [],
): boolean {
  const { jy, jm, jd } = gregorianDateToJalali(utcDay(date));
  return iranHolidaysForYear(jy, extra).some(
    (h) => h.jm === jm && h.jd === jd,
  );
}

export function holidayTitle(
  date: Date,
  extra: readonly IranHoliday[] = [],
): string | null {
  const { jy, jm, jd } = gregorianDateToJalali(utcDay(date));
  const hit = iranHolidaysForYear(jy, extra).find(
    (h) => h.jm === jm && h.jd === jd,
  );
  return hit?.title ?? null;
}

/** Skip Fridays (Iran weekend) and holidays; returns next open day. */
export function nextBusinessDay(
  date: Date,
  extra: readonly IranHoliday[] = [],
): Date {
  let cursor = jalaliAdapter.addDays(utcDay(date), 1);
  for (let i = 0; i < 366; i += 1) {
    const dow = cursor.getUTCDay(); // 5 = Friday
    if (dow !== 5 && !isIranHoliday(cursor, extra)) return cursor;
    cursor = jalaliAdapter.addDays(cursor, 1);
  }
  return cursor;
}
