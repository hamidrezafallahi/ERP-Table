import type { GridEvent } from '../../domain/types/GridEvent';
import type { EventStore, Unsubscribe } from '../ports/EventStore';

/** Host / test seam for online detection (no DOM in application/). */
export type ConnectivitySource = {
  getOnline(): boolean;
  subscribe(listener: (online: boolean) => void): Unsubscribe;
};

/** Optional durable set of synced event ids (host/infra; not DOM here). */
export type SyncWatermarkStore = {
  load(): readonly string[];
  save(ids: readonly string[]): void;
};

export type Connectivity = 'online' | 'offline';

export type PendingChange = {
  readonly eventId: string;
  readonly type: string;
  readonly occurredAt: number;
  readonly summary: string;
  /** Full event for SyncPort push (PR-138). */
  readonly event: GridEvent;
};

const DATA_EVENT_TYPES = new Set([
  'CELL_CHANGED',
  'CELL_DISPLAY_CHANGED',
  'ROW_ADDED',
  'NEW_ROW_ADDED',
  'ROW_DELETED',
  'ROW_RESTORED',
  'ROW_REORDERED',
  'ROW_DESCRIPTION_SAVED',
]);

function summarize(event: GridEvent): string {
  const payload = event.payload as Record<string, unknown> | null;
  switch (event.type) {
    case 'CELL_CHANGED':
      return `Cell ${payload?.columnId ?? '?'} → ${String(payload?.newValue ?? '')}`;
    case 'ROW_ADDED':
    case 'NEW_ROW_ADDED':
      return `Row ${String(payload?.rowId ?? '')} added`;
    case 'ROW_DELETED':
      return `Row ${String(payload?.rowId ?? '')} deleted`;
    default:
      return event.type;
  }
}

function toPending(event: GridEvent): PendingChange {
  return {
    eventId: event.eventId,
    type: event.type,
    occurredAt: event.occurredAt,
    summary: summarize(event),
    event,
  };
}

export type OfflineStatusOptions = {
  readonly tableId: string;
  readonly connectivity: ConnectivitySource;
  readonly watermark?: SyncWatermarkStore;
};

/**
 * Product offline session (PR-137): connectivity + pending local data mutations
 * not yet marked synced (SyncPort in PR-138 will call `markSynced`).
 */
export class OfflineStatus {
  private online: boolean;
  private pending: PendingChange[] = [];
  private syncedIds = new Set<string>();
  private connectivityUnsub: Unsubscribe | null = null;
  private storeUnsub: Unsubscribe | null = null;
  /** Incremented by every stop(); invalidates an in-flight start(). */
  private lifecycle = 0;
  private readonly connectivityListeners = new Set<
    (state: Connectivity) => void
  >();
  private readonly pendingListeners = new Set<
    (items: readonly PendingChange[]) => void
  >();

  constructor(private readonly options: OfflineStatusOptions) {
    this.online = options.connectivity.getOnline();
    this.loadWatermark();
  }

  async start(eventStore: EventStore): Promise<void> {
    this.stop();
    // `stop()` bumps the counter; a later stop()/start() while we await
    // `readAll` makes this run stale so it never subscribes (no leak).
    const run = this.lifecycle;
    this.connectivityUnsub = this.options.connectivity.subscribe((online) => {
      if (run !== this.lifecycle) return;
      this.online = online;
      this.emitConnectivity();
    });

    const past = await eventStore.readAll(0);
    if (run !== this.lifecycle) return;
    for (const event of past) {
      this.consider(event);
    }
    this.storeUnsub = eventStore.subscribeAll((event) => {
      this.consider(event);
    });
    this.emitPending();
  }

  /** Stop listening and drop all listeners. The instance is inert afterwards. */
  dispose(): void {
    this.stop();
    this.connectivityListeners.clear();
    this.pendingListeners.clear();
  }

  stop(): void {
    this.lifecycle += 1;
    this.connectivityUnsub?.();
    this.connectivityUnsub = null;
    this.storeUnsub?.();
    this.storeUnsub = null;
  }

  getConnectivity(): Connectivity {
    return this.online ? 'online' : 'offline';
  }

  getPendingChanges(): readonly PendingChange[] {
    return this.pending;
  }

  getPendingCount(): number {
    return this.pending.length;
  }

  /** Mark pending mutations as synced (clears queue / advances watermark). */
  markSynced(eventIds?: readonly string[]): void {
    if (!eventIds || eventIds.length === 0) {
      for (const item of this.pending) {
        this.syncedIds.add(item.eventId);
      }
      this.pending = [];
    } else {
      const clear = new Set(eventIds);
      for (const id of clear) this.syncedIds.add(id);
      this.pending = this.pending.filter((p) => !clear.has(p.eventId));
    }
    this.persistWatermark();
    this.emitPending();
  }

  subscribeConnectivity(listener: (state: Connectivity) => void): Unsubscribe {
    this.connectivityListeners.add(listener);
    listener(this.getConnectivity());
    return () => this.connectivityListeners.delete(listener);
  }

  subscribePending(
    listener: (items: readonly PendingChange[]) => void,
  ): Unsubscribe {
    this.pendingListeners.add(listener);
    listener(this.pending);
    return () => this.pendingListeners.delete(listener);
  }

  private consider(event: GridEvent): void {
    if (event.tableId !== this.options.tableId) return;
    if (!DATA_EVENT_TYPES.has(event.type)) return;
    if (this.syncedIds.has(event.eventId)) return;
    if (this.pending.some((p) => p.eventId === event.eventId)) return;
    this.pending = [...this.pending, toPending(event)];
    this.emitPending();
  }

  private emitConnectivity(): void {
    const state = this.getConnectivity();
    for (const listener of this.connectivityListeners) listener(state);
  }

  private emitPending(): void {
    for (const listener of this.pendingListeners) listener(this.pending);
  }

  private loadWatermark(): void {
    const ids = this.options.watermark?.load() ?? [];
    for (const id of ids) this.syncedIds.add(id);
  }

  private persistWatermark(): void {
    this.options.watermark?.save([...this.syncedIds]);
  }
}

/** Always-online source for Node tests / SSR. */
export const alwaysOnlineConnectivity: ConnectivitySource = {
  getOnline: () => true,
  subscribe: () => () => {},
};
