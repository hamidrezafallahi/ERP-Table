import type {
  ExportRequestedPayload,
  GridEvent,
} from '../../../../domain/types/GridEvent';
import type {
  GridPlugin,
  GridPluginContext,
} from '../../../../application/plugins/GridPlugin';
import type { PdfRenderer } from '../../../../application/ports/PdfRenderer';
import type { DocumentPdfTemplate } from './documentTemplate';
import { TextPdfRenderer } from './TextPdfRenderer';
import { downloadBlob } from '../../excel/src/buildXlsxBlob';

export type PdfExportPluginOptions = {
  renderer?: PdfRenderer;
  download?: boolean;
  /** Document chrome for VazirmatnPdfRenderer (PR-141). */
  template?: DocumentPdfTemplate;
  onBlob?: (blob: Blob, meta: { fileName: string; rowCount: number }) => void;
};

/**
 * Subscribes to EXPORT_REQUESTED (format=pdf); Domain stays untouched.
 *
 * Default renderer is legacy `TextPdfRenderer` so `./plugins/pdf` stays free of
 * font bytes (PR-76 / D15). For Persian PDF:
 * `import { createVazirmatnPdfExportPlugin } from 'persian-data-grid/plugins/pdf/fonts/vazirmatn'`.
 */
export class PdfExportPlugin implements GridPlugin {
  readonly name = 'pdf-export';
  private unsub: (() => void) | null = null;
  private readonly renderer: PdfRenderer;

  constructor(private readonly options: PdfExportPluginOptions = {}) {
    this.renderer = options.renderer ?? new TextPdfRenderer();
  }

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
    if (payload.format !== 'pdf') return;

    try {
      const source = ctx.query.getExportSource(
        payload.collectionScope ?? 'active',
      );
      if (!source) {
        throw new Error('NO_EXPORT_SOURCE');
      }

      const blob = await this.renderer.render(source, {
        title: payload.fileName ?? 'Export',
        direction: payload.direction,
        template: this.options.template,
      });

      const fileName =
        payload.fileName ??
        `export-${new Date().toISOString().slice(0, 10)}.pdf`;
      const rowCount = source.rows.length;

      if (this.options.download !== false) {
        downloadBlob(blob, fileName);
      }
      this.options.onBlob?.(blob, { fileName, rowCount });

      await ctx.bus.publish({
        eventId: `${Date.now()}-pdf-ok`,
        type: 'PDF_EXPORT_COMPLETED',
        tableId: ctx.tableId,
        streamId: `table/${ctx.tableId}/view`,
        version: 0,
        occurredAt: Date.now(),
        actorId: event.actorId,
        correlationId: event.correlationId,
        causationId: event.eventId,
        payload: {
          format: 'pdf' as const,
          rowCount,
          blobId: fileName,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await ctx.bus.publish({
        eventId: `${Date.now()}-pdf-fail`,
        type: 'PDF_EXPORT_FAILED',
        tableId: ctx.tableId,
        streamId: `table/${ctx.tableId}/view`,
        version: 0,
        occurredAt: Date.now(),
        actorId: event.actorId,
        correlationId: event.correlationId,
        causationId: event.eventId,
        payload: {
          format: 'pdf' as const,
          code: message === 'NO_EXPORT_SOURCE' ? message : 'EXPORT_FAILED',
          message,
        },
      });
    }
  }
}
