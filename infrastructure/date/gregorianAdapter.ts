import type { DateAdapter } from '../../application/ports/DateAdapter';
import { normalizeDigits } from '../../engine/dataOps/sortModel';
import { pad2 } from './jalaliMath';

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const SLASH_RE = /^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/;

function utcDay(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function asUtcDay(date: Date): Date {
  return utcDay(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

/** Gregorian calendar adapter (PR-128 / D21). */
export const gregorianAdapter: DateAdapter = {
  id: 'gregory',

  parse(input: unknown): Date | null {
    if (input == null || input === '') return null;
    if (input instanceof Date && !Number.isNaN(input.getTime())) {
      return asUtcDay(input);
    }
    if (typeof input === 'number' && Number.isFinite(input)) {
      const d = new Date(input);
      return Number.isNaN(d.getTime()) ? null : asUtcDay(d);
    }
    const text = normalizeDigits(String(input).trim());
    const iso = ISO_RE.exec(text);
    if (iso) {
      return utcDay(Number(iso[1]), Number(iso[2]), Number(iso[3]));
    }
    const slash = SLASH_RE.exec(text);
    if (slash) {
      return utcDay(Number(slash[1]), Number(slash[2]), Number(slash[3]));
    }
    const fallback = new Date(text);
    return Number.isNaN(fallback.getTime()) ? null : asUtcDay(fallback);
  },

  format(date: Date): string {
    const d = asUtcDay(date);
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  },

  addDays(date: Date, days: number): Date {
    const next = asUtcDay(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  },

  startOfMonth(date: Date): Date {
    const d = asUtcDay(date);
    return utcDay(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
  },

  compare(a: Date, b: Date): number {
    return asUtcDay(a).getTime() - asUtcDay(b).getTime();
  },
};
