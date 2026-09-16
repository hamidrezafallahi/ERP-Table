import { describe, expect, it } from 'vitest';

import {
  computeLayoutColumnWidths,
  getColumnFlex,
  isFlexColumn,
  sizeColumnsToFitWidths,
} from '../dataOps/columnLayout';

const col = (
  fieldName: string,
  extra: { flex?: number; minWidth?: number; hidden?: boolean } = {},
) => ({
  fieldName,
  fieldCaption: fieldName,
  fieldType: 'text' as const,
  visibility: { kind: 'always' as const },
  columnDef: extra.flex !== undefined ? { flex: extra.flex } : undefined,
  minWidth: extra.minWidth,
  hidden: extra.hidden,
});

describe('columnLayout (PR-112)', () => {
  it('getColumnFlex reads columnDef bridge', () => {
    expect(getColumnFlex(col('a', { flex: 2 }))).toBe(2);
    expect(getColumnFlex(col('b'))).toBe(0);
  });

  it('isFlexColumn is false when session width is set', () => {
    const c = col('a', { flex: 1 });
    expect(isFlexColumn(c, {})).toBe(true);
    expect(isFlexColumn(c, { a: 200 })).toBe(false);
  });

  it('flex:1 columns sum to container width', () => {
    const columns = [col('a', { flex: 1 }), col('b', { flex: 1 })];
    const widths = computeLayoutColumnWidths(columns, {}, 800);
    expect(widths.a! + widths.b!).toBe(800);
    expect(widths.a).toBe(400);
    expect(widths.b).toBe(400);
  });

  it('fixed column + flex column fills container', () => {
    const columns = [
      col('fixed', { minWidth: 200 }),
      col('grow', { flex: 1, minWidth: 100 }),
    ];
    const widths = computeLayoutColumnWidths(columns, { fixed: 200 }, 800);
    expect(widths.fixed).toBe(200);
    expect(widths.grow).toBe(600);
    expect(widths.fixed! + widths.grow!).toBe(800);
  });

  it('sizeColumnsToFit scales widths to container', () => {
    const columns = [col('a'), col('b'), col('c')];
    const stored = { a: 100, b: 200, c: 300 };
    const out = sizeColumnsToFitWidths(columns, stored, 600);
    expect(out.a! + out.b! + out.c!).toBe(600);
  });
});
