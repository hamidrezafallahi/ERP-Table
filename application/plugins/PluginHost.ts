import type { EventStore } from '../ports/EventStore';
import type { GridSession } from '../session/GridSession';
import type { GridEvent } from '../../domain/types/GridEvent';
import type {
  ExportRequestedPayload,
} from '../../domain/types/GridEvent';
import type {
  GridPlugin,
  GridPluginContext,
  GridQueryPort,
  PluginEventBus,
} from './GridPlugin';

export type RequestExportOptions = {
  format: 'xlsx' | 'pdf';
  collectionScope?: ExportRequestedPayload['collectionScope'];
  correlationId?: string;
  fileName?: string;
  sheetName?: string;
  direction?: 'rtl' | 'ltr';
};

export type PluginHostDeps = {
  tableId: string;
  actorId: string;
  eventStore: EventStore;
  session: GridSession;
  query: GridQueryPort;
};

function createEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Registers plugins and publishes plugin/view-stream events (e.g. EXPORT_REQUESTED).
 */
export class PluginHost {
  private readonly plugins: GridPlugin[] = [];
  private readonly disposers: Array<() => void> = [];
  private version = 0;

  constructor(private readonly deps: PluginHostDeps) {}

  private createBus(): PluginEventBus {
    const { eventStore, tableId, actorId } = this.deps;
    const viewStreamId = `table/${tableId}/view`;

    return {
      subscribeAll: (onEvent) => eventStore.subscribeAll(onEvent),
      publish: async (partial) => {
        this.version += 1;
        const event: GridEvent = {
          ...partial,
          eventId: partial.eventId || createEventId(),
          tableId: partial.tableId || tableId,
          streamId: partial.streamId || viewStreamId,
          version: partial.version || this.version,
          occurredAt: partial.occurredAt || Date.now(),
          actorId: partial.actorId || actorId,
        };
        await eventStore.append(event.streamId, [event], -1);
      },
    };
  }

  register(plugins: readonly GridPlugin[]): void {
    const ctx: GridPluginContext = {
      tableId: this.deps.tableId,
      bus: this.createBus(),
      session: this.deps.session,
      query: this.deps.query,
      eventStore: this.deps.eventStore,
    };

    for (const plugin of plugins) {
      plugin.register(ctx);
      this.plugins.push(plugin);
      if (plugin.dispose) {
        this.disposers.push(() => plugin.dispose?.());
      }
    }
  }

  list(): readonly GridPlugin[] {
    return this.plugins;
  }

  async requestExport(options: RequestExportOptions): Promise<void> {
    const bus = this.createBus();
    const payload: ExportRequestedPayload = {
      format: options.format,
      collectionScope: options.collectionScope ?? 'active',
      fileName: options.fileName,
      sheetName: options.sheetName,
      direction: options.direction,
    };

    await bus.publish({
      eventId: createEventId(),
      type: 'EXPORT_REQUESTED',
      tableId: this.deps.tableId,
      streamId: `table/${this.deps.tableId}/view`,
      version: 0,
      occurredAt: Date.now(),
      actorId: this.deps.actorId,
      correlationId: options.correlationId,
      payload,
    });
  }

  dispose(): void {
    for (const dispose of this.disposers) dispose();
    this.disposers.length = 0;
    this.plugins.length = 0;
  }
}
