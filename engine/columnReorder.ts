import { isIndexColumn, type ColumnWidthHint } from './columnWidth';

export type ColumnReorderHint = ColumnWidthHint & { fieldName: string };

/**
 * Map a header drop onto the same indices `Table.reorderColumns` uses
 * (display order / `getActiveCollectionColumns`). Index column is not movable.
 */
export function resolveColumnReorder(
  columns: readonly ColumnReorderHint[],
  sourceField: string,
  destField: string,
): { sourceIndex: number; destIndex: number } | null {
  const sourceIndex = columns.findIndex((c) => c.fieldName === sourceField);
  const destIndex = columns.findIndex((c) => c.fieldName === destField);
  if (sourceIndex < 0 || destIndex < 0 || sourceIndex === destIndex) {
    return null;
  }
  const source = columns[sourceIndex];
  const dest = columns[destIndex];
  if (!source || !dest) return null;
  if (isIndexColumn(source) || isIndexColumn(dest)) return null;
  return { sourceIndex, destIndex };
}
