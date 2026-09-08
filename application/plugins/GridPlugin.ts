import type { EventStore, Unsubscribe } from '../ports/EventStore';
import type { GridSession } from '../session/GridSession';
import type { CollectionScope } from '../../domain/entities/Table';
import type { TableSnapShot } from '../../engine/type';
import type { GridEvent } from '../../domain/types/GridEvent';

export type ExportColumnDef = {
  readonly fieldName: string;
  readonly fieldCaption?: string;
  readonly fieldType?: string;
  readonly order?: number;
};

export type ExportCellSource = {
  readonly value: unknown;
  readonly display?: unknown;
};

export type ExportRowSource = {
  readonly id: number;
  readonly rowState: string;
  readonly cells: Readonly<Record<string, ExportCellSource>>;
};

export type ExportSource = {
  readonly columns: readonly ExportColumnDef[];
  readonly rows: readonly ExportRowSource[];
};

/**
 * Read-only query surface for plugins (never mutates aggregates).
 */
export interface GridQueryPort {
  getSnapShot(collectionScope?: CollectionScope): TableSnapShot | null;
  getExportSource(collectionScope?: CollectionScope): ExportSource | null;
}

export type PluginEventBus = {
  subscribeAll(onEvent: (event: GridEvent) => void): Unsubscribe;
  publish(event: GridEvent): Promise<void>;
};

export interface GridPluginContext {
  readonly tableId: string;
  readonly bus: PluginEventBus;
  readonly session: GridSession;
  readonly query: GridQueryPort;
  readonly eventStore: EventStore;
  /**
   * Out-of-band binary for IMPORT_REQUESTED (not stored on the event bus /
   * IndexedDB payload — only correlationId is published).
   */
  resolveImportData?: (correlationId: string) => Uint8Array | undefined;
}

export interface GridPlugin {
  readonly name: string;
  register(ctx: GridPluginContext): void;
  dispose?(): void;
}
