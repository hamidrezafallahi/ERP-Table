import { Middleware } from '@reduxjs/toolkit';
import { mergeConfig } from '@slice/config';

const DEBOUNCE_MS = 50;

export const createConfigSyncMiddleware = (): Middleware => {
  return (storeAPI) => {
    if (typeof window === "undefined") {
      return (next) => (action) => next(action);
    }

    let lastConfig: string | null = null;
    let isSyncing = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const channel = new BroadcastChannel("config_sync_channel");

    channel.onmessage = (msg) => {
      if (!msg.data || msg.data.type !== "CONFIG_UPDATE") return;
      try {
        const incoming = msg.data.payload;
        const serializedIncoming = JSON.stringify(incoming);

        if (serializedIncoming !== lastConfig) {
          isSyncing = true;
          storeAPI.dispatch(mergeConfig(incoming));
          isSyncing = false;

          window.location.reload();
        }
      } catch (err) {
        console.error("Failed to sync config:", err);
      }
    };

    window.addEventListener("beforeunload", () => {
      channel.close();
      if (timeoutId) clearTimeout(timeoutId);
    });

    return (next) => (action) => {
      const result = next(action);

      
  if (
    typeof action !== "object" ||
    action === null ||
    !("type" in action)
  ) {
    return result;
  }

  if (!String(action.type).startsWith("pageConfig/")) {
    return result;
  }
      if (isSyncing) return result;

      const state = storeAPI.getState();
      const configState = state.withPersist?.config;

      if (configState) {
        const serialized = JSON.stringify(configState);

        if (serialized !== lastConfig) {
          lastConfig = serialized;

          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            channel.postMessage({
              type: "CONFIG_UPDATE",
              payload: configState,
            });
          }, DEBOUNCE_MS);
        }
      }

      return result;
    };
  };
};
