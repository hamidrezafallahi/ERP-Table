/**
 * Pure Jalali month-grid helpers for the internal picker (PR-140).
 */

import {
  gregorianDateToJalali,
  jalaliMonthLength,
  jalaliToGregorianDate,
} from './jalaliMath';

export type JalaliYmd = { jy: number; jm: number; jd: number };

export type CalendarCell = {
  ymd: JalaliYmd;
  date: Date;
  inCurrentMonth: boolean;
  /** 0 = Saturday … 6 = Friday (Jalali week starts Saturday). */
  weekday: number;
};

const MONTH_NAMES_FA = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export const JALALI_WEEKDAY_LABELS_FA = [
  'ش',
  'ی',
  'د',
  'س',
  'چ',
  'پ',
  'ج',
] as const;

export function jalaliMonthName(jm: number): string {
  return MONTH_NAMES_FA[jm - 1] ?? String(jm);
}

export function toJalaliYmd(date: Date): JalaliYmd {
  return gregorianDateToJalali(utcNoon(date));
}

export function fromJalaliYmd(ymd: JalaliYmd): Date {
  return jalaliToGregorianDate(ymd.jy, ymd.jm, ymd.jd);
}

export function sameJalaliDay(a: Date, b: Date): boolean {
  const x = toJalaliYmd(a);
  const y = toJalaliYmd(b);
  return x.jy === y.jy && x.jm === y.jm && x.jd === y.jd;
}

export function compareJalaliDay(a: Date, b: Date): number {
  return utcNoon(a).getTime() - utcNoon(b).getTime();
}

export function addJalaliMonths(
  jy: number,
  jm: number,
  delta: number,
): { jy: number; jm: number } {
  const idx = jy * 12 + (jm - 1) + delta;
  return {
    jy: Math.floor(idx / 12),
    jm: (idx % 12) + 1,
  };
}

/**
 * 6×7 grid of days for a Jalali month. Week starts Saturday.
 * Leading/trailing cells may belong to adjacent months (`inCurrentMonth: false`).
 */
export function buildJalaliMonthGrid(jy: number, jm: number): CalendarCell[] {
  const first = jalaliToGregorianDate(jy, jm, 1);
  const jsDow = first.getUTCDay();
  const jalaliWeekStart = (jsDow + 1) % 7;
  const daysInMonth = jalaliMonthLength(jy, jm);
  const cells: CalendarCell[] = [];

  for (let i = 0; i < 42; i += 1) {
    const offset = i - jalaliWeekStart;
    let cellJy = jy;
    let cellJm = jm;
    let cellJd: number;
    let inCurrentMonth = true;

    if (offset < 0) {
      const prev = addJalaliMonths(jy, jm, -1);
      cellJy = prev.jy;
      cellJm = prev.jm;
      cellJd = jalaliMonthLength(cellJy, cellJm) + offset + 1;
      inCurrentMonth = false;
    } else if (offset >= daysInMonth) {
      const next = addJalaliMonths(jy, jm, 1);
      cellJy = next.jy;
      cellJm = next.jm;
      cellJd = offset - daysInMonth + 1;
      inCurrentMonth = false;
    } else {
      cellJd = offset + 1;
    }

    const date = jalaliToGregorianDate(cellJy, cellJm, cellJd);
    cells.push({
      ymd: { jy: cellJy, jm: cellJm, jd: cellJd },
      date,
      inCurrentMonth,
      weekday: i % 7,
    });
  }
  return cells;
}

export type DateRangeValue = {
  start: Date | null;
  end: Date | null;
};

export function isDateInRange(date: Date, range: DateRangeValue): boolean {
  if (!range.start) return false;
  if (!range.end) return sameJalaliDay(date, range.start);
  const t = utcNoon(date).getTime();
  const a = utcNoon(range.start).getTime();
  const b = utcNoon(range.end).getTime();
  return t >= Math.min(a, b) && t <= Math.max(a, b);
}

function utcNoon(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12),
  );
}
