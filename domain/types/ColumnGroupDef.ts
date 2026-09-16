import type { ColumnDef } from './ColumnDef';

/**
 * Multi-level column group (PR-113).
 * Nested groups are supported via `children` containing more groups.
 */
export interface ColumnGroupDef<TRow = unknown> {
  groupId?: string;
  headerName: string;
  children: readonly ColDefOrGroup<TRow>[];
  /** When true, hiding one child hides siblings in the same group (AG Grid parity). */
  marryChildren?: boolean;
}

export type ColDefOrGroup<TRow = unknown> =
  | ColumnDef<TRow>
  | ColumnGroupDef<TRow>;

export function isColumnGroupDef<TRow>(
  item: ColDefOrGroup<TRow>,
): item is ColumnGroupDef<TRow> {
  return (
    typeof item === 'object' &&
    item !== null &&
    'children' in item &&
    Array.isArray((item as ColumnGroupDef<TRow>).children)
  );
}

/** Persisted on leaf `ColumnSchema` for header rendering and group reorder. */
export type ColumnGroupPathEntry = {
  groupId: string;
  headerName: string;
  marryChildren?: boolean;
};

export type ColumnGroupMeta = {
  /** Immediate parent group id. */
  groupId: string;
  /** Root → parent chain. */
  path: readonly ColumnGroupPathEntry[];
};
