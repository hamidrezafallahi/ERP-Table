import type { CSSProperties } from 'react';

import type { ColumnSchema } from '../bootstrap/type';
import {
  computeEndPinOffsets,
  computePinOffsets,
  resolveColumnPinned,
  type ColumnPinSide,
} from '../engine/dataOps/columnPin';
import { isIndexColumn, type ColumnWidthHint } from '../engine/columnWidth';

/** D19: any column may pin; index always pins at inline-start. */
export function columnPinSide(column: ColumnSchema): ColumnPinSide | null {
  const pin = resolveColumnPinned(column);
  if (pin === 'start' || pin === 'end') return pin;
  return null;
}

export function columnPinClassName(column: ColumnWidthHint): string {
  if (isIndexColumn(column)) return 'erp-col-pin-start erp-col-pin-index';
  const side = columnPinSide(column as ColumnSchema);
  if (side === 'start') return 'erp-col-pin-start';
  if (side === 'end') return 'erp-col-pin-end';
  return '';
}

/** @deprecated Use `columnPinDataAttr` — kept for existing DOM hooks. */
export function indexPinClassName(column: ColumnWidthHint): string {
  return columnPinClassName(column);
}

export function columnPinDataAttr(
  column: ColumnWidthHint,
): ColumnPinSide | 'index' | undefined {
  if (isIndexColumn(column)) return 'index';
  return columnPinSide(column as ColumnSchema) ?? undefined;
}

/** @deprecated Use `columnPinDataAttr`. */
export function indexPinDataAttr(
  column: ColumnWidthHint,
): 'index' | undefined {
  const attr = columnPinDataAttr(column);
  return attr === 'index' ? 'index' : undefined;
}

export function columnPinStyle(
  column: ColumnSchema,
  startOffsets: Record<string, number>,
  endOffsets: Record<string, number>,
): CSSProperties | undefined {
  const side = columnPinSide(column);
  if (side === 'start') {
    const offset = startOffsets[column.fieldName];
    if (offset === undefined) return undefined;
    return { insetInlineStart: offset };
  }
  if (side === 'end') {
    const offset = endOffsets[column.fieldName];
    if (offset === undefined) return undefined;
    return { insetInlineEnd: offset };
  }
  return undefined;
}

export function columnPinCellProps(
  column: ColumnSchema,
  startOffsets: Record<string, number>,
  endOffsets: Record<string, number>,
): {
  className: string;
  'data-erp-col-pin': ReturnType<typeof columnPinDataAttr>;
  style: CSSProperties | undefined;
} {
  return {
    className: columnPinClassName(column),
    'data-erp-col-pin': columnPinDataAttr(column),
    style: columnPinStyle(column, startOffsets, endOffsets),
  };
}

export function buildPinOffsetMaps(
  pinnedStart: readonly ColumnSchema[],
  pinnedEnd: readonly ColumnSchema[],
  resolveWidth: (col: ColumnSchema) => number,
): {
  startOffsets: Record<string, number>;
  endOffsets: Record<string, number>;
} {
  return {
    startOffsets: computePinOffsets(pinnedStart, resolveWidth),
    endOffsets: computeEndPinOffsets(pinnedEnd, resolveWidth),
  };
}
