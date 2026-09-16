import type { GridEvent } from '../../domain/types/GridEvent';
import type { SyncTransport } from '../../application/ports/SyncPort';

type ClientInbox = {
  events: GridEvent[];
  delivered: Set<string>;
};

/**
 * Shared in-memory sync hub for tests / demos (PR-138).
 * Each client gets a transport bound to a clientId.
 */
export class InMemorySyncHub {
  private log: GridEvent[] = [];
  private readonly clients = new Map<string, ClientInbox>();

  transportFor(clientId: string): SyncTransport {
    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, { events: [], delivered: new Set() });
    }
    return {
      push: async (events) => this.push(clientId, events),
      pull: async (afterCursor) => this.pull(clientId, afterCursor),
    };
  }

  private async push(
    clientId: string,
    events: readonly GridEvent[],
  ): Promise<{ acceptedIds: readonly string[] }> {
    const acceptedIds: string[] = [];
    for (const event of events) {
      if (this.log.some((e) => e.eventId === event.eventId)) {
        acceptedIds.push(event.eventId);
        continue;
      }
      this.log.push(event);
      acceptedIds.push(event.eventId);
      for (const [id, inbox] of this.clients) {
        if (id === clientId) continue;
        inbox.events.push(event);
      }
    }
    return { acceptedIds };
  }

  private async pull(
    clientId: string,
    afterCursor: number,
  ): Promise<{ events: readonly GridEvent[]; cursor: number }> {
    void afterCursor;
    const inbox = this.clients.get(clientId);
    if (!inbox) {
      return { events: [], cursor: this.log.length };
    }
    const fresh = inbox.events.filter((e) => !inbox.delivered.has(e.eventId));
    for (const e of fresh) inbox.delivered.add(e.eventId);
    return { events: fresh, cursor: this.log.length };
  }

  /** Test helper: all events currently on the hub. */
  getLog(): readonly GridEvent[] {
    return this.log;
  }
}
