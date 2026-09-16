import { describe, expect, it } from 'vitest';

import {
  buildClipboardPayload,
  resolveCopyRanges,
} from '../selection/clipboardCopy';
import type { CellRange } from '../selection/cellRange';

const rows = [
  {
    id: 1,
    cells: {
      name: { value: 'علی', display: 'علی' },
      amount: { value: 123456, display: '۱۲۳٬۴۵۶' },
    },
  },
  {
    id: 2,
    cells: {
      name: { value: 'Reza', display: 'Reza' },
      amount: { value: 789, display: '789' },
    },
  },
];

const columns = [
  { id: 'name', header: 'نام' },
  { id: 'amount', header: 'مبلغ' },
];

describe('PR-106 clipboard copy (pure)', () => {
  it('resolveCopyRanges falls back to active cell', () => {
    expect(
      resolveCopyRanges([], { rowIndex: 1, colId: 'amount' }),
    ).toEqual([{ startRow: 1, endRow: 1, colIds: ['amount'] }]);
  });

  it('builds TSV for a rectangular range with latin digits by default', () => {
    const ranges: CellRange[] = [
      { startRow: 0, endRow: 1, colIds: ['name', 'amount'] },
    ];
    const payload = buildClipboardPayload({ ranges, rows, columns });
    expect(payload).not.toBeNull();
    expect(payload!.plainText).toBe(
      'علی\t123456\nReza\t789',
    );
    expect(payload!.html).toContain('<table><tbody>');
    expect(payload!.html).toContain('123456');
    expect(payload!.html).not.toContain('۱۲۳');
  });

  it('honors copyFormattedValue and copyHeadersToClipboard', () => {
    const ranges: CellRange[] = [
      { startRow: 0, endRow: 0, colIds: ['amount'] },
    ];
    const payload = buildClipboardPayload({
      ranges,
      rows,
      columns,
      options: {
        copyFormattedValue: true,
        copyHeadersToClipboard: true,
        copyDigitsAsLatin: false,
      },
    });
    expect(payload!.plainText).toBe('مبلغ\n۱۲۳٬۴۵۶');
    expect(payload!.html).toContain('<th>مبلغ</th>');
    expect(payload!.html).toContain('۱۲۳٬۴۵۶');
  });

  it('processCellForClipboard can override cell text', () => {
    const payload = buildClipboardPayload({
      ranges: [{ startRow: 0, endRow: 0, colIds: ['name'] }],
      rows,
      columns,
      options: {
        processCellForClipboard: ({ display }) => `copy:${display}`,
      },
    });
    expect(payload!.plainText).toBe('copy:علی');
  });

  it('escapes tabs and quotes in TSV cells', () => {
    const payload = buildClipboardPayload({
      ranges: [{ startRow: 0, endRow: 0, colIds: ['name'] }],
      rows: [
        {
          id: 1,
          cells: {
            name: { value: 'a\t"b"', display: 'a\t"b"' },
          },
        },
      ],
      columns: [{ id: 'name', header: 'Name' }],
    });
    expect(payload!.plainText).toBe('"a\t""b"""');
  });

  it('skips loading placeholder rows', () => {
    const payload = buildClipboardPayload({
      ranges: [{ startRow: 0, endRow: 1, colIds: ['name'] }],
      rows: [
        { id: 1, loading: true, cells: { name: { value: 'x', display: 'x' } } },
        { id: 2, cells: { name: { value: 'y', display: 'y' } } },
      ],
      columns: [{ id: 'name', header: 'Name' }],
    });
    expect(payload!.plainText).toBe('y');
  });
});
