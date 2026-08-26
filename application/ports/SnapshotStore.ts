/**
 * Aggregate snapshot for fast reload: lastSnapshot + events after version.
 */
export interface AggregateSnapshot<TPayload = unknown> {
  readonly tableId: string;
  readonly streamId: string;
  readonly version: number;
  readonly takenAt: number;
  readonly payload: TPayload;
}

export interface SnapshotStore<TPayload = unknown> {
  save(snapshot: AggregateSnapshot<TPayload>): Promise<void>;
  loadLatest(streamId: string): Promise<AggregateSnapshot<TPayload> | null>;
  clear(streamId: string): Promise<void>;
}
