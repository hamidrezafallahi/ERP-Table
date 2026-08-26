import type {
  ExportRequestedPayload,
  GridEvent,
} from '../../../../domain/types/GridEvent';
import type {
  GridPlugin,
  GridPluginContext,
} from '../../../../application/plugins/GridPlugin';
import { buildExportTable } from './buildExportTable';
import { buildXlsxBlob, downloadBlob } from './buildXlsxBlob';

export type ExcelExportPluginOptions = {
  /** Skip browser download (useful in tests / Node). */
  download?: boolean;
  onBlob?: (blob: Blob, meta: { fileName: string; rowCount: number; columnCount: number }) => void;
};

/**
 * Subscribes to EXPORT_REQUESTED (format=xlsx); never mutates Domain.
 */
export class ExcelExportPlugin implements GridPlugin {
  readonly name = 'excel-export';
  private unsub: (() => void) | null = null;

  constructor(private readonly options: ExcelExportPluginOptions = {}) {}

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
    if (payload.format !== 'xlsx') return;

    try {
      const source = ctx.query.getExportSource(payload.collectionScope ?? 'active');
      if (!source) {
        throw new Error('NO_EXPORT_SOURCE');
      }

      const table = buildExportTable(source);
      if (table.columns.length === 0 && table.rows.length === 0) {
        throw new Error('NO_COLUMNS');
      }

      const fileName =
        payload.fileName ??
        `export-${new Date().toISOString().slice(0, 10)}.xlsx`;

      const blob = buildXlsxBlob(table, {
        sheetName: payload.sheetName,
        direction: payload.direction ?? 'rtl',
      });

      const columnCount = table.columns.length + 1;
      const rowCount = table.rows.length;

      if (this.options.download !== false) {
        downloadBlob(blob, fileName);
      }
      this.options.onBlob?.(blob, { fileName, rowCount, columnCount });

      await ctx.bus.publish({
        eventId: `${Date.now()}-xlsx-ok`,
        type: 'XLSX_EXPORT_COMPLETED',
        tableId: ctx.tableId,
        streamId: `table/${ctx.tableId}/view`,
        version: 0,
        occurredAt: Date.now(),
        actorId: event.actorId,
        correlationId: event.correlationId,
        causationId: event.eventId,
        payload: {
          format: 'xlsx' as const,
          rowCount,
          columnCount,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await ctx.bus.publish({
        eventId: `${Date.now()}-xlsx-fail`,
        type: 'XLSX_EXPORT_FAILED',
        tableId: ctx.tableId,
        streamId: `table/${ctx.tableId}/view`,
        version: 0,
        occurredAt: Date.now(),
        actorId: event.actorId,
        correlationId: event.correlationId,
        causationId: event.eventId,
        payload: {
          format: 'xlsx' as const,
          code: message === 'NO_COLUMNS' || message === 'NO_EXPORT_SOURCE'
            ? message
            : 'EXPORT_FAILED',
          message,
        },
      });
    }
  }
}
