import { describe, expect, it } from 'vitest';

import {
  buildDefaultColumnMenuItems,
  columnMenuItemLabelKey,
  resolveColumnMenuItems,
  sortModelForMenuAction,
} from '../dataOps/columnMenu';
import { canSetColumnPinned } from '../dataOps/columnPinPolicy';

const col = (fieldName: string, extra: Partial<{ fieldType: string; filter: boolean }> = {}) => ({
  fieldName,
  fieldCaption: fieldName,
  fieldType: (extra.fieldType ?? 'text') as 'text',
  visibility: { kind: 'always' as const },
  columnDef: extra.filter ? { filter: 'text' as const } : undefined,
});

describe('columnMenu (PR-114)', () => {
  it('buildDefaultColumnMenuItems includes sort, filter, pin, auto-size, panel', () => {
    const items = buildDefaultColumnMenuItems({
      column: col('amount', { filter: true }),
      sortable: true,
      filterable: true,
      hideable: true,
      pinnable: true,
    });
    expect(items).toContain('sortAsc');
    expect(items).toContain('filter');
    expect(items).toContain('pinStart');
    expect(items).toContain('autoSize');
    expect(items).toContain('columnsPanel');
  });

  it('resolveColumnMenuItems allows host override function', () => {
    const items = resolveColumnMenuItems(col('x'), (defaults) =>
      defaults.filter((id) => id !== 'autoSize'),
    );
    expect(items).not.toContain('autoSize');
    expect(items).toContain('columnsPanel');
  });

  it('sortModelForMenuAction sets asc/desc/none', () => {
    const base = [{ colId: 'a', sort: 'asc' as const }];
    expect(sortModelForMenuAction(base, 'b', 'desc')).toEqual([
      { colId: 'b', sort: 'desc' },
    ]);
    expect(sortModelForMenuAction(base, 'a', 'none')).toEqual([]);
  });

  it('columnMenuItemLabelKey covers built-in ids', () => {
    expect(columnMenuItemLabelKey('sortAsc')).toBe('columnMenu.sortAsc');
    expect(columnMenuItemLabelKey('columnsPanel')).toBe('columnMenu.columnsPanel');
  });

  it('canSetColumnPinned rejects index column', () => {
    expect(canSetColumnPinned(col('index', { fieldType: 'index' }), null).ok).toBe(
      false,
    );
  });
});
