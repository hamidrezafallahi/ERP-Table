import type {
  AggregateSnapshot,
  SnapshotStore,
} from '../../application/ports/SnapshotStore';
import type { EventStore } from '../../application/ports/EventStore';
import type { GridEvent } from '../../domain/types/GridEvent';

export type SnapshotStrategyOptions = {
  /** Take a snapshot every N appended domain events (default 200). */
  readonly everyNEvents?: number;
};

/**
 * After appends, periodically persists a snapshot of the selected payload.
 * load(stream) = latest snapshot + events with version > snapshot.version
 */
export class SnapshotStrategy<TPayload = unknown> {
  private readonly everyN: number;
  private counts = new Map<string, number>();

  constructor(
    private readonly snapshots: SnapshotStore<TPayload>,
    private readonly eventStore: EventStore,
    private readonly capture: (streamId: string) => Promise<TPayload> | TPayload,
    options: SnapshotStrategyOptions = {},
  ) {
    this.everyN = options.everyNEvents ?? 200;
  }

  /** Call after a successful EventStore.append for the stream. */
  async onAppend(streamId: string, tableId: string, appendedCount: number): Promise<void> {
    const next = (this.counts.get(streamId) ?? 0) + appendedCount;
    this.counts.set(streamId, next);

    if (next < this.everyN) return;

    const events = await this.eventStore.read(streamId);
    const version = events.length;
    const payload = await this.capture(streamId);

    await this.snapshots.save({
      tableId,
      streamId,
      version,
      takenAt: Date.now(),
      payload,
    });

    this.counts.set(streamId, 0);
  }

  async loadWithCatchUp(streamId: string): Promise<{
    snapshot: AggregateSnapshot<TPayload> | null;
    eventsAfter: GridEvent[];
  }> {
    const snapshot = await this.snapshots.loadLatest(streamId);
    const fromVersion = snapshot?.version ?? 0;
    const eventsAfter = await this.eventStore.read(streamId, fromVersion);
    return { snapshot, eventsAfter };
  }
}
