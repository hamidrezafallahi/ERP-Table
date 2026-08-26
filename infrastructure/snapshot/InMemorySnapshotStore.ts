import type {
  AggregateSnapshot,
  SnapshotStore,
} from '../../application/ports/SnapshotStore';

export class InMemorySnapshotStore<TPayload = unknown>
  implements SnapshotStore<TPayload>
{
  private byStream = new Map<string, AggregateSnapshot<TPayload>>();

  async save(snapshot: AggregateSnapshot<TPayload>): Promise<void> {
    this.byStream.set(snapshot.streamId, snapshot);
  }

  async loadLatest(
    streamId: string,
  ): Promise<AggregateSnapshot<TPayload> | null> {
    return this.byStream.get(streamId) ?? null;
  }

  async clear(streamId: string): Promise<void> {
    this.byStream.delete(streamId);
  }
}
