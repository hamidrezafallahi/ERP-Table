import { describe, expect, it } from 'vitest';

import {
  coercePastedCellValue,
  parseClipboardNumber,
} from '../dataOps/cellValueCoercion';
import {
  buildPastePlan,
  parseDelimitedClipboardText,
} from '../selection/clipboardPaste';

describe('PR-107 clipboard paste (pure)', () => {
  it('parseDelimitedClipboardText handles quoted tabs and newlines', () => {
    expect(parseDelimitedClipboardText('a\tb\nc\td')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
    expect(parseDelimitedClipboardText('"a\tb"\nc')).toEqual([
      ['a\tb'],
      ['c'],
    ]);
    expect(parseDelimitedClipboardText('"say ""hi"""\tx')).toEqual([
      ['say "hi"', 'x'],
    ]);
  });

  it('parseClipboardNumber accepts Persian digits and decimal separator', () => {
    expect(parseClipboardNumber('۱۲۳٫۴۵۶')).toBe(123.456);
    expect(parseClipboardNumber('1,234.5')).toBe(1234.5);
  });

  it('coercePastedCellValue parses jalali date strings', () => {
    const result = coercePastedCellValue('date', '۱۴۰۵/۰۶/۲۰');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('1405/06/20');
    }
  });

  it('buildPastePlan tiles from active cell and counts rows to add', () => {
    const plan = buildPastePlan({
      text: 'Ali\t100\nReza\t200\nSara\t300',
      ranges: [],
      activeCell: { rowIndex: 1, colId: 'name' },
      columnOrder: ['name', 'amount'],
      columns: [
        { id: 'name', editable: true, fieldType: 'text' },
        { id: 'amount', editable: true, fieldType: 'number' },
      ],
      rowCount: 3,
      pasteAddsRows: true,
    });
    expect(plan).not.toBeNull();
    expect(plan!.targets).toHaveLength(6);
    expect(plan!.rowsToAdd).toBe(1);
    expect(plan!.targets[0]).toEqual({
      rowIndex: 1,
      colId: 'name',
      rawText: 'Ali',
    });
  });

  it('skips non-editable columns with a reason', () => {
    const plan = buildPastePlan({
      text: '1\tsecret',
      ranges: [],
      activeCell: { rowIndex: 0, colId: 'index' },
      columnOrder: ['index', 'name'],
      columns: [
        { id: 'index', editable: false, fieldType: 'index' },
        { id: 'name', editable: true, fieldType: 'text' },
      ],
      rowCount: 1,
    });
    expect(plan!.targets).toHaveLength(1);
    expect(plan!.skipped).toHaveLength(1);
    expect(plan!.skipped[0]?.reason).toBe('not_editable');
  });
});
