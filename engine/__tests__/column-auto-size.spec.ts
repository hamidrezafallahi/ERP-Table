import { describe, expect, it } from 'vitest';

import {
  autoSizeColumnWidth,
  autoSizeColumnWidths,
  collectAutoSizeTexts,
} from '../dataOps/columnAutoSize';

const measure = (text: string) => text.length * 10;

describe('columnAutoSize (PR-112)', () => {
  it('long Persian content yields wider column than short text', () => {
    const column = { fieldName: 'note', minWidth: 144 };
    const long = 'این یک متن فارسی بسیار طولانی برای اندازه‌گیری auto-size است';
    const short = 'ک';
    const longWidth = autoSizeColumnWidth(column, [long], measure);
    const shortWidth = autoSizeColumnWidth(column, [short], measure);
    expect(longWidth).toBeGreaterThan(shortWidth);
    expect(longWidth).toBeGreaterThan(144);
  });

  it('collectAutoSizeTexts includes header and cell values', () => {
    const texts = collectAutoSizeTexts(
      { fieldName: 'name', fieldCaption: 'نام' },
      [
        {
          cells: {
            name: { display: 'علی', value: 'ali' },
          },
        },
      ],
    );
    expect(texts).toContain('نام');
    expect(texts).toContain('علی');
  });

  it('autoSizeColumnWidths respects colIds filter', () => {
    const columns = [
      { fieldName: 'a', fieldCaption: 'A' },
      { fieldName: 'b', fieldCaption: 'B' },
    ];
    const rows = [
      { cells: { a: { value: 'short' }, b: { value: 'much longer value here' } } },
    ];
    const out = autoSizeColumnWidths(columns, rows, measure, ['a']);
    expect(Object.keys(out)).toEqual(['a']);
    expect(out.b).toBeUndefined();
  });
});
