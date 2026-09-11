export const DEFAULT_COLUMN_MIN_WIDTH = 144;
export const INDEX_COLUMN_DEFAULT_WIDTH = 168;

export type ColumnWidthHint = {
  fieldName?: string;
  fieldType?: string;
  minWidth?: number;
};

export function isIndexColumn(column: ColumnWidthHint): boolean {
  return column.fieldType === 'index' || column.fieldName === 'index';
}

export function columnWidthFloor(column?: ColumnWidthHint): number {
  const schemaMin = column?.minWidth ?? 0;
  if (column && isIndexColumn(column)) {
    return Math.max(INDEX_COLUMN_DEFAULT_WIDTH, schemaMin);
  }
  return Math.max(DEFAULT_COLUMN_MIN_WIDTH, schemaMin);
}

export function clampColumnWidth(
  width: number,
  column?: ColumnWidthHint,
): number {
  const floor = columnWidthFloor(column);
  if (!Number.isFinite(width)) return floor;
  return Math.max(floor, Math.round(width));
}

export function resolveColumnWidth(
  column: ColumnWidthHint & { fieldName: string },
  columnWidths: Record<string, number> | undefined,
): number {
  const stored = columnWidths?.[column.fieldName];
  if (typeof stored === 'number' && Number.isFinite(stored)) {
    return clampColumnWidth(stored, column);
  }
  if (isIndexColumn(column)) {
    return INDEX_COLUMN_DEFAULT_WIDTH;
  }
  return column.minWidth ?? DEFAULT_COLUMN_MIN_WIDTH;
}

export function columnSizeStyle(
  column: ColumnWidthHint & { fieldName: string },
  columnWidths: Record<string, number> | undefined,
): { width: number; minWidth: number } {
  const width = resolveColumnWidth(column, columnWidths);
  return { width, minWidth: width };
}

/** Apply a stored session width on top of a surface-specific fallback (mobile). */
export function overlayStoredColumnWidth(
  column: ColumnWidthHint & { fieldName: string },
  columnWidths: Record<string, number> | undefined,
  base: { width?: number; minWidth?: number; maxWidth?: number },
): { width?: number; minWidth?: number; maxWidth?: number } {
  const stored = columnWidths?.[column.fieldName];
  if (typeof stored !== 'number' || !Number.isFinite(stored)) {
    return base;
  }
  const width = clampColumnWidth(stored, column);
  return { width, minWidth: width };
}
