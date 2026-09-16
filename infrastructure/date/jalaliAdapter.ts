import type { DateAdapter } from '../../application/ports/DateAdapter';
import { normalizeDigits } from '../../engine/dataOps/sortModel';
import {
  gregorianDateToJalali,
  jalaliToGregorianDate,
  pad2,
} from './jalaliMath';

const JALALI_RE = /^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/;

function utcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12),
  );
}

function parseTimestamp(input: unknown): Date | null {
  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    return utcDay(input);
  }
  if (typeof input === 'number' && Number.isFinite(input)) {
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? null : utcDay(d);
  }
  return null;
}

/** Default calendar for Persian hosts (PR-128 / D21). */
export const jalaliAdapter: DateAdapter = {
  id: 'jalali',

  parse(input: unknown): Date | null {
    if (input == null || input === '') return null;
    const fromTs = parseTimestamp(input);
    if (fromTs) return fromTs;
    const text = normalizeDigits(String(input).trim());
    const m = JALALI_RE.exec(text);
    if (!m) return null;
    const jy = Number(m[1]);
    const jm = Number(m[2]);
    const jd = Number(m[3]);
    if (jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;
    return jalaliToGregorianDate(jy, jm, jd);
  },

  format(date: Date): string {
    const { jy, jm, jd } = gregorianDateToJalali(utcDay(date));
    return `${jy}/${pad2(jm)}/${pad2(jd)}`;
  },

  addDays(date: Date, days: number): Date {
    const next = utcDay(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  },

  startOfMonth(date: Date): Date {
    const { jy, jm } = gregorianDateToJalali(utcDay(date));
    return jalaliToGregorianDate(jy, jm, 1);
  },

  compare(a: Date, b: Date): number {
    return utcDay(a).getTime() - utcDay(b).getTime();
  },
};
