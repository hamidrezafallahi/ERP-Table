import { describe, expect, it } from 'vitest';

import { InMemoryEventStore } from '../../../../infrastructure/eventStore/InMemoryEventStore';
import type { GridSession } from '../../../../application/session/GridSession';
import type {
  ExportSource,
  GridQueryPort,
} from '../../../../application/plugins/GridPlugin';
import { PluginHost } from '../../../../application/plugins/PluginHost';
import { PdfExportPlugin } from '../src/PdfExportPlugin';
import { TextPdfRenderer } from '../src/TextPdfRenderer';
import { VazirmatnPdfRenderer } from '../src/VazirmatnPdfRenderer';
import { vazirmatnRegularBytes } from '../src/vazirmatnBytes';
import { createVazirmatnPdfExportPlugin } from '../../../../publish/plugins/pdf-fonts-vazirmatn';

const sampleSource: ExportSource = {
  columns: [{ fieldName: 'name', fieldCaption: 'Name', fieldType: 'text' }],
  rows: [
    {
      id: 1,
      rowState: 'Added',
      cells: { name: { value: 'Row1' } },
    },
  ],
};

function stubSession(): GridSession {
  return {
    store: 's',
    tableKey: 't1',
    dispatchViewIntent: async () => {},
    getSnapShot: () => null,
    subscribe: () => () => {},
    subscribeSelected: () => () => {},
    getViewport: () => ({}) as never,
    getVisibleRange: () => ({ startIndex: 0, endIndex: 0 }) as never,
    projectVisibleRows: (rows) => [...rows],
    canUndo: () => false,
    canRedo: () => false,
    undo: async () => false,
    redo: async () => false,
  } as GridSession;
}

function stubQuery(source: ExportSource | null): GridQueryPort {
  return {
    getSnapShot: () => null,
    getExportSource: () => source,
  };
}

describe('pdf plugin', () => {
  it('TextPdfRenderer returns a legacy Helvetica PDF blob', async () => {
    const blob = await new TextPdfRenderer().render(sampleSource, {
      title: 'Test',
    });
    const text = await blob.text();
    expect(text.startsWith('%PDF')).toBe(true);
    expect(text).toContain('/Helvetica');
    expect(blob.type).toBe('application/pdf');
  });

  it('default PdfExportPlugin uses legacy TextPdfRenderer (font is opt-in, PR-76)', async () => {
    const store = new InMemoryEventStore();
    let exported: Blob | undefined;
    const host = new PluginHost({
      tableId: 't1',
      actorId: 'u1',
      eventStore: store,
      session: stubSession(),
      query: stubQuery(sampleSource),
    });
    host.register([
      new PdfExportPlugin({
        download: false,
        onBlob: (blob) => {
          exported = blob;
        },
      }),
    ]);
    expect(host.has('pdf-export')).toBe(true);

    const completed = new Promise<string>((resolve) => {
      store.subscribeAll((e) => {
        if (e.type === 'PDF_EXPORT_COMPLETED' || e.type === 'PDF_EXPORT_FAILED') {
          resolve(e.type);
        }
      });
    });

    await host.requestExport({ format: 'pdf', direction: 'rtl' });
    expect(await completed).toBe('PDF_EXPORT_COMPLETED');
    expect(exported).toBeDefined();
    const ascii = await exported!.text();
    expect(ascii.startsWith('%PDF')).toBe(true);
    expect(ascii).toContain('/Helvetica');
    expect(ascii).not.toContain('/Vazirmatn');
  });

  it('createVazirmatnPdfExportPlugin embeds Vazirmatn from the font subpath', async () => {
    const store = new InMemoryEventStore();
    let exported: Blob | undefined;
    const host = new PluginHost({
      tableId: 't1',
      actorId: 'u1',
      eventStore: store,
      session: stubSession(),
      query: stubQuery(sampleSource),
    });
    host.register([
      createVazirmatnPdfExportPlugin({
        download: false,
        onBlob: (blob) => {
          exported = blob;
        },
      }),
    ]);

    const completed = new Promise<string>((resolve) => {
      store.subscribeAll((e) => {
        if (e.type === 'PDF_EXPORT_COMPLETED' || e.type === 'PDF_EXPORT_FAILED') {
          resolve(e.type);
        }
      });
    });

    await host.requestExport({ format: 'pdf', direction: 'rtl' });
    expect(await completed).toBe('PDF_EXPORT_COMPLETED');
    const ascii = new TextDecoder('latin1').decode(
      new Uint8Array(await exported!.arrayBuffer()),
    );
    expect(ascii).toContain('/Vazirmatn');
    expect(ascii).not.toContain('/Helvetica');
    expect(new VazirmatnPdfRenderer(vazirmatnRegularBytes())).toBeInstanceOf(
      VazirmatnPdfRenderer,
    );
  });

  it('Host can still inject legacy TextPdfRenderer', async () => {
    const store = new InMemoryEventStore();
    let exported: Blob | undefined;
    const host = new PluginHost({
      tableId: 't1',
      actorId: 'u1',
      eventStore: store,
      session: stubSession(),
      query: stubQuery(sampleSource),
    });
    host.register([
      new PdfExportPlugin({
        download: false,
        renderer: new TextPdfRenderer(),
        onBlob: (blob) => {
          exported = blob;
        },
      }),
    ]);

    const completed = new Promise<string>((resolve) => {
      store.subscribeAll((e) => {
        if (e.type === 'PDF_EXPORT_COMPLETED' || e.type === 'PDF_EXPORT_FAILED') {
          resolve(e.type);
        }
      });
    });

    await host.requestExport({ format: 'pdf' });
    expect(await completed).toBe('PDF_EXPORT_COMPLETED');
    const text = await exported!.text();
    expect(text).toContain('/Helvetica');
    expect(text).not.toContain('/Vazirmatn');
  });
});
