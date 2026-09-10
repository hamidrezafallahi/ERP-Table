import type { ColumnSchema } from 'persian-data-grid';

import { DEMO_INDEX_COLUMN, ensureDemoColumns } from './fixtures';

export type FlatCells = Record<string, unknown>;

export type DisplayRow = {
  id: number;
  cells: FlatCells;
  visibilityCondition?: Record<string, boolean>;
};

/** Shared with row drop handlers (same pattern as eRPTableRow + IndexCol). */
export const draggedRowIdRef: { current: number | null } = { current: null };

export function flattenCells(cells: Record<string, unknown>): FlatCells {
  const out: FlatCells = {};
  for (const [key, raw] of Object.entries(cells)) {
    if (raw && typeof raw === 'object' && 'value' in (raw as object)) {
      out[key] = (raw as { value: unknown }).value;
    } else {
      out[key] = raw;
    }
  }
  return out;
}

export function cellText(cells: FlatCells, columnId: string): string {
  const v = cells[columnId];
  return v == null ? '' : String(v);
}

export function findMatches(
  rows: DisplayRow[],
  columnId: string,
  query: string,
): Array<{ rowId: number; columnId: string }> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return rows
    .filter((row) => cellText(row.cells, columnId).toLowerCase().includes(q))
    .map((row) => ({ rowId: row.id, columnId }));
}

export function parseCellInput(
  columns: ColumnSchema[],
  columnId: string,
  value: string,
): string | number {
  const col = columns.find((c) => c.fieldName === columnId);
  if (col?.fieldType === 'number' || col?.fieldType === 'price') {
    return Number(value);
  }
  return value;
}

/** Data columns only — never includes index (IndexCol is always rendered separately). */
export function getDataColumns(columns: ColumnSchema[]): ColumnSchema[] {
  return ensureDemoColumns(columns)
    .filter((c) => c.fieldType !== 'index' && c.fieldName !== 'index')
    .filter((c) => c.hidden !== true)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Per-row gate for whenRemoteFlag columns (same idea as host cellRenderer). */
export function isColumnVisibleForRow(
  col: ColumnSchema,
  visibilityCondition?: Record<string, boolean>,
): boolean {
  if (col.visibility?.kind !== 'whenRemoteFlag') return true;
  const flag = col.visibility.flag;
  if (!visibilityCondition || !(flag in visibilityCondition)) {
    return false;
  }
  return visibilityCondition[flag] === true;
}

export function getIndexColumnMeta(columns?: ColumnSchema[]): ColumnSchema {
  const ensured = ensureDemoColumns(columns ?? []);
  const found = ensured.find((c) => c.fieldType === 'index' || c.fieldName === 'index');
  return found ?? { ...DEMO_INDEX_COLUMN, order: 1 };
}

/** Always: IndexCol (first) + N data columns */
export function buildGridTemplate(dataColumnCount: number): string {
  return `minmax(210px, 240px) repeat(${Math.max(dataColumnCount, 1)}, minmax(110px, 1fr))`;
}
