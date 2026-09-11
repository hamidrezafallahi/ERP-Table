/** Header occupies ARIA row 1. Data rows start at 2. */
export const ARIA_HEADER_ROW_INDEX = 1;

/** 1-based `aria-colindex` from 0-based visible column order. */
export function ariaColIndex(visibleIndex: number): number {
  return visibleIndex + 1;
}

/**
 * 1-based `aria-rowindex` for a data row.
 * `absoluteIndex` is 0-based in the full collection (not the mounted DOM window).
 */
export function ariaDataRowIndex(absoluteIndex: number): number {
  return absoluteIndex + 2;
}

export function ariaFooterRowIndex(dataRowCount: number): number {
  return dataRowCount + 2;
}

export function ariaGridRowCount(
  dataRowCount: number,
  hasFooter: boolean,
): number {
  return 1 + dataRowCount + (hasFooter ? 1 : 0);
}

function ariaToken(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '_');
}

/** Stable DOM id for `aria-activedescendant` on the grid. */
export function gridCellDomId(
  tableKey: string,
  rowId: number,
  columnId: string,
): string {
  return `erp-cell-${ariaToken(tableKey)}-${rowId}-${ariaToken(columnId)}`;
}

export function isAriaSelectedCell(
  active: { rowId: number; columnId: string } | null | undefined,
  rowId: number,
  columnId: string,
): boolean {
  return !!active && active.rowId === rowId && active.columnId === columnId;
}

export function gridCellA11y(
  tableKey: string,
  rowId: number,
  columnId: string,
  active: { rowId: number; columnId: string } | null | undefined,
): { id: string; 'aria-selected': boolean } {
  return {
    id: gridCellDomId(tableKey, rowId, columnId),
    'aria-selected': isAriaSelectedCell(active, rowId, columnId),
  };
}
