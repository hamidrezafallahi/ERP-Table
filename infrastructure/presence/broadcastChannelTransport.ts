import type {
  PresenceMessage,
  PresenceTransport,
} from '../../application/ports/PresencePort';

/**
 * Browser BroadcastChannel presence transport (PR-139).
 * Channel name should be scoped per table: `pdg-presence:{store}:{tableKey}`.
 */
export function createBroadcastChannelPresenceTransport(
  channelName: string,
): PresenceTransport {
  if (typeof BroadcastChannel === 'undefined') {
    return {
      publish: () => {},
      subscribe: () => () => {},
    };
  }
  const channel = new BroadcastChannel(channelName);
  return {
    publish(message) {
      channel.postMessage(message);
    },
    subscribe(listener) {
      const onMessage = (event: MessageEvent<PresenceMessage>) => {
        listener(event.data);
      };
      channel.addEventListener('message', onMessage);
      return () => {
        channel.removeEventListener('message', onMessage);
        channel.close();
      };
    },
  };
}
