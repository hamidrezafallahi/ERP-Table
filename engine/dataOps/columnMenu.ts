/**
 * Column header menu item model (PR-114). Pure — no React/DOM.
 */

import type { ColumnSchema } from '../../domain/types/ColumnSchema';
import { resolveFilterUi } from './filterModel';
import { isHeaderColumnSortable } from './sortModel';
import { isIndexColumn } from '../columnWidth';

export type ColumnMenuBuiltInId =
  | 'sortAsc'
  | 'sortDesc'
  | 'sortNone'
  | 'filter'
  | 'hideColumn'
  | 'pinStart'
  | 'pinEnd'
  | 'pinNone'
  | 'autoSize'
  | 'columnsPanel'
  | 'separator';

export type ColumnMenuCustomItem = {
  name: string;
  label: string;
  disabled?: boolean;
};

export type ColumnMenuItemDef =
  | ColumnMenuBuiltInId
  | ColumnMenuCustomItem;

export type ColumnMenuItemsConfig =
  | ColumnMenuItemDef[]
  | ((defaults: ColumnMenuItemDef[]) => ColumnMenuItemDef[]);

export type ColumnMenuBuildContext = {
  column: ColumnSchema;
  sortable: boolean;
  filterable: boolean;
  hideable: boolean;
  pinnable: boolean;
};

export function isColumnMenuCustomItem(
  item: ColumnMenuItemDef,
): item is ColumnMenuCustomItem {
  return typeof item === 'object' && item !== null && 'name' in item;
}

export function isColumnFilterable(column: ColumnSchema): boolean {
  const ui = resolveFilterUi(column);
  return ui != null;
}

/**
 * Page-window grids (`persistence: 'paged-idb'`) hold ONE page in RAM, so a
 * header sort / filter would only reorder / hide the rows of that page. There
 * they are offered only on columns that opt in explicitly
 * (`columnDef.sortable: true` / `columnDef.filter`).
 */
export function isColumnSortableInGrid(
  column: ColumnSchema,
  pagedWindow: boolean,
): boolean {
  if (!isHeaderColumnSortable(column)) return false;
  return !pagedWindow || column.columnDef?.sortable === true;
}

export function isColumnFilterableInGrid(
  column: ColumnSchema,
  pagedWindow: boolean,
): boolean {
  if (!isColumnFilterable(column)) return false;
  if (!pagedWindow) return true;
  const def = column.columnDef?.filter;
  return def != null && def !== false;
}

export function buildDefaultColumnMenuItems(
  ctx: ColumnMenuBuildContext,
): ColumnMenuItemDef[] {
  const items: ColumnMenuItemDef[] = [];
  if (ctx.sortable) {
    items.push('sortAsc', 'sortDesc', 'sortNone', 'separator');
  }
  if (ctx.filterable) items.push('filter');
  if (ctx.hideable) items.push('hideColumn');
  if (ctx.pinnable) {
    items.push('pinStart', 'pinEnd', 'pinNone', 'separator');
  }
  items.push('autoSize', 'columnsPanel');
  return items;
}

export function resolveColumnMenuItems(
  column: ColumnSchema,
  config?: ColumnMenuItemsConfig,
  options?: { pagedWindow?: boolean },
): ColumnMenuItemDef[] {
  const pagedWindow = options?.pagedWindow === true;
  const ctx: ColumnMenuBuildContext = {
    column,
    sortable: isColumnSortableInGrid(column, pagedWindow),
    filterable: isColumnFilterableInGrid(column, pagedWindow),
    hideable: !isIndexColumn(column),
    pinnable: !isIndexColumn(column),
  };
  const defaults = buildDefaultColumnMenuItems(ctx);
  if (!config) return defaults;
  if (typeof config === 'function') return config(defaults);
  return config;
}

export function columnMenuItemLabelKey(id: ColumnMenuBuiltInId): string {
  switch (id) {
    case 'sortAsc':
      return 'columnMenu.sortAsc';
    case 'sortDesc':
      return 'columnMenu.sortDesc';
    case 'sortNone':
      return 'columnMenu.sortNone';
    case 'filter':
      return 'columnMenu.filter';
    case 'hideColumn':
      return 'columnMenu.hideColumn';
    case 'pinStart':
      return 'columnMenu.pinStart';
    case 'pinEnd':
      return 'columnMenu.pinEnd';
    case 'pinNone':
      return 'columnMenu.pinNone';
    case 'autoSize':
      return 'columnMenu.autoSize';
    case 'columnsPanel':
      return 'columnMenu.columnsPanel';
    default:
      return id;
  }
}

export function sortModelForMenuAction(
  current: readonly { colId: string; sort: 'asc' | 'desc' }[],
  colId: string,
  action: 'asc' | 'desc' | 'none',
): { colId: string; sort: 'asc' | 'desc' }[] {
  if (action === 'none') {
    return current.filter((entry) => entry.colId !== colId);
  }
  return [{ colId, sort: action }];
}
