import type {
  PresenceMessage,
  PresenceTransport,
} from '../../application/ports/PresencePort';

type Client = {
  listener: ((message: PresenceMessage) => void) | null;
};

/**
 * Shared in-memory presence hub for tests / Node (PR-139).
 * Mirrors BroadcastChannel semantics without DOM.
 */
export class InMemoryPresenceHub {
  private readonly clients = new Map<string, Client>();

  transportFor(clientId: string): PresenceTransport {
    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, { listener: null });
    }
    return {
      publish: (message) => {
        for (const [id, client] of this.clients) {
          if (id === clientId) continue;
          client.listener?.(message);
        }
      },
      subscribe: (listener) => {
        const client = this.clients.get(clientId)!;
        client.listener = listener;
        return () => {
          if (client.listener === listener) client.listener = null;
        };
      },
    };
  }
}
