/**
 * Pure live-region announcement builders (PR-125).
 * No React — unit-tested; UI formats via `messages`.
 */

import type { FilterModel } from '../../engine/dataOps/filterModel';
import type { SortModel } from '../../engine/dataOps/sortModel';

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

export type ColumnLabel = { fieldName: string; fieldCaption: string };

export function countSelectedRows(
  selected: Record<number, true> | null | undefined,
): number {
  if (!selected) return 0;
  return Object.keys(selected).length;
}

export function countActiveFilters(filterModel: FilterModel | null | undefined): number {
  if (!filterModel) return 0;
  return Object.keys(filterModel).length;
}

export function announceSortChange(
  sortModel: SortModel,
  columns: readonly ColumnLabel[],
  t: TranslateFn,
): string {
  if (!sortModel.length) return t('a11y.sortCleared');
  const primary = sortModel[0]!;
  const col = columns.find((c) => c.fieldName === primary.colId);
  const column = col?.fieldCaption || primary.colId;
  return t(
    primary.sort === 'asc' ? 'a11y.sortedAsc' : 'a11y.sortedDesc',
    { column },
  );
}

export function announceFilterChange(
  visible: number,
  total: number,
  activeFilterCount: number,
  quickFilterActive: boolean,
  t: TranslateFn,
): string {
  if (activeFilterCount === 0 && !quickFilterActive) {
    return t('a11y.filterCleared');
  }
  return t('a11y.filterResult', { visible, total });
}

export function announceSelectionChange(
  count: number,
  t: TranslateFn,
): string {
  if (count <= 0) return t('a11y.selectionCleared');
  return t('a11y.rowsSelected', { count });
}

export function announceValidationError(
  message: string,
  t: TranslateFn,
): string {
  const trimmed = message.trim();
  if (!trimmed) return t('a11y.validationGeneric');
  return t('a11y.validationError', { message: trimmed });
}

export function sortFingerprint(sortModel: SortModel): string {
  return sortModel.map((s) => `${s.colId}:${s.sort}`).join('|');
}

export function filterFingerprint(
  filterModel: FilterModel,
  quickFilterText: string,
): string {
  return `${JSON.stringify(filterModel)}|${quickFilterText}`;
}
