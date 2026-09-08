import type {
  GridEvent,
  ImportRequestedPayload,
} from '../../../../domain/types/GridEvent';
import type {
  GridPlugin,
  GridPluginContext,
} from '../../../../application/plugins/GridPlugin';
import { applyImportedRows } from './applyImportedRows';
import { mapImportedSheet } from './mapImportedSheet';
import { parseXlsxBlob } from './parseXlsxBlob';

export type ExcelImportPluginOptions = {
  onImported?: (meta: { rowCount: number; columnCount: number }) => void;
};

/**
 * Subscribes to IMPORT_REQUESTED (format=xlsx); mutates domain only via
 * session/engine commands (never touches Entity directly).
 */
export class ExcelImportPlugin implements GridPlugin {
  readonly name = 'excel-import';
  private unsub: (() => void) | null = null;

  constructor(private readonly options: ExcelImportPluginOptions = {}) {}

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
    if (event.type !== 'IMPORT_REQUESTED') return;
    if (event.tableId !== ctx.tableId) return;

    const payload = event.payload as ImportRequestedPayload;
    if (payload.format !== 'xlsx') return;

    try {
      const correlationId = event.correlationId;
      if (!correlationId) {
        throw new Error('NO_IMPORT_DATA');
      }
      const bytes = ctx.resolveImportData?.(correlationId);
      if (!bytes || bytes.byteLength === 0) {
        throw new Error('NO_IMPORT_DATA');
      }

      const source = ctx.query.getExportSource(payload.collectionScope ?? 'active');
      if (!source) {
        throw new Error('NO_IMPORT_TARGET');
      }

      const sheet = await parseXlsxBlob(bytes, {
        sheetName: payload.sheetName,
      });
      if (sheet.headers.length === 0) {
        throw new Error('NO_COLUMNS');
      }

      const mapped = mapImportedSheet(sheet, source.columns);
      if (mapped.columns.length === 0) {
        throw new Error('NO_COLUMN_MATCH');
      }

      const { rowCount } = await applyImportedRows(ctx.session, mapped.rows);
      const columnCount = mapped.columns.length;

      this.options.onImported?.({ rowCount, columnCount });

      await ctx.bus.publish({
        eventId: `${Date.now()}-xlsx-import-ok`,
        type: 'XLSX_IMPORT_COMPLETED',
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
      const known = new Set([
        'NO_IMPORT_DATA',
        'NO_IMPORT_TARGET',
        'NO_COLUMNS',
        'NO_COLUMN_MATCH',
        'INVALID_XLSX',
        'NO_SHEET',
        'SHEET_NOT_FOUND',
      ]);
      await ctx.bus.publish({
        eventId: `${Date.now()}-xlsx-import-fail`,
        type: 'XLSX_IMPORT_FAILED',
        tableId: ctx.tableId,
        streamId: `table/${ctx.tableId}/view`,
        version: 0,
        occurredAt: Date.now(),
        actorId: event.actorId,
        correlationId: event.correlationId,
        causationId: event.eventId,
        payload: {
          format: 'xlsx' as const,
          code: known.has(message) ? message : 'IMPORT_FAILED',
          message,
        },
      });
    }
  }
}
