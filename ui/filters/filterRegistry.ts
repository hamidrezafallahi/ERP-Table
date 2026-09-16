import type { ReactNode } from 'react';

import type { ColumnSchema } from '../../bootstrap/type';
import type {
  ColumnFilter,
  FilterModel,
} from '../../engine/dataOps/filterModel';
import type { UITableController } from '../../infrastructure/ui/UITableController';

/**
 * Context passed to a host `FilterComponent` (PR-95).
 * Call `apply` with a `ColumnFilter` (usually `{ filterType: 'custom', customFilter }`).
 */
export type FilterComponentContext = {
  column: ColumnSchema;
  colId: string;
  filterModel: FilterModel;
  current: ColumnFilter | undefined;
  params?: Record<string, unknown>;
  controller: UITableController;
  apply: (next: ColumnFilter | null) => void;
  close: () => void;
};

export type FilterComponent = (ctx: FilterComponentContext) => ReactNode;

/**
 * Host map of custom filter UIs. Keys match `ColumnDef.filter` string / `{ type }` (PR-95).
 */
export type FilterComponentMap = Record<string, FilterComponent | undefined>;

export function resolveFilterComponent(
  name: string | undefined,
  components: FilterComponentMap | undefined,
): FilterComponent | undefined {
  if (!name || !components) return undefined;
  const render = components[name];
  return typeof render === 'function' ? render : undefined;
}
