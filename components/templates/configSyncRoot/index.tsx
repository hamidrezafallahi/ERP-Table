import { useEffect, useRef } from "react";

import { useDispatch } from "react-redux";

import { useAppSelector } from "@redux/index";
import { mergeConfig } from "@slice/config";

export const ConfigSyncRoot = () => {
  const dispatch = useDispatch();
  const config = useAppSelector((state) => state.withPersist.config);
  const lastConfigRef = useRef(JSON.stringify(config));
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const channel = new BroadcastChannel("config_sync_channel");
    channelRef.current = channel;

    channel.onmessage = (msg) => {
      if (!msg.data) return;
      if (msg.data.type === "CONFIG_UPDATE") {
        const incoming = msg.data.payload;
        const serializedIncoming = JSON.stringify(incoming);

        if (serializedIncoming !== lastConfigRef.current) {
          dispatch(mergeConfig(incoming));

          window.location.reload();
        }
      }
    };

    return () => channel.close();
  }, [dispatch]);

  useEffect(() => {
    if (!channelRef.current) return;
    const serialized = JSON.stringify(config);
    if (serialized !== lastConfigRef.current) {
      lastConfigRef.current = serialized;
      channelRef.current.postMessage({
        type: "CONFIG_UPDATE",
        payload: config,
      });
    }
  }, [config]);

  return null;
};
