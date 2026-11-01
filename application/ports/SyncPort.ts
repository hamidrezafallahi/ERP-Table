import type { GridEvent } from '../../domain/types/GridEvent';

/** Conflict resolution policy (PR-138). */
export type SyncConflictPolicy =
  | 'lastWriteWins'
  | 'serverWins'
  | 'manual';

export type SyncCellKey = {
  readonly rowId: number;
  readonly columnId: string;
};

/** One side of a cell conflict (local or remote). */
export type SyncConflictSide = {
  readonly eventId: string;
  readonly value: unknown;
  readonly occurredAt: number;
  readonly version: number;
};

export type SyncConflict = {
  readonly id: string;
  readonly key: SyncCellKey;
  readonly local: SyncConflictSide;
  readonly remote: SyncConflictSide;
};

export type ManualResolution = 'local' | 'remote';

export type SyncTransport = {
  /** Push local events to the remote log. Returns accepted event ids. */
  push(
    events: readonly GridEvent[],
  ): Promise<{ acceptedIds: readonly string[] }>;
  /** Pull remote events after `since` cursor. */
  pull(since: number): Promise<{
    events: readonly GridEvent[];
    cursor: number;
  }>;
};

export type SyncResult = {
  readonly pushed: number;
  readonly pulled: number;
  readonly applied: number;
  readonly conflicts: readonly SyncConflict[];
};

/**
 * SyncPort: push local pending events, pull remote, resolve cell conflicts.
 * OCC on EventStore remains the local concurrency gate; this port is
 * cross-client merge (PR-138).
 */
export type SyncPort = {
  getPolicy(): SyncConflictPolicy;
  setPolicy(policy: SyncConflictPolicy): void;
  getOpenConflicts(): readonly SyncConflict[];
  /** Push + pull + apply policy. */
  sync(): Promise<SyncResult>;
  /**
   * Resolve one manual conflict. `choice: 'local'` keeps local value;
   * `'remote'` applies the server value.
   */
  resolveConflict(
    conflictId: string,
    choice: ManualResolution,
  ): Promise<void>;
  subscribeConflicts(
    listener: (conflicts: readonly SyncConflict[]) => void,
  ): () => void;
  /**
   * Release listeners / deferred state when the grid is torn down. After
   * this, `sync()` is a no-op that returns an empty result. Optional so
   * custom SyncPort implementations keep compiling.
   */
  dispose?(): void;
};
