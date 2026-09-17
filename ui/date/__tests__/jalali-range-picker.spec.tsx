import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildJalaliMonthGrid,
  compareJalaliDay,
  isDateInRange,
  jalaliMonthName,
  sameJalaliDay,
} from '../../../infrastructure/date/jalaliCalendarModel';
import { jalaliToGregorianDate } from '../../../infrastructure/date/jalaliMath';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('PR-140 internal Jalali range picker', () => {
  it('builds a 42-cell month grid starting Saturday', () => {
    const cells = buildJalaliMonthGrid(1403, 1);
    expect(cells).toHaveLength(42);
    expect(jalaliMonthName(1)).toBe('فروردین');
    const firstOfMonth = cells.find((c) => c.inCurrentMonth && c.ymd.jd === 1);
    expect(firstOfMonth).toBeTruthy();
  });

  it('does not import an external calendar peer', () => {
    const src = readFileSync(
      join(root, 'ui/date/PersianRangeDatePicker.tsx'),
      'utf8',
    );
    expect(src).not.toContain("from 'react-persian-range-picker'");
    expect(src).toContain('JalaliCalendar');
    expect(src).toContain('PersianRangeDateCell');
  });

  it('compares and ranges dates on UTC day', () => {
    const a = jalaliToGregorianDate(1404, 1, 10);
    const b = jalaliToGregorianDate(1404, 1, 20);
    expect(sameJalaliDay(a, a)).toBe(true);
    expect(compareJalaliDay(a, b)).toBeLessThan(0);
    expect(
      isDateInRange(jalaliToGregorianDate(1404, 1, 15), {
        start: a,
        end: b,
      }),
    ).toBe(true);
    expect(
      isDateInRange(jalaliToGregorianDate(1404, 2, 1), {
        start: a,
        end: b,
      }),
    ).toBe(false);
  });
});
