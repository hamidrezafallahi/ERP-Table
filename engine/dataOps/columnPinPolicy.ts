/**
 * Runtime column pin policy (PR-114).
 * Pure — no React/DOM.
 */

import type { ColumnPinned } from '../../domain/types/ColumnDef';
import type { ColumnSchema } from '../../domain/types/ColumnSchema';
import { isIndexColumn } from '../columnWidth';
import { resolveColumnPinned } from './columnPin';

export type SetColumnPinnedResult =
  | { ok: true; pinned: ColumnPinned }
  | { ok: false; reason: 'not-found' | 'index' | 'unchanged' };

export function canSetColumnPinned(
  column: ColumnSchema | undefined,
  pinned: ColumnPinned,
): SetColumnPinnedResult {
  if (!column) return { ok: false, reason: 'not-found' };
  if (isIndexColumn(column)) return { ok: false, reason: 'index' };
  const current = resolveColumnPinned(column);
  const next = pinned ?? null;
  if (current === next) return { ok: false, reason: 'unchanged' };
  return { ok: true, pinned: next };
}

export function withColumnPinned(
  column: ColumnSchema,
  pinned: ColumnPinned,
): ColumnSchema {
  const bridge = { ...(column.columnDef ?? {}), pinned: pinned ?? undefined };
  if (pinned == null) delete bridge.pinned;
  return { ...column, columnDef: bridge };
}
