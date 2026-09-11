import { describe, expect, it } from 'vitest';

import { InMemoryEventStore } from '../../../../infrastructure/eventStore/InMemoryEventStore';
import type { GridSession } from '../../../../application/session/GridSession';
import type {
  ExportSource,
  GridQueryPort,
} from '../../../../application/plugins/GridPlugin';
import { PluginHost } from '../../../../application/plugins/PluginHost';
import { ExcelExportPlugin } from '../src/ExcelExportPlugin';
import { buildExportTable } from '../src/buildExportTable';
import { buildXlsxBlob } from '../src/buildXlsxBlob';
import { formatExportValue } from '../src/formatExportValue';

const sampleSource: ExportSource = {
  columns: [
    { fieldName: 'name', fieldCaption: 'نام', fieldType: 'text', order: 1 },
    { fieldName: 'amount', fieldCaption: 'مبلغ', fieldType: 'price', order: 2 },
  ],
  rows: [
    {
      id: 1,
      rowState: 'Added',
      cells: {
        name: { value: 'A', display: 'A' },
        amount: { value: 1000, display: 1000 },
      },
    },
  ],
};

function stubSession(tableKey = 't1'): GridSession {
  return {
    store: 's',
    tableKey,
    dispatchViewIntent: async () => {},
    handleKeydown: async () => {},
    getSnapShot: () => null,
    getViewState: () => undefined,
    subscribe: () => () => {},
    subscribeSelected: () => () => {},
    getViewport: () => ({}) as never,
    getVisibleRange: () => ({ startIndex: 0, endIndex: 0 }) as never,
    projectVisibleRows: (rows) => [...rows],
    getUiRowCount: () => 0,
    projectVisibleUiRows: () => [],
    canUndo: () => false,
    canRedo: () => false,
    undo: async () => false,
    redo: async () => false,
    getChangelog: () => [],
    getChangelogCount: () => 0,
    subscribeChangelog: () => () => {},
    getHistoryItems: () => [],
    getHistoryItemCount: () => 0,
    subscribeHistoryItems: () => () => {},
  } as GridSession;
}

function stubQuery(source: ExportSource | null): GridQueryPort {
  return {
    getSnapShot: () => null,
    getExportSource: () => source,
  };
}

describe('excel plugin', () => {
  it('formats price and builds non-empty xlsx zip', async () => {
    expect(formatExportValue(1200, 'price')).toBe('1,200');
    const table = buildExportTable(sampleSource);
    expect(table.columns).toHaveLength(2);
    expect(table.rows[0]?.[1]).toBe('1,000');

    const blob = buildXlsxBlob(table, { direction: 'rtl' });
    expect(blob.size).toBeGreaterThan(100);
    const buf = new Uint8Array(await blob.arrayBuffer());
    // ZIP local file header signature PK\x03\x04
    expect(buf[0]).toBe(0x50);
    expect(buf[1]).toBe(0x4b);
  });

  it('completes EXPORT_REQUESTED for xlsx without mutating domain', async () => {
    const store = new InMemoryEventStore();
    const blobs: Blob[] = [];
    const host = new PluginHost({
      tableId: 't1',
      actorId: 'u1',
      eventStore: store,
      session: stubSession(),
      query: stubQuery(sampleSource),
    });
    host.register([
      new ExcelExportPlugin({
        download: false,
        onBlob: (b) => blobs.push(b),
      }),
    ]);

    const completed = new Promise<string>((resolve) => {
      store.subscribeAll((e) => {
        if (e.type === 'XLSX_EXPORT_COMPLETED') resolve(e.type);
        if (e.type === 'XLSX_EXPORT_FAILED') resolve(e.type);
      });
    });

    await host.requestExport({ format: 'xlsx', correlationId: 'c1' });
    expect(await completed).toBe('XLSX_EXPORT_COMPLETED');
    expect(blobs).toHaveLength(1);

    const viewEvents = await store.read('table/t1/view');
    expect(viewEvents.map((e) => e.type)).toEqual(
      expect.arrayContaining(['EXPORT_REQUESTED', 'XLSX_EXPORT_COMPLETED']),
    );
  });

  it('emits XLSX_EXPORT_FAILED when source is empty', async () => {
    const store = new InMemoryEventStore();
    const host = new PluginHost({
      tableId: 't1',
      actorId: 'u1',
      eventStore: store,
      session: stubSession(),
      query: stubQuery({ columns: [], rows: [] }),
    });
    host.register([new ExcelExportPlugin({ download: false })]);

    const failed = new Promise<string>((resolve) => {
      store.subscribeAll((e) => {
        if (e.type === 'XLSX_EXPORT_FAILED') {
          resolve((e.payload as { code: string }).code);
        }
      });
    });

    await host.requestExport({ format: 'xlsx' });
    expect(await failed).toBe('NO_COLUMNS');
  });
});
