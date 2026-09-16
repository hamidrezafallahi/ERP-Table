import type { ColumnSchema, FieldType } from './ColumnSchema';
import type { ColumnGroupMeta } from './ColumnGroupDef';

/**
 * Filter descriptor on `ColumnDef`. Consumed in Phase 18 (PR-92+).
 * Built-in names, a custom registry key (PR-95), or `{ type, params }`.
 */
export type FilterDef =
  | 'text'
  | 'number'
  | 'date'
  | 'set'
  | (string & {})
  | { type: string; params?: Record<string, unknown> };

export type ColumnPinned = 'start' | 'end' | null;

/** Built-in footer / group aggregates (PR-118 / RFC-002). */
export type AggFuncName =
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'count'
  | 'first'
  | 'last';

export type AggFunc<TValue = unknown> =
  | AggFuncName
  | ((values: readonly TValue[]) => unknown);

/**
 * `field` is an unconstrained string until `TRow` is specified; then it is a key of `TRow`.
 * `keyof unknown` is `never`, so untyped `ColumnDef[]` stays usable (PR-88).
 */
export type ColumnField<TRow> = keyof TRow extends never
  ? string
  : Extract<keyof TRow, string>;

/**
 * Cell renderer slot on `ColumnDef`. Same runtime as `ColumnSchema.render`.
 * UI `CellComponent` is the React-side shape — domain does not import React (PR-81).
 */
export type ColumnCellRenderer = (ctx: unknown) => unknown;

/**
 * Public, generic column definition (PR-81 / D14).
 * `ColumnSchema` remains the ERP host / domain persistence shape; use
 * `toColumnSchema` / `toColumnDef` in `infrastructure/columns/` to convert.
 */
export interface ColumnDef<TRow = unknown, TValue = unknown> {
  colId?: string;
  field?: ColumnField<TRow>;
  headerName?: string;
  type?: FieldType;
  valueGetter?: (p: { data: TRow }) => TValue;
  valueSetter?: (p: { data: TRow; newValue: TValue }) => boolean;
  valueFormatter?: (p: { value: TValue; data: TRow }) => string;
  /** Consumed in Phase 18 (PR-89). */
  comparator?: (a: TValue, b: TValue) => number;
  editable?: boolean | ((p: { data: TRow }) => boolean);
  width?: number;
  minWidth?: number;
  flex?: number;
  hide?: boolean;
  pinned?: ColumnPinned;
  sortable?: boolean;
  filter?: FilterDef | false;
  cellRenderer?: ColumnCellRenderer;
  /**
   * Footer / group aggregate (PR-118 / RFC-002).
   * Built-ins are incremental; money uses integer minor units.
   */
  aggFunc?: AggFunc<TValue>;
  /**
   * Source `ColumnSchema` when this def was produced by `toColumnDef`.
   * `toColumnSchema` copies ERP-only fields (visibility, resolveOn, …) from it.
   */
  columnSchema?: ColumnSchema;
  /** Stamped by `flattenColDefOrGroup` before `toColumnSchema` (PR-113). */
  columnGroup?: ColumnGroupMeta;
}

/**
 * ColumnDef fields that have no native `ColumnSchema` equivalent.
 * Stashed on `ColumnSchema.columnDef` so the mapper round-trips.
 */
export interface ColumnDefBridge {
  field?: string;
  colId?: string;
  valueGetter?: (p: { data: unknown }) => unknown;
  valueSetter?: (p: { data: unknown; newValue: unknown }) => boolean;
  valueFormatter?: (p: { value: unknown; data: unknown }) => string;
  comparator?: (a: unknown, b: unknown) => number;
  editableWhen?: (p: { data: unknown }) => boolean;
  width?: number;
  flex?: number;
  pinned?: ColumnPinned;
  sortable?: boolean;
  filter?: FilterDef | false;
  aggFunc?: AggFunc;
}
