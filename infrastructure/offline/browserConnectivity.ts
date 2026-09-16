import type { ConnectivitySource } from '../../application/offline/OfflineStatus';

/** Browser `navigator.onLine` + window online/offline events (PR-137). */
export function createBrowserConnectivity(
  overrides?: Partial<ConnectivitySource>,
): ConnectivitySource {
  return {
    getOnline() {
      if (overrides?.getOnline) return overrides.getOnline();
      if (typeof navigator === 'undefined') return true;
      return navigator.onLine;
    },
    subscribe(listener) {
      if (overrides?.subscribe) return overrides.subscribe(listener);
      if (typeof window === 'undefined') return () => {};
      const on = () => listener(true);
      const off = () => listener(false);
      window.addEventListener('online', on);
      window.addEventListener('offline', off);
      return () => {
        window.removeEventListener('online', on);
        window.removeEventListener('offline', off);
      };
    },
  };
}
