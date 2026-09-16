import type { ColumnSchema } from '../../domain/types/ColumnSchema';
import type { ColumnGroupPathEntry } from '../../domain/types/ColumnGroupDef';
import { isIndexColumn, type ColumnWidthHint } from '../columnWidth';

export type ColumnGroupHeaderCell = {
  kind: 'group';
  groupId: string;
  headerName: string;
  colspan: number;
  level: number;
  collapsed: boolean;
  /** Leaf field names spanned by this header (document order). */
  leafFields: readonly string[];
};

export type ColumnGroupHeaderModel = {
  /** 0 = outermost group row. */
  rows: ColumnGroupHeaderCell[][];
  maxDepth: number;
};

export function columnGroupDepth(column: ColumnSchema): number {
  return column.columnGroup?.path.length ?? 0;
}

export function maxColumnGroupDepth(columns: readonly ColumnSchema[]): number {
  let max = 0;
  for (const col of columns) {
    max = Math.max(max, columnGroupDepth(col));
  }
  return max;
}

export function hasColumnGroups(columns: readonly ColumnSchema[]): boolean {
  return maxColumnGroupDepth(columns) > 0;
}

/** True when any ancestor group id is collapsed. */
export function isColumnGroupCollapsed(
  column: ColumnSchema,
  collapsedGroups: Readonly<Record<string, true>>,
): boolean {
  const path = column.columnGroup?.path ?? [];
  for (const entry of path) {
    if (collapsedGroups[entry.groupId]) return true;
  }
  return false;
}

export function applyColumnGroupCollapse(
  columns: readonly ColumnSchema[],
  collapsedGroups: Readonly<Record<string, true>>,
): ColumnSchema[] {
  if (Object.keys(collapsedGroups).length === 0) return columns.slice();
  return columns.map((col) => {
    if (col.hidden) return col;
    if (!isColumnGroupCollapsed(col, collapsedGroups)) return col;
    return { ...col, hidden: true };
  });
}

function groupAtLevel(
  column: ColumnSchema,
  level: number,
): ColumnGroupPathEntry | undefined {
  return column.columnGroup?.path[level];
}

/**
 * Build multi-row group header cells for visible leaf columns (PR-113).
 * Each row merges adjacent columns sharing the same group id at that depth.
 */
export function buildColumnGroupHeaderModel(
  visibleColumns: readonly ColumnSchema[],
  collapsedGroups: Readonly<Record<string, true>>,
): ColumnGroupHeaderModel {
  const maxDepth = maxColumnGroupDepth(visibleColumns);
  if (maxDepth === 0) {
    return { rows: [], maxDepth: 0 };
  }

  const rows: ColumnGroupHeaderCell[][] = [];

  for (let level = 0; level < maxDepth; level += 1) {
    const row: ColumnGroupHeaderCell[] = [];
    let i = 0;
    while (i < visibleColumns.length) {
      const col = visibleColumns[i]!;
      const entry = groupAtLevel(col, level);
      if (!entry) {
        i += 1;
        continue;
      }
      const leafFields: string[] = [col.fieldName];
      let j = i + 1;
      while (j < visibleColumns.length) {
        const next = visibleColumns[j]!;
        const nextEntry = groupAtLevel(next, level);
        if (!nextEntry || nextEntry.groupId !== entry.groupId) break;
        leafFields.push(next.fieldName);
        j += 1;
      }
      row.push({
        kind: 'group',
        groupId: entry.groupId,
        headerName: entry.headerName,
        colspan: leafFields.length,
        level,
        collapsed: Boolean(collapsedGroups[entry.groupId]),
        leafFields,
      });
      i = j;
    }
    rows.push(row);
  }

  return { rows, maxDepth };
}

export type ColumnReorderHint = ColumnWidthHint & {
  fieldName: string;
  columnGroup?: ColumnSchema['columnGroup'];
};

function columnInGroup(column: ColumnReorderHint, groupId: string): boolean {
  return (column.columnGroup?.path ?? []).some((p) => p.groupId === groupId);
}

/** Move a contiguous group block before `destField` (group-level reorder). */
export function resolveGroupBlockReorder(
  columns: readonly ColumnReorderHint[],
  groupId: string,
  destField: string,
): { sourceIndex: number; destIndex: number } | null {
  const blockIndices = columns
    .map((c, i) => (columnInGroup(c, groupId) ? i : -1))
    .filter((i) => i >= 0);
  if (blockIndices.length === 0) return null;

  for (let k = 1; k < blockIndices.length; k += 1) {
    if (blockIndices[k] !== blockIndices[k - 1]! + 1) return null;
  }

  const sourceIndex = blockIndices[0]!;
  const destIndex = columns.findIndex((c) => c.fieldName === destField);
  if (destIndex < 0 || sourceIndex === destIndex) return null;
  const source = columns[sourceIndex];
  const dest = columns[destIndex];
  if (!source || !dest) return null;
  if (isIndexColumn(source) || isIndexColumn(dest)) return null;
  if (blockIndices.includes(destIndex)) return null;

  return { sourceIndex, destIndex };
}

/** Reorder within the same parent group (existing column drag). */
export function isSameParentGroup(
  a: ColumnSchema,
  b: ColumnSchema,
): boolean {
  const ga = a.columnGroup?.groupId ?? '';
  const gb = b.columnGroup?.groupId ?? '';
  return ga === gb;
}
