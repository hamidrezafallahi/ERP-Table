import type {
  SyncConflict,
  SyncConflictPolicy,
  ManualResolution,
} from '../ports/SyncPort';

/**
 * Pure conflict resolution (PR-138).
 * `manual` always returns unresolved so the UI can choose.
 */
export function resolveConflictChoice(
  conflict: SyncConflict,
  policy: SyncConflictPolicy,
): ManualResolution | 'unresolved' {
  if (policy === 'manual') return 'unresolved';
  if (policy === 'serverWins') return 'remote';
  // lastWriteWins — tie-break on version then occurredAt
  if (conflict.remote.version !== conflict.local.version) {
    return conflict.remote.version > conflict.local.version
      ? 'remote'
      : 'local';
  }
  if (conflict.remote.occurredAt !== conflict.local.occurredAt) {
    return conflict.remote.occurredAt > conflict.local.occurredAt
      ? 'remote'
      : 'local';
  }
  return 'remote';
}

export function cellKeyFromPayload(
  payload: unknown,
): { rowId: number; columnId: string } | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;
  const columnId = p.columnId;
  if (typeof columnId !== 'string' || !columnId) return null;
  const rowRaw = p.rowId;
  const rowId =
    typeof rowRaw === 'number'
      ? rowRaw
      : typeof rowRaw === 'string'
        ? Number(rowRaw)
        : NaN;
  if (!Number.isFinite(rowId)) return null;
  return { rowId, columnId };
}

export function cellKeyId(rowId: number, columnId: string): string {
  return `${rowId}:${columnId}`;
}
