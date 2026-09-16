/**
 * Column pin partitioning (PR-110 / D19).
 * Pure — no React/DOM.
 */

import type { ColumnPinned } from '../../domain/types/ColumnDef';
import type { ColumnSchema } from '../../domain/types/ColumnSchema';
import { isIndexColumn } from '../columnWidth';

export type ColumnPinSide = 'start' | 'end';

export type ColumnPinPartition = {
  pinnedStart: ColumnSchema[];
  scrollable: ColumnSchema[];
  pinnedEnd: ColumnSchema[];
  /** Absolute index in the full visible list for each entry. */
  pinnedStartAbs: number[];
  scrollableAbs: number[];
  pinnedEndAbs: number[];
};

/** Index column is always pinned at inline-start (D19 supersedes D10). */
export function resolveColumnPinned(
  column: ColumnSchema,
): ColumnPinned {
  if (isIndexColumn(column)) return 'start';
  const pinned = column.columnDef?.pinned;
  if (pinned === 'start' || pinned === 'end') return pinned;
  return null;
}

export function isPinnedColumn(column: ColumnSchema): boolean {
  return resolveColumnPinned(column) != null;
}

export function partitionColumnsByPin(
  columns: readonly ColumnSchema[],
): ColumnPinPartition {
  const pinnedStart: ColumnSchema[] = [];
  const scrollable: ColumnSchema[] = [];
  const pinnedEnd: ColumnSchema[] = [];
  const pinnedStartAbs: number[] = [];
  const scrollableAbs: number[] = [];
  const pinnedEndAbs: number[] = [];

  columns.forEach((col, abs) => {
    const pin = resolveColumnPinned(col);
    if (pin === 'start') {
      pinnedStart.push(col);
      pinnedStartAbs.push(abs);
    } else if (pin === 'end') {
      pinnedEnd.push(col);
      pinnedEndAbs.push(abs);
    } else {
      scrollable.push(col);
      scrollableAbs.push(abs);
    }
  });

  return {
    pinnedStart,
    scrollable,
    pinnedEnd,
    pinnedStartAbs,
    scrollableAbs,
    pinnedEndAbs,
  };
}

export function computePinOffsets(
  columns: readonly ColumnSchema[],
  resolveWidth: (col: ColumnSchema) => number,
): Record<string, number> {
  const offsets: Record<string, number> = {};
  let cursor = 0;
  for (const col of columns) {
    offsets[col.fieldName] = cursor;
    cursor += resolveWidth(col);
  }
  return offsets;
}

export function computeEndPinOffsets(
  columns: readonly ColumnSchema[],
  resolveWidth: (col: ColumnSchema) => number,
): Record<string, number> {
  const offsets: Record<string, number> = {};
  let cursor = 0;
  for (let i = columns.length - 1; i >= 0; i -= 1) {
    const col = columns[i]!;
    offsets[col.fieldName] = cursor;
    cursor += resolveWidth(col);
  }
  return offsets;
}

export function sumColumnWidths(
  columns: readonly ColumnSchema[],
  resolveWidth: (col: ColumnSchema) => number,
): number {
  return columns.reduce((sum, col) => sum + resolveWidth(col), 0);
}
