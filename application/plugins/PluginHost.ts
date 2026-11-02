import type { EventStore } from '../ports/EventStore';
import type { GridSession } from '../session/GridSession';
import type { GridEvent } from '../../domain/types/GridEvent';
import type {
  ExportRequestedPayload,
  ImportRequestedPayload,
} from '../../domain/types/GridEvent';
import type {
  GridPlugin,
  GridPluginContext,
  GridQueryPort,
  PluginEventBus,
} from './GridPlugin';

export type RequestExportOptions = {
  format: 'xlsx' | 'pdf' | 'csv';
  collectionScope?: ExportRequestedPayload['collectionScope'];
  correlationId?: string;
  fileName?: string;
  sheetName?: string;
  direction?: 'rtl' | 'ltr';
};

export type RequestImportOptions = {
  format: 'xlsx';
  data: Blob | ArrayBuffer | Uint8Array;
  collectionScope?: ImportRequestedPayload['collectionScope'];
  correlationId?: string;
  sheetName?: string;
};

export type PluginHostDeps = {
  tableId: string;
  actorId: string;
  eventStore: EventStore;
  session: GridSession;
  query: GridQueryPort;
  /** Runs before an export reads rows (createGrid: write the open cell edit). */
  beforeRead?: () => Promise<void>;
};

function createEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function toUint8Array(
  data: Blob | ArrayBuffer | Uint8Array,
): Promise<Uint8Array> {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  return new Uint8Array(await data.arrayBuffer());
}

/**
 * Registers plugins and publishes plugin/view-stream events (e.g. EXPORT_REQUESTED).
 */
export class PluginHost {
  private readonly plugins: GridPlugin[] = [];
  private readonly disposers: Array<() => void> = [];
  private readonly importPayloads = new Map<string, Uint8Array>();
  private version = 0;

  constructor(private readonly deps: PluginHostDeps) {}

  private takeImportPayload(correlationId: string): Uint8Array | undefined {
    return this.importPayloads.get(correlationId);
  }

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
      resolveImportData: (correlationId) => this.takeImportPayload(correlationId),
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

  has(pluginName: string): boolean {
    return this.plugins.some((p) => p.name === pluginName);
  }

  async requestExport(options: RequestExportOptions): Promise<void> {
    await this.deps.beforeRead?.();
    const bus = this.createBus();
    const correlationId = options.correlationId ?? createEventId();
    const pluginName =
      options.format === 'pdf'
        ? 'pdf-export'
        : options.format === 'csv'
          ? 'csv-export'
          : 'excel-export';
    const wait = this.has(pluginName);
    const successType =
      options.format === 'pdf'
        ? 'PDF_EXPORT_COMPLETED'
        : options.format === 'csv'
          ? 'CSV_EXPORT_COMPLETED'
          : 'XLSX_EXPORT_COMPLETED';
    const failType =
      options.format === 'pdf'
        ? 'PDF_EXPORT_FAILED'
        : options.format === 'csv'
          ? 'CSV_EXPORT_FAILED'
          : 'XLSX_EXPORT_FAILED';

    const finished = wait
      ? new Promise<void>((resolve, reject) => {
          const unsub = this.deps.eventStore.subscribeAll((event) => {
            if (event.correlationId !== correlationId) return;
            if (event.type === successType) {
              unsub();
              resolve();
            }
            if (event.type === failType) {
              unsub();
              const message =
                (event.payload as { message?: string })?.message ?? 'EXPORT_FAILED';
              reject(new Error(message));
            }
          });
        })
      : Promise.resolve();

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
      correlationId,
      payload,
    });

    await finished;
  }

  async requestImport(options: RequestImportOptions): Promise<void> {
    if (options.format !== 'xlsx') {
      throw new Error(`Unsupported import format: ${options.format}`);
    }

    const correlationId = options.correlationId ?? createEventId();
    const bytes = await toUint8Array(options.data);
    this.importPayloads.set(correlationId, bytes);

    if (!this.plugins.some((p) => p.name === 'excel-import')) {
      this.importPayloads.delete(correlationId);
      throw new Error('NO_IMPORT_PLUGIN');
    }

    const bus = this.createBus();
    const payload: ImportRequestedPayload = {
      format: 'xlsx',
      collectionScope: options.collectionScope ?? 'active',
      sheetName: options.sheetName,
      byteLength: bytes.byteLength,
    };

    const finished = new Promise<'ok' | string>((resolve) => {
      const unsub = this.deps.eventStore.subscribeAll((event) => {
        if (event.correlationId !== correlationId) return;
        if (event.type === 'XLSX_IMPORT_COMPLETED') {
          unsub();
          resolve('ok');
        }
        if (event.type === 'XLSX_IMPORT_FAILED') {
          unsub();
          const msg =
            (event.payload as { message?: string })?.message ?? 'IMPORT_FAILED';
          resolve(msg);
        }
      });
    });

    try {
      await bus.publish({
        eventId: createEventId(),
        type: 'IMPORT_REQUESTED',
        tableId: this.deps.tableId,
        streamId: `table/${this.deps.tableId}/view`,
        version: 0,
        occurredAt: Date.now(),
        actorId: this.deps.actorId,
        correlationId,
        payload,
      });
      const outcome = await finished;
      if (outcome !== 'ok') {
        throw new Error(outcome);
      }
    } finally {
      this.importPayloads.delete(correlationId);
    }
  }

  dispose(): void {
    for (const dispose of this.disposers) dispose();
    this.disposers.length = 0;
    this.plugins.length = 0;
    this.importPayloads.clear();
  }
}
