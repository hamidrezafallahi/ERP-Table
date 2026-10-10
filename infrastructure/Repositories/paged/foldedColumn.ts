// Streamed column fold (Memory Iron Rule): folds every non-deleted item of a
// column into a small accumulator and re-emits only when the data changed.
// Loaded lazily with the paged kit — see `TableEngine.subscribeColumn`.

export type ColumnItem = { id: number; rowNum: unknown; value: unknown };

export function foldColumnSubscription<T>(args: {
  /** Store tick source (any state change re-evaluates the fold). */
  subscribe: (listener: () => void) => (() => void) | undefined;
  /** Feeds every non-deleted item (streamed in batches by the caller). */
  iterate: (onItem: (item: ColumnItem) => void) => Promise<void>;
  reducer: (acc: T, item: ColumnItem) => T;
  seed: T;
  cb: (acc: T) => void;
  onError?: (error: unknown) => void;
}): () => void {
  const { subscribe, iterate, reducer, seed, cb, onError } = args;

  // Two independent FNV-style hashes over a per-item token — O(1) heap.
  const mixHash = (h1: number, h2: number, token: string): [number, number] => {
    for (let i = 0; i < token.length; i++) {
      const c = token.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
      h2 = Math.imul(h2 ^ c, 2654435761) >>> 0;
    }
    return [h1, h2];
  };

  let cancelled = false;
  let prev = '';
  let inFlight = false;
  let pending = false;

  const notify = async (): Promise<void> => {
    if (cancelled) return;
    if (inFlight) {
      pending = true;
      return;
    }
    inFlight = true;
    try {
      let acc = seed;
      let hash: [number, number] = [2166136261, 5381];
      let sawAny = false;
      await iterate((item) => {
        sawAny = true;
        acc = reducer(acc, item);
        hash = mixHash(
          hash[0],
          hash[1],
          `${item.id}:${String(item.rowNum)}:${String(item.value)}`,
        );
      });
      if (cancelled) return;
      const sig = sawAny ? `${hash[0]}:${hash[1]}` : 'empty';
      if (sig !== prev) {
        prev = sig;
        cb(acc);
      }
    } catch (e) {
      onError?.(e);
    } finally {
      inFlight = false;
      if (pending && !cancelled) {
        pending = false;
        void notify();
      }
    }
  };

  const unsubscribe = subscribe(() => {
    void notify();
  });
  void notify();

  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}
