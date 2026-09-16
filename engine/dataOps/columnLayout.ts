import {
  clampColumnWidth,
  columnWidthFloor,
  resolveColumnWidth,
  type ColumnWidthHint,
} from '../columnWidth';

export type ColumnFlexHint = ColumnWidthHint & {
  fieldName: string;
  columnDef?: { flex?: number };
};

/** Flex weight from `ColumnDef.flex` (via `columnDef` bridge). */
export function getColumnFlex(column: ColumnFlexHint): number {
  const flex = column.columnDef?.flex;
  if (typeof flex === 'number' && flex > 0 && Number.isFinite(flex)) return flex;
  return 0;
}

/** Flex applies only when the column has flex and no explicit session width. */
export function isFlexColumn(
  column: ColumnFlexHint,
  columnWidths: Record<string, number> | undefined,
): boolean {
  if (getColumnFlex(column) <= 0) return false;
  const stored = columnWidths?.[column.fieldName];
  return !(typeof stored === 'number' && Number.isFinite(stored));
}

/**
 * Distribute remaining container width to flex columns (PR-112).
 * Fixed columns keep `resolveColumnWidth`; flex columns grow from their floor.
 */
export function computeLayoutColumnWidths(
  columns: readonly ColumnFlexHint[],
  columnWidths: Record<string, number> | undefined,
  containerWidth: number,
): Record<string, number> {
  const visible = columns.filter((c) => !('hidden' in c && c.hidden));
  if (visible.length === 0) return {};

  const entries = visible.map((col) => ({
    col,
    fieldName: col.fieldName,
    flex: isFlexColumn(col, columnWidths) ? getColumnFlex(col) : 0,
    baseWidth: resolveColumnWidth(col, columnWidths),
    floor: columnWidthFloor(col),
  }));

  const out: Record<string, number> = {};
  const hasFlex = entries.some((e) => e.flex > 0);

  if (!hasFlex || containerWidth <= 0) {
    for (const e of entries) out[e.fieldName] = e.baseWidth;
    return out;
  }

  let fixedSum = 0;
  let flexMinSum = 0;
  let totalFlex = 0;
  for (const e of entries) {
    if (e.flex > 0) {
      flexMinSum += e.floor;
      totalFlex += e.flex;
    } else {
      fixedSum += e.baseWidth;
    }
  }

  const remaining = containerWidth - fixedSum - flexMinSum;

  for (const e of entries) {
    if (e.flex <= 0) {
      out[e.fieldName] = e.baseWidth;
    } else if (remaining <= 0 || totalFlex <= 0) {
      out[e.fieldName] = e.floor;
    } else {
      const share = remaining * (e.flex / totalFlex);
      out[e.fieldName] = clampColumnWidth(e.floor + share, e.col);
    }
  }

  return out;
}

/**
 * Scale visible column widths proportionally to fit `containerWidth` (PR-112).
 */
export function sizeColumnsToFitWidths(
  columns: readonly ColumnFlexHint[],
  columnWidths: Record<string, number> | undefined,
  containerWidth: number,
): Record<string, number> {
  const visible = columns.filter((c) => !('hidden' in c && c.hidden));
  if (visible.length === 0 || containerWidth <= 0) return {};

  const current = visible.map((col) => ({
    col,
    colId: col.fieldName,
    width: resolveColumnWidth(col, columnWidths),
  }));

  const total = current.reduce((sum, c) => sum + c.width, 0);
  if (total <= 0) return {};

  const scale = containerWidth / total;
  const out: Record<string, number> = {};
  for (const c of current) {
    out[c.colId] = clampColumnWidth(c.width * scale, c.col);
  }

  const sum = Object.values(out).reduce((a, b) => a + b, 0);
  const delta = containerWidth - sum;
  if (delta !== 0 && visible.length > 0) {
    const last = visible[visible.length - 1]!;
    out[last.fieldName] = clampColumnWidth(
      (out[last.fieldName] ?? 0) + delta,
      last,
    );
  }

  return out;
}
