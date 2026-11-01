import type { EventStore } from '../ports/EventStore';
import type { GridEvent } from '../../domain/types/GridEvent';
import type { OfflineStatus } from '../offline/OfflineStatus';
import type {
  ManualResolution,
  SyncConflict,
  SyncConflictPolicy,
  SyncPort,
  SyncResult,
  SyncTransport,
} from '../ports/SyncPort';
import {
  cellKeyFromPayload,
  cellKeyId,
  resolveConflictChoice,
} from './resolveCellConflicts';

export type GridSyncServiceOptions = {
  readonly tableId: string;
  readonly eventStore: EventStore;
  readonly offlineStatus: OfflineStatus;
  readonly transport: SyncTransport;
  /** Apply a winning remote CELL_CHANGED into the local domain. */
  readonly applyCellValue: (
    rowId: number,
    columnId: string,
    value: unknown,
  ) => Promise<void>;
  /** Initial pull cursor (default 0). */
  readonly initialCursor?: number;
  readonly policy?: SyncConflictPolicy;
};

function isCellChanged(event: GridEvent): boolean {
  return event.type === 'CELL_CHANGED';
}

function toSide(event: GridEvent): SyncConflict['local'] {
  const payload = event.payload as { newValue?: unknown };
  return {
    eventId: event.eventId,
    value: payload?.newValue,
    occurredAt: event.occurredAt,
    version: event.version,
  };
}

/**
 * SyncPort implementation over EventStore + OfflineStatus + SyncTransport (PR-138).
 */
export class GridSyncService implements SyncPort {
  private policy: SyncConflictPolicy;
  private cursor: number;
  private openConflicts: SyncConflict[] = [];
  private readonly conflictListeners = new Set<
    (conflicts: readonly SyncConflict[]) => void
  >();
  /** Remote events waiting on manual resolution (by conflict id). */
  private readonly deferredRemote = new Map<string, GridEvent>();
  private disposed = false;

  constructor(private readonly options: GridSyncServiceOptions) {
    this.policy = options.policy ?? 'lastWriteWins';
    this.cursor = options.initialCursor ?? 0;
  }

  getPolicy(): SyncConflictPolicy {
    return this.policy;
  }

  setPolicy(policy: SyncConflictPolicy): void {
    this.policy = policy;
  }

  getOpenConflicts(): readonly SyncConflict[] {
    return this.openConflicts;
  }

  subscribeConflicts(
    listener: (conflicts: readonly SyncConflict[]) => void,
  ): () => void {
    if (this.disposed) return () => undefined;
    this.conflictListeners.add(listener);
    listener(this.openConflicts);
    return () => this.conflictListeners.delete(listener);
  }

  /** Drop listeners and deferred conflicts; later sync() calls are no-ops. */
  dispose(): void {
    this.disposed = true;
    this.conflictListeners.clear();
    this.deferredRemote.clear();
    this.openConflicts = [];
  }

  private emptyResult(): SyncResult {
    return { pushed: 0, pulled: 0, applied: 0, conflicts: [] };
  }

