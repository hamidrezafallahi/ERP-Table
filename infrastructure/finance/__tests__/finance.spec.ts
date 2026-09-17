import { describe, expect, it } from 'vitest';

import {
  convertCurrency,
  financialPeriodForDate,
  financialPeriodForYear,
  formatPrice,
  isIranHoliday,
  listFinancialPeriods,
  nextBusinessDay,
  numberToPersianWords,
  rialToToman,
  tomanToRial,
} from '../index';
import { jalaliToGregorianDate } from '../../date/jalaliMath';

describe('PR-140 finance — currency', () => {
  it('converts rial ↔ toman (10:1)', () => {
    expect(rialToToman(100_000)).toBe(10_000);
    expect(tomanToRial(10_000)).toBe(100_000);
    expect(convertCurrency(50, 'toman', 'rial')).toBe(500);
    expect(convertCurrency(500, 'rial', 'toman')).toBe(50);
  });

  it('formats with unit labels', () => {
    const rial = formatPrice(1_250_000, {
      unit: 'rial',
      displayUnit: 'rial',
      persianDigits: false,
      locale: 'en-US',
    });
    expect(rial).toContain('1,250,000');
    expect(rial).toContain('ریال');

    const toman = formatPrice(1_250_000, {
      unit: 'rial',
      displayUnit: 'toman',
      persianDigits: false,
      locale: 'en-US',
    });
    expect(toman).toContain('125,000');
    expect(toman).toContain('تومان');
  });
});

describe('PR-140 finance — Persian words', () => {
  it('converts common document amounts', () => {
    expect(numberToPersianWords(0)).toBe('صفر');
    expect(numberToPersianWords(12)).toBe('دوازده');
    expect(numberToPersianWords(25)).toBe('بیست و پنج');
    expect(numberToPersianWords(100)).toBe('صد');
    expect(numberToPersianWords(1000)).toBe('یک هزار');
    expect(numberToPersianWords(1_250_000, { currency: 'rial' })).toBe(
      'یک میلیون و دویست و پنجاه هزار ریال',
    );
  });

  it('handles negatives', () => {
    expect(numberToPersianWords(-3)).toBe('منفی سه');
  });
});

describe('PR-140 finance — periods & holidays', () => {
  it('builds Iranian FY from Farvardin 1 to Esfand end', () => {
    const fy = financialPeriodForYear(1403);
    expect(fy.id).toBe('fy-1403');
    expect(fy.start.getTime()).toBe(jalaliToGregorianDate(1403, 1, 1).getTime());
    expect(fy.end.getTime()).toBe(jalaliToGregorianDate(1403, 12, 30).getTime()); // 1403 leap
  });

  it('resolves period for a mid-year date', () => {
    const mid = jalaliToGregorianDate(1404, 6, 15);
    expect(financialPeriodForDate(mid).jalaliYear).toBe(1404);
  });

  it('lists contiguous periods', () => {
    expect(listFinancialPeriods(1402, 1404).map((p) => p.jalaliYear)).toEqual([
      1402, 1403, 1404,
    ]);
  });

  it('flags Nowruz as holiday and skips to next business day', () => {
    const nowruz = jalaliToGregorianDate(1404, 1, 1);
    expect(isIranHoliday(nowruz)).toBe(true);
    // 1404/01/01 is a weekday cycle; nextBusinessDay must not land on holiday or Friday
    const next = nextBusinessDay(nowruz);
    expect(isIranHoliday(next)).toBe(false);
    expect(next.getUTCDay()).not.toBe(5);
  });
});
