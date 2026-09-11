import { isIndexColumn, type ColumnWidthHint } from '../engine/columnWidth';

/** D10: only the index column is pinned. No public pin API. */
export function indexPinClassName(column: ColumnWidthHint): string {
  return isIndexColumn(column) ? 'erp-col-pin-index' : '';
}

export function indexPinDataAttr(
  column: ColumnWidthHint,
): 'index' | undefined {
  return isIndexColumn(column) ? 'index' : undefined;
}
