import type { ColumnDef } from '../../domain/types/ColumnDef';
import type {
  ColDefOrGroup,
  ColumnGroupPathEntry,
} from '../../domain/types/ColumnGroupDef';
import { isColumnGroupDef } from '../../domain/types/ColumnGroupDef';

function slugGroupId(headerName: string, index: number): string {
  const base = headerName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return base.length > 0 ? base : `group-${index}`;
}

function withGroupMeta<TRow>(
  def: ColumnDef<TRow>,
  path: readonly ColumnGroupPathEntry[],
): ColumnDef<TRow> {
  if (path.length === 0) return def;
  const parent = path[path.length - 1]!;
  const columnGroup = { groupId: parent.groupId, path };
  return { ...def, columnGroup };
}

/**
 * Expand nested `ColumnGroupDef` trees into flat `ColumnDef` leaves with group metadata.
 */
export function flattenColDefOrGroup<TRow>(
  items: readonly ColDefOrGroup<TRow>[],
  parentPath: readonly ColumnGroupPathEntry[] = [],
  groupIndex = { value: 0 },
): ColumnDef<TRow>[] {
  const out: ColumnDef<TRow>[] = [];
  for (const item of items) {
    if (isColumnGroupDef(item)) {
      const groupId =
        item.groupId ?? slugGroupId(item.headerName, groupIndex.value++);
      const entry: ColumnGroupPathEntry = {
        groupId,
        headerName: item.headerName,
        marryChildren: item.marryChildren,
      };
      out.push(
        ...flattenColDefOrGroup(item.children, [...parentPath, entry], groupIndex),
      );
    } else {
      out.push(withGroupMeta(item, parentPath));
    }
  }
  return out;
}
