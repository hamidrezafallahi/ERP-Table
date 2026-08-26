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
  it('TextPdfRenderer returns a PDF blob', async () => {
    const blob = await new TextPdfRenderer().render(sampleSource, {
      title: 'Test',
    });
    const text = await blob.text();
    expect(text.startsWith('%PDF')).toBe(true);
    expect(blob.type).toBe('application/pdf');
  });

  it('completes EXPORT_REQUESTED for pdf', async () => {
    const store = new InMemoryEventStore();
    const host = new PluginHost({
      tableId: 't1',
      actorId: 'u1',
      eventStore: store,
      session: stubSession(),
      query: stubQuery(sampleSource),
    });
    host.register([new PdfExportPlugin({ download: false })]);

    const completed = new Promise<string>((resolve) => {
      store.subscribeAll((e) => {
        if (e.type === 'PDF_EXPORT_COMPLETED' || e.type === 'PDF_EXPORT_FAILED') {
          resolve(e.type);
        }
      });
    });

    await host.requestExport({ format: 'pdf' });
    expect(await completed).toBe('PDF_EXPORT_COMPLETED');
  });
});
