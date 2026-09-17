/**
 * Iranian financial (fiscal) periods on the Jalali calendar (PR-140).
 * Iranian FY = 1 Farvardin … 29/30 Esfand of the same Jalali year.
 */

import {
  gregorianDateToJalali,
  jalaliMonthLength,
  jalaliToGregorianDate,
} from '../date/jalaliMath';

export type FinancialPeriod = {
  /** e.g. `fy-1404` */
  id: string;
  /** e.g. `سال مالی ۱۴۰۴` */
  label: string;
  /** Jalali year of the period */
  jalaliYear: number;
  start: Date;
  end: Date;
};

function utcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12),
  );
}

/** Jalali year that owns this civil date for Iranian FY purposes. */
export function jalaliFinancialYear(date: Date): number {
  return gregorianDateToJalali(utcDay(date)).jy;
}

export function financialPeriodForYear(jalaliYear: number): FinancialPeriod {
  const start = jalaliToGregorianDate(jalaliYear, 1, 1);
  const lastDay = jalaliMonthLength(jalaliYear, 12);
  const end = jalaliToGregorianDate(jalaliYear, 12, lastDay);
  return {
    id: `fy-${jalaliYear}`,
    label: `سال مالی ${jalaliYear}`,
    jalaliYear,
    start,
    end,
  };
}

export function financialPeriodForDate(date: Date): FinancialPeriod {
  return financialPeriodForYear(jalaliFinancialYear(date));
}

export function listFinancialPeriods(
  fromJalaliYear: number,
  toJalaliYear: number,
): FinancialPeriod[] {
  const from = Math.min(fromJalaliYear, toJalaliYear);
  const to = Math.max(fromJalaliYear, toJalaliYear);
  const out: FinancialPeriod[] = [];
  for (let y = from; y <= to; y += 1) {
    out.push(financialPeriodForYear(y));
  }
  return out;
}

export function isInFinancialPeriod(
  date: Date,
  period: FinancialPeriod,
): boolean {
  const t = utcDay(date).getTime();
  return t >= period.start.getTime() && t <= period.end.getTime();
}

/** Inclusive list of month starts (1 … 12) for a FY. */
export function financialMonths(jalaliYear: number): Date[] {
  const months: Date[] = [];
  for (let m = 1; m <= 12; m += 1) {
    months.push(jalaliToGregorianDate(jalaliYear, m, 1));
  }
  return months;
}
