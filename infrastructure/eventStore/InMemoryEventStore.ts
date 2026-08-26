import type { EventStore, AppendResult, Unsubscribe } from '../../application/ports/EventStore';
import type { GridEvent } from '../../domain/types/GridEvent';

type Listener = (event: GridEvent) => void;

export class InMemoryEventStore implements EventStore {
  private streams = new Map<string, GridEvent[]>();
  private globalLog: GridEvent[] = [];
  private listeners = new Map<string, Set<Listener>>();
  private globalListeners = new Set<Listener>();

  async append(
    streamId: string,
    events: GridEvent[],
    expectedVersion: number
  ): Promise<AppendResult> {
    const stream = this.streams.get(streamId) ?? [];
    const actualVersion = stream.length;

    if (expectedVersion !== -1 && expectedVersion !== actualVersion) {
      return { ok: false, conflict: { expectedVersion, actualVersion } };
    }

    const stamped: GridEvent[] = [];
    for (const event of events) {
      const versioned: GridEvent = {
        ...event,
        streamId,
        version: stream.length + stamped.length + 1,
      };
      stamped.push(versioned);
      stream.push(versioned);
      this.globalLog.push(versioned);
    }
    this.streams.set(streamId, stream);

    const subs = this.listeners.get(streamId);
    for (const event of stamped) {
      if (subs) {
        for (const listener of subs) { listener(event); }
      }
      for (const listener of this.globalListeners) { listener(event); }
    }

    return { ok: true, version: stream.length };
  }

  async read(streamId: string, fromVersion: number = 0): Promise<GridEvent[]> {
    const stream = this.streams.get(streamId) ?? [];
    return stream.slice(fromVersion);
  }

  async readAll(fromPosition: number = 0): Promise<GridEvent[]> {
    return this.globalLog.slice(fromPosition);
  }

  subscribe(streamId: string, onEvent: Listener): Unsubscribe {
    if (!this.listeners.has(streamId)) {
      this.listeners.set(streamId, new Set());
    }
    const subs = this.listeners.get(streamId)!;
    subs.add(onEvent);
    return () => { subs.delete(onEvent); };
  }

  subscribeAll(onEvent: Listener): Unsubscribe {
    this.globalListeners.add(onEvent);
    return () => { this.globalListeners.delete(onEvent); };
  }

  getStreamVersion(streamId: string): number {
    return (this.streams.get(streamId) ?? []).length;
  }

  getGlobalPosition(): number {
    return this.globalLog.length;
  }
}
