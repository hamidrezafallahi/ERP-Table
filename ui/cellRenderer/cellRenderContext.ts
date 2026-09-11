import type { ReactNode } from 'react';

import type { ColumnSchema, DefaultOptionType } from '../../bootstrap/type';
import type { ValidCell } from '../../engine/type';
import type { UITableController } from '../../infrastructure/ui/UITableController';
import type { UIRow } from '../type';

/**
 * Argument passed to `ColumnSchema.render` / `ColumnViewBinding.render`.
 * Built-in FieldType editors are skipped when `render` is set.
 */
export interface CellRenderContext {
  tableKey: string;
  row: UIRow;
  columnId: string;
  meta: ColumnSchema;
  controller: UITableController;
  value: unknown;
  display: unknown;
  isActive: boolean;
  isDeleted: boolean;
  isEditable: boolean;
  mode: 'view' | 'cell' | 'form';
  tabIndex: number;
  validation: ValidCell;
  dispatchChangeValue: (newValue: unknown, option?: DefaultOptionType) => void;
  dispatchChangeDisplay: (label: string | null) => void;
  activeCell: () => void;
  /** Current grid-search query when this cell is the active hit (PR-71). */
  searchQuery?: string;
  isCurrentSearchMatch?: boolean;
}

export type CustomCellResolveResult =
  | { hit: false }
  | { hit: true; node: ReactNode };

/**
 * PR-54: custom `render` wins over the FieldType switch.
 * `returnDisplayValue` is not a renderer — it stays the engine display formatter.
 */
export function resolveCustomCellNode(
  meta: Pick<ColumnSchema, 'render'> | undefined,
  ctx: CellRenderContext,
): CustomCellResolveResult {
  if (typeof meta?.render !== 'function') {
    return { hit: false };
  }
  return { hit: true, node: (meta.render(ctx) ?? null) as ReactNode };
}
