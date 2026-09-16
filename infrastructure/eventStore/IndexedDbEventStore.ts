import type { EventStore, AppendResult, Unsubscribe } from '../../application/ports/EventStore';
import type { GridEvent } from '../../domain/types/GridEvent';
import type { KvDatabase } from './KvDatabase';
import { MemoryKvDatabase, openIndexedDbDatabase } from './KvDatabase';
import { DEFAULT_EVENT_STORE_PREFIX } from './eventStoreName';

type Listener = (event: GridEvent) => void;

const STREAMS = 'streams';
const GLOBAL = 'global';
const META = 'meta';

type StreamRecord = {
  events: GridEvent[];
};

/**
 * Durable EventStore backed by IndexedDB (or any KvDatabase).
 * Same OCC contract as InMemoryEventStore.
 */
export class IndexedDbEventStore implements EventStore {
  private listeners = new Map<string, Set<Listener>>();
  private globalListeners = new Set<Listener>();
  private ready: Promise<void>;

  constructor(private readonly db: KvDatabase) {
    this.ready = Promise.resolve();
  }

  static async open(
    dbName = DEFAULT_EVENT_STORE_PREFIX,
  ): Promise<IndexedDbEventStore> {
    const db = await openIndexedDbDatabase(dbName, [STREAMS, GLOBAL, META]);
    return new IndexedDbEventStore(db);
  }

  /** Test / Node helper — durable API with in-memory persistence backend. */
  static inMemory(): IndexedDbEventStore {
    return new IndexedDbEventStore(new MemoryKvDatabase());
  }

  async append(
    streamId: string,
    events: GridEvent[],
    expectedVersion: number,
  ): Promise<AppendResult> {
    await this.ready;
    const streamStore = this.db.objectStore(STREAMS);
    const globalStore = this.db.objectStore(GLOBAL);
    const metaStore = this.db.objectStore(META);

    const record = (await streamStore.get<StreamRecord>(streamId)) ?? {
      events: [],
    };
    const actualVersion = record.events.length;

    if (expectedVersion !== -1 && expectedVersion !== actualVersion) {
      return { ok: false, conflict: { expectedVersion, actualVersion } };
    }

    const stamped: GridEvent[] = [];
    for (const event of events) {
      const versioned: GridEvent = {
        ...event,
        streamId,
        version: record.events.length + stamped.length + 1,
      };
      stamped.push(versioned);
      record.events.push(versioned);
    }

    await streamStore.put(streamId, record);

    const globalPos =
      (await metaStore.get<number>('globalPosition')) ?? 0;
    let nextPos = globalPos;
    for (const event of stamped) {
      nextPos += 1;
      await globalStore.put(String(nextPos), event);
    }
    await metaStore.put('globalPosition', nextPos);

    const subs = this.listeners.get(streamId);
    for (const event of stamped) {
      if (subs) {
        for (const listener of subs) listener(event);
      }
      for (const listener of this.globalListeners) listener(event);
    }

    return { ok: true, version: record.events.length };
  }

  async read(streamId: string, fromVersion: number = 0): Promise<GridEvent[]> {
    await this.ready;
    const record = await this.db.objectStore(STREAMS).get<StreamRecord>(streamId);
    return (record?.events ?? []).slice(fromVersion);
  }

  async readAll(fromPosition: number = 0): Promise<GridEvent[]> {
    await this.ready;
    const globalStore = this.db.objectStore(GLOBAL);
    const keys = (await globalStore.getAllKeys())
      .map(Number)
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b)
      .filter((n) => n > fromPosition);

    const events: GridEvent[] = [];
    for (const key of keys) {
      const event = await globalStore.get<GridEvent>(String(key));
      if (event) events.push(event);
    }
    return events;
  }

  subscribe(streamId: string, onEvent: Listener): Unsubscribe {
    if (!this.listeners.has(streamId)) {
      this.listeners.set(streamId, new Set());
    }
    const subs = this.listeners.get(streamId)!;
    subs.add(onEvent);
    return () => {
      subs.delete(onEvent);
    };
  }

  subscribeAll(onEvent: Listener): Unsubscribe {
    this.globalListeners.add(onEvent);
    return () => {
      this.globalListeners.delete(onEvent);
    };
  }
}
