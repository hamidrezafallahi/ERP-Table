import type {
  ExportRequestedPayload,
  GridEvent,
} from '../../../../domain/types/GridEvent';
import type {
  GridPlugin,
  GridPluginContext,
} from '../../../../application/plugins/GridPlugin';
import { buildCsvBlob, type BuildCsvOptions } from './buildCsv';

function downloadBlob(blob: Blob, fileName: string): void {
  if (typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
export type CsvExportPluginOptions = BuildCsvOptions & {
  /** Skip browser download (tests / Node). */
  download?: boolean;
  onBlob?: (
    blob: Blob,
    meta: { fileName: string; rowCount: number; columnCount: number },
  ) => void;
};

/**
 * Subscribes to EXPORT_REQUESTED (format=csv); never mutates Domain (PR-122).
 */
export class CsvExportPlugin implements GridPlugin {
  readonly name = 'csv-export';
  private unsub: (() => void) | null = null;

  constructor(private readonly options: CsvExportPluginOptions = {}) {}

  register(ctx: GridPluginContext): void {
    this.unsub = ctx.bus.subscribeAll((event) => {
      void this.onEvent(ctx, event);
    });
  }

  dispose(): void {
    this.unsub?.();
    this.unsub = null;
  }

  private async onEvent(
    ctx: GridPluginContext,
    event: GridEvent,
  ): Promise<void> {
    if (event.type !== 'EXPORT_REQUESTED') return;
    if (event.tableId !== ctx.tableId) return;

    const payload = event.payload as ExportRequestedPayload;
    if (payload.format !== 'csv') return;

    try {
      const source = ctx.query.getExportSource(
        payload.collectionScope ?? 'active',
      );
      if (!source) throw new Error('NO_EXPORT_SOURCE');

      const blob = buildCsvBlob(source, this.options);
      const fileName =
        payload.fileName ??
        `export-${new Date().toISOString().slice(0, 10)}.csv`;
      const rowCount = source.rows.length;
      const columnCount = source.columns.length;

      if (this.options.download !== false) {
        downloadBlob(blob, fileName);
      }
      this.options.onBlob?.(blob, { fileName, rowCount, columnCount });

      await ctx.bus.publish({
        eventId: `${Date.now()}-csv-ok`,
        type: 'CSV_EXPORT_COMPLETED',
        tableId: ctx.tableId,
        streamId: `table/${ctx.tableId}/view`,
        version: 0,
        occurredAt: Date.now(),
        actorId: event.actorId,
        correlationId: event.correlationId,
        causationId: event.eventId,
        payload: {
          format: 'csv' as const,
          rowCount,
          columnCount,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await ctx.bus.publish({
        eventId: `${Date.now()}-csv-fail`,
        type: 'CSV_EXPORT_FAILED',
        tableId: ctx.tableId,
        streamId: `table/${ctx.tableId}/view`,
        version: 0,
        occurredAt: Date.now(),
        actorId: event.actorId,
        correlationId: event.correlationId,
        causationId: event.eventId,
        payload: {
          format: 'csv' as const,
          code:
            message === 'NO_EXPORT_SOURCE' ? message : 'EXPORT_FAILED',
          message,
        },
      });
    }
  }
}
