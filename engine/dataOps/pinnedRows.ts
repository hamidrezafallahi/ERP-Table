/**
 * Pinned top/bottom host rows (PR-116). Pure — no React/DOM.
 * Display-only; not part of the UI row index / sort / filter / selection.
 */

import type { ColumnSchema } from '../../domain/types/ColumnSchema';
import { isIndexColumn } from '../columnWidth';

/** Read a display value from a host pinned row object. */
export function readPinnedRowCellValue(
  row: unknown,
  column: ColumnSchema,
): unknown {
  if (isIndexColumn(column)) return null;
  if (row == null || typeof row !== 'object') return null;
  const field = column.fieldName;
  if (field in (row as Record<string, unknown>)) {
    return (row as Record<string, unknown>)[field];
  }
  return null;
}

export function countPinnedRows(
  top: readonly unknown[] | null | undefined,
  bottom: readonly unknown[] | null | undefined,
): { top: number; bottom: number } {
  return {
    top: top?.length ?? 0,
    bottom: bottom?.length ?? 0,
  };
}
