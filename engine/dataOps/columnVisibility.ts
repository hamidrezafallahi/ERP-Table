/**
 * Column hide/show policy (PR-111).
 * Pure — no React/DOM.
 *
 * Domain `visibility.kind === 'never'` is a hard forbid (RBAC / schema policy).
 * Hosts may toggle `hidden` for other columns; they cannot unhide a never-visible column.
 */

import type { ColumnSchema } from '../../domain/types/ColumnSchema';
import { isIndexColumn } from '../columnWidth';

export type SetColumnVisibleResult =
  | { ok: true; hidden: boolean }
  | { ok: false; reason: 'not-found' | 'forbidden' | 'index' | 'unchanged' };

/** Policy lock: column must stay hidden. */
export function isColumnShowForbidden(column: ColumnSchema): boolean {
  return column.visibility?.kind === 'never';
}

export function canSetColumnVisible(
  column: ColumnSchema | undefined,
  visible: boolean,
): SetColumnVisibleResult {
  if (!column) return { ok: false, reason: 'not-found' };
  if (isIndexColumn(column) && !visible) {
    return { ok: false, reason: 'index' };
  }
  if (visible && isColumnShowForbidden(column)) {
    return { ok: false, reason: 'forbidden' };
  }
  const nextHidden = !visible;
  if (Boolean(column.hidden) === nextHidden) {
    return { ok: false, reason: 'unchanged' };
  }
  return { ok: true, hidden: nextHidden };
}

export function withColumnHidden(
  column: ColumnSchema,
  hidden: boolean,
): ColumnSchema {
  return { ...column, hidden };
}
