/**
 * Row model mode (PR-96).
 * - `clientSide` — local sort / filter / quick filter.
 * - `infinite` / `serverSide` — models are for the host datasource; skip local apply*.
 */
export type RowModelType = 'clientSide' | 'infinite' | 'serverSide';

export function isServerRowModel(
  rowModelType: RowModelType | undefined | null,
): boolean {
  return rowModelType === 'infinite' || rowModelType === 'serverSide';
}

/**
 * Marker on host row objects used as infinite/server block placeholders (PR-102 / PR-103).
 * UI reads this via {@link isServerLoadingRow}.
 */
export const SERVER_ROW_LOADING_FLAG = '__pdgLoading' as const;

export function isServerLoadingRow(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  return (data as Record<string, unknown>)[SERVER_ROW_LOADING_FLAG] === true;
}

/** Half-open page window `[startRow, endRow)`. */
export function pageWindow(
  page: number,
  pageSize: number,
): { startRow: number; endRow: number } {
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, pageSize);
  const startRow = (safePage - 1) * safeSize;
  return { startRow, endRow: startRow + safeSize };
}