  async sync(): Promise<SyncResult> {
    if (this.disposed) return this.emptyResult();
    const pending = this.options.offlineStatus.getPendingChanges();
    const pushable = pending
      .map((p) => p.event)
      .filter(
        (e): e is GridEvent =>
          Boolean(e) && e.tableId === this.options.tableId,
      );

    const { acceptedIds } = await this.options.transport.push(pushable);
    if (this.disposed) return this.emptyResult();
    if (acceptedIds.length > 0) {
      this.options.offlineStatus.markSynced([...acceptedIds]);
    }

    // Locals just pushed (or still pending) — used to detect cell conflicts on pull.
    const localByCell = new Map<string, GridEvent>();
    for (const event of pushable) {
      if (!isCellChanged(event)) continue;
      const key = cellKeyFromPayload(event.payload);
      if (!key) continue;
      localByCell.set(cellKeyId(key.rowId, key.columnId), event);
    }
    for (const event of this.options.offlineStatus
      .getPendingChanges()
      .map((p) => p.event)
      .filter((e): e is GridEvent => Boolean(e))) {
      if (!isCellChanged(event) || event.tableId !== this.options.tableId) {
        continue;
      }
      const key = cellKeyFromPayload(event.payload);
      if (!key) continue;
      localByCell.set(cellKeyId(key.rowId, key.columnId), event);
    }

    const pulled = await this.options.transport.pull(this.cursor);
    if (this.disposed) return this.emptyResult();
    this.cursor = pulled.cursor;

    let applied = 0;
    const conflicts: SyncConflict[] = [];

    for (const remote of pulled.events) {
      // Torn down mid-apply: stop writing into a released event store.
      if (this.disposed) return this.emptyResult();
      if (remote.tableId !== this.options.tableId) continue;
      if (!isCellChanged(remote)) {
        await this.ingestRemote(remote);
        applied += 1;
        continue;
      }
      const key = cellKeyFromPayload(remote.payload);
      if (!key) continue;
      const id = cellKeyId(key.rowId, key.columnId);
      const local = localByCell.get(id);
      if (local && toSide(local).value !== toSide(remote).value) {
        const conflict: SyncConflict = {
          id: `conflict:${id}:${remote.eventId}`,
          key,
          local: toSide(local),
          remote: toSide(remote),
        };
        const choice = resolveConflictChoice(conflict, this.policy);
        if (choice === 'unresolved') {
          conflicts.push(conflict);
          this.deferredRemote.set(conflict.id, remote);
          continue;
        }
        if (choice === 'remote') {
          await this.applyRemoteCell(remote, key.rowId, key.columnId);
          this.options.offlineStatus.markSynced([local.eventId]);
          applied += 1;
        } else {
          // Keep local — acknowledge remote without applying its value
          await this.ingestRemote(remote);
        }
        continue;
      }
      await this.applyRemoteCell(remote, key.rowId, key.columnId);
      applied += 1;
    }

    this.openConflicts = [
      ...this.openConflicts.filter((c) => this.deferredRemote.has(c.id)),
      ...conflicts,
    ];
    this.emitConflicts();

    return {
      pushed: acceptedIds.length,
      pulled: pulled.events.length,
      applied,
      conflicts: this.openConflicts,
    };
  }

  async resolveConflict(
    conflictId: string,
    choice: ManualResolution,
  ): Promise<void> {
    if (this.disposed) return;
    const conflict = this.openConflicts.find((c) => c.id === conflictId);
    const remote = this.deferredRemote.get(conflictId);
    if (!conflict || !remote) return;

    if (choice === 'remote') {
      await this.applyRemoteCell(
        remote,
        conflict.key.rowId,
        conflict.key.columnId,
      );
      this.options.offlineStatus.markSynced([conflict.local.eventId]);
    } else {
      await this.ingestRemote(remote);
    }

    this.deferredRemote.delete(conflictId);
    this.openConflicts = this.openConflicts.filter((c) => c.id !== conflictId);
    this.emitConflicts();
  }

  private async applyRemoteCell(
    remote: GridEvent,
    rowId: number,
    columnId: string,
  ): Promise<void> {
    await this.ingestRemote(remote);
    const before = new Set(
      this.options.offlineStatus.getPendingChanges().map((p) => p.eventId),
    );
    const value = (remote.payload as { newValue?: unknown })?.newValue;
    await this.options.applyCellValue(rowId, columnId, value);
    // CHANGE_CELL_VALUE may dual-write a new local event — treat as synced.
    const created = this.options.offlineStatus
      .getPendingChanges()
      .filter((p) => !before.has(p.eventId))
      .map((p) => p.eventId);
    if (created.length > 0) {
      this.options.offlineStatus.markSynced(created);
    }
  }

  private async ingestRemote(remote: GridEvent): Promise<void> {
    const streamId = remote.streamId || `table:${remote.tableId}`;
    const existing = await this.options.eventStore.read(streamId);
    if (existing.some((e) => e.eventId === remote.eventId)) {
      this.options.offlineStatus.markSynced([remote.eventId]);
      return;
    }
    await this.options.eventStore.append(streamId, [remote], -1);
    // Remote ingest must not look like a local pending mutation.
    this.options.offlineStatus.markSynced([remote.eventId]);
  }

  private emitConflicts(): void {
    for (const listener of this.conflictListeners) {
      listener(this.openConflicts);
    }
  }
}
