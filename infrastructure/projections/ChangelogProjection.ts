import type { EventStore, Unsubscribe } from '../../application/ports/EventStore';
import type { GridEvent } from '../../domain/types/GridEvent';

export interface ChangelogEntry {
  readonly eventId: string;
  readonly type: string;
  readonly tableId: string;
  readonly occurredAt: number;
  readonly actorId: string;
  readonly payload: unknown;
}

export interface ChangelogQuery {
  tableId?: string;
  rowId?: number | string;
  columnId?: string;
  type?: string;
  since?: number;
  limit?: number;
}

type ChangelogSubscriber = {
  filter: ChangelogQuery;
  notify: (entries: ChangelogEntry[]) => void;
};

export class ChangelogProjection {
  private entries: ChangelogEntry[] = [];
  private unsubscribe: Unsubscribe | null = null;
  private subscribers = new Set<ChangelogSubscriber>();
  private seenEventIds = new Set<string>();
  private started = false;

  constructor(private readonly eventStore: EventStore) {}

  /**
   * Catch up via readAll, then subscribe for live events.
   * Dedupes by eventId so subscribe-before-replay races are safe.
   */
  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;

    const projectOnce = (event: GridEvent) => {
      if (this.seenEventIds.has(event.eventId)) return;
      this.seenEventIds.add(event.eventId);
      this.project(event);
    };

    this.unsubscribe = this.eventStore.subscribeAll(projectOnce);

    const past = await this.eventStore.readAll(0);
    for (const event of past) {
      projectOnce(event);
    }
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.started = false;
  }

  query(filter: ChangelogQuery = {}): ChangelogEntry[] {
    let result = this.entries;

    if (filter.tableId) {
      result = result.filter((e) => e.tableId === filter.tableId);
    }
    if (filter.type) {
      result = result.filter((e) => e.type === filter.type);
    }
    if (filter.since) {
      const since = filter.since;
      result = result.filter((e) => e.occurredAt >= since);
    }
    if (filter.rowId !== undefined) {
      const rid = filter.rowId;
      result = result.filter((e) => {
        const p = e.payload as any;
        return p?.rowId === rid;
      });
    }
    if (filter.columnId) {
      const cid = filter.columnId;
      result = result.filter((e) => {
        const p = e.payload as any;
        return p?.columnId === cid;
      });
    }
    if (filter.limit && filter.limit > 0) {
      result = result.slice(-filter.limit);
    }

    return result;
  }

  count(filter: ChangelogQuery = {}): number {
    return this.query(filter).length;
  }

  subscribe(
    notify: (entries: ChangelogEntry[]) => void,
    filter: ChangelogQuery = {},
  ): Unsubscribe {
    const subscriber: ChangelogSubscriber = { filter, notify };
    this.subscribers.add(subscriber);
    notify(this.query(filter));

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  clear(): void {
    this.entries = [];
    this.seenEventIds.clear();
    this.notifySubscribers();
  }

  private project(event: GridEvent): void {
    this.entries.push({
      eventId: event.eventId,
      type: event.type,
      tableId: event.tableId,
      occurredAt: event.occurredAt,
      actorId: event.actorId,
      payload: event.payload,
    });
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    for (const subscriber of this.subscribers) {
      subscriber.notify(this.query(subscriber.filter));
    }
  }
}
