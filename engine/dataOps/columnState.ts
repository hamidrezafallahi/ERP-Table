/**
 * Column layout state model (PR-115). Pure — no React/DOM.
 * Used by GridApi get/apply and optional localStorage / EventStore persist.
 */

import type { SortDirection, SortModel } from './sortModel';

export type ColumnPinnedState = 'start' | 'end' | null;

export type ColumnStateItem = {
  colId: string;
  width: number;
  hide: boolean;
  order: number;
  pinned?: ColumnPinnedState;
  sort?: SortDirection | null;
  sortIndex?: number | null;
};

const STORAGE_PREFIX = 'pdg:columnState:';

export function columnStateStorageKey(stateKey: string): string {
  return `${STORAGE_PREFIX}${stateKey}`;
}

export function serializeColumnState(
  state: readonly ColumnStateItem[],
): string {
  return JSON.stringify(state);
}

export function parseColumnState(
  raw: string | null | undefined,
): ColumnStateItem[] | null {
  if (raw == null || raw === '') return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const items: ColumnStateItem[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue;
      const rec = entry as Record<string, unknown>;
      if (typeof rec.colId !== 'string' || rec.colId === '') continue;
      const width =
        typeof rec.width === 'number' && Number.isFinite(rec.width)
          ? rec.width
          : 0;
      const hide = Boolean(rec.hide);
      const order =
        typeof rec.order === 'number' && Number.isFinite(rec.order)
          ? rec.order
          : items.length;
      const pinned =
        rec.pinned === 'start' || rec.pinned === 'end'
          ? rec.pinned
          : rec.pinned === null
            ? null
            : undefined;
      const sort =
        rec.sort === 'asc' || rec.sort === 'desc'
          ? rec.sort
          : rec.sort === null
            ? null
            : undefined;
      const sortIndex =
        typeof rec.sortIndex === 'number' && Number.isFinite(rec.sortIndex)
          ? rec.sortIndex
          : rec.sortIndex === null
            ? null
            : undefined;
      items.push({
        colId: rec.colId,
        width,
        hide,
        order,
        ...(pinned !== undefined ? { pinned } : {}),
        ...(sort !== undefined ? { sort } : {}),
        ...(sortIndex !== undefined ? { sortIndex } : {}),
      });
    }
    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

/** Build SortModel from per-column sort / sortIndex fields. */
export function sortModelFromColumnState(
  state: readonly ColumnStateItem[],
): SortModel {
  const withSort = state
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item }) => item.sort === 'asc' || item.sort === 'desc',
    )
    .sort((a, b) => {
      const ai =
        typeof a.item.sortIndex === 'number' ? a.item.sortIndex : a.index;
      const bi =
        typeof b.item.sortIndex === 'number' ? b.item.sortIndex : b.index;
      return ai - bi;
    });
  return withSort.map(({ item }) => ({
    colId: item.colId,
    sort: item.sort as SortDirection,
  }));
}

export function columnStatesEqual(
  a: readonly ColumnStateItem[],
  b: readonly ColumnStateItem[],
): boolean {
  return serializeColumnState(a) === serializeColumnState(b);
}
