import type { SyncWatermarkStore } from '../../application/offline/OfflineStatus';

/** localStorage-backed sync watermark (PR-137). */
export function createLocalStorageWatermark(key: string): SyncWatermarkStore {
  return {
    load() {
      if (typeof localStorage === 'undefined') return [];
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const ids = JSON.parse(raw) as unknown;
        return Array.isArray(ids)
          ? ids.filter((id): id is string => typeof id === 'string')
          : [];
      } catch {
        return [];
      }
    },
    save(ids) {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.setItem(key, JSON.stringify([...ids]));
      } catch {
        /* quota / private mode */
      }
    },
  };
}
