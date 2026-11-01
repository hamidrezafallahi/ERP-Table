import type {
  AppendResult,
  EventStore,
  Unsubscribe,
} from '../../application/ports/EventStore';
import type { GridEvent } from '../../domain/types/GridEvent';

export type TrackedEventStore = {
  /** Drop-in EventStore whose subscriptions are remembered. */
  readonly store: EventStore;
  /**
   * Unsubscribe every subscription still open and refuse new ones.
   * Idempotent. Does not touch the underlying store's data.
   */
  release(): void;
};

/**
 * Wraps an EventStore so every `subscribe` / `subscribeAll` taken through the
 * wrapper (grid internals, plugins, sync) can be dropped in one call when the
 * grid is torn down — even when a consumer forgot to unsubscribe. The
 * underlying (possibly host-owned) store is never closed or cleared.
 */
export function trackEventStoreSubscriptions(
  inner: EventStore,
): TrackedEventStore {
  const open = new Set<Unsubscribe>();
  let released = false;

  const track = (
    subscribe: () => Unsubscribe,
  ): Unsubscribe => {
    if (released) return () => undefined;
    const raw = subscribe();
    let done = false;
    const unsub: Unsubscribe = () => {
      if (done) return;
      done = true;
      open.delete(unsub);
      raw();
    };
    open.add(unsub);
    return unsub;
  };

  const store: EventStore = {
    append: (streamId, events, expectedVersion): Promise<AppendResult> =>
      inner.append(streamId, events, expectedVersion),
    read: (streamId, fromVersion) => inner.read(streamId, fromVersion),
    readAll: (fromPosition) => inner.readAll(fromPosition),
    subscribe: (streamId, onEvent: (event: GridEvent) => void) =>
      track(() => inner.subscribe(streamId, onEvent)),
    subscribeAll: (onEvent: (event: GridEvent) => void) =>
      track(() => inner.subscribeAll(onEvent)),
  };

  return {
    store,
    release(): void {
      released = true;
      for (const unsub of [...open]) unsub();
      open.clear();
    },
  };
}
