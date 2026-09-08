import { describe, expect, it, vi } from 'vitest';

import { InMemoryEventStore } from '../../../../infrastructure/eventStore/InMemoryEventStore';
import type { GridSession } from '../../../../application/session/GridSession';
import type {
  ExportSource,
  GridQueryPort,
} from '../../../../application/plugins/GridPlugin';
import { PluginHost } from '../../../../application/plugins/PluginHost';
import { ExcelImportPlugin } from '../src/ExcelImportPlugin';
import { buildXlsxBlob } from '../src/buildXlsxBlob';
import { parseXlsxBlob } from '../src/parseXlsxBlob';
import { mapImportedSheet } from '../src/mapImportedSheet';

const sampleSource: ExportSource = {
  columns: [
    { fieldName: 'name', fieldCaption: 'Name', fieldType: 'text', order: 1 },
    { fieldName: 'amount', fieldCaption: 'Amount', fieldType: 'price', order: 2 },
  ],
  rows: [],
};

function stubSession(dispatched: unknown[]): GridSession {
  return {
    store: 's',
    tableKey: 't1',
    dispatchViewIntent: async () => {},
    handleKeydown: async () => {},
    getSnapShot: () => null,
    getViewState: () => undefined,
    subscribe: () => () => {},
    subscribeSelected: () => () => {},
    getViewport: () => ({}) as never,
    getVisibleRange: () => ({ startIndex: 0, endIndex: 0 }) as never,
    projectVisibleRows: (rows) => [...rows],
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
    getEngine: () =>
      ({
        dispatch: async (cmd: unknown) => {
          dispatched.push(cmd);
        },
      }) as never,
  } as GridSession;
}

function stubQuery(source: ExportSource | null): GridQueryPort {
  return {
    getSnapShot: () => null,
    getExportSource: () => source,
  };
}

describe('excel import plugin', () => {
  it('round-trips buildXlsxBlob → parseXlsxBlob', async () => {
    const blob = buildXlsxBlob(
      {
        columns: [
          { fieldName: 'name', caption: 'Name' },
          { fieldName: 'amount', caption: 'Amount' },
        ],
        rows: [
          ['Widget', '1,200'],
          ['Gadget', '50'],
        ],
      },
      { direction: 'ltr', rowHeaderLabel: 'Row' },
    );

    const sheet = await parseXlsxBlob(blob);
    expect(sheet.headers).toEqual(['Name', 'Amount']);
    expect(sheet.rows).toEqual([
      ['Widget', '1,200'],
      ['Gadget', '50'],
    ]);

    const mapped = mapImportedSheet(sheet, sampleSource.columns);
    expect(mapped.columns.map((c) => c.fieldName)).toEqual(['name', 'amount']);
    expect(mapped.rows[0]?.[1]?.value).toBe(1200);
  });

  it('imports via ADD_NEW_ROWS and emits XLSX_IMPORT_COMPLETED', async () => {
    const store = new InMemoryEventStore();
    const dispatched: unknown[] = [];
    const host = new PluginHost({
      tableId: 't1',
      actorId: 'u1',
      eventStore: store,
      session: stubSession(dispatched),
      query: stubQuery(sampleSource),
    });
    const onImported = vi.fn();
    host.register([new ExcelImportPlugin({ onImported })]);

    const blob = buildXlsxBlob(
      {
        columns: [
          { fieldName: 'name', caption: 'Name' },
          { fieldName: 'amount', caption: 'Amount' },
        ],
        rows: [['Alpha', '10']],
      },
      { direction: 'ltr', rowHeaderLabel: 'Row' },
    );

    await host.requestImport({ format: 'xlsx', data: blob, correlationId: 'imp-1' });

    expect(onImported).toHaveBeenCalledWith({ rowCount: 1, columnCount: 2 });
    expect(dispatched).toHaveLength(1);
    expect((dispatched[0] as { type: string }).type).toBe('ADD_NEW_ROWS');

    const viewEvents = await store.read('table/t1/view');
    expect(viewEvents.map((e) => e.type)).toEqual(
      expect.arrayContaining(['IMPORT_REQUESTED', 'XLSX_IMPORT_COMPLETED']),
    );
  });

  it('fails when target has no columns', async () => {
    const store = new InMemoryEventStore();
    const host = new PluginHost({
      tableId: 't1',
      actorId: 'u1',
      eventStore: store,
      session: stubSession([]),
      query: stubQuery({ columns: [], rows: [] }),
    });
    host.register([new ExcelImportPlugin()]);

    const blob = buildXlsxBlob(
      {
        columns: [{ fieldName: 'x', caption: 'Unrelated' }],
        rows: [['z']],
      },
      { direction: 'ltr', rowHeaderLabel: 'Row' },
    );

    await expect(
      host.requestImport({ format: 'xlsx', data: blob }),
    ).rejects.toThrow(/NO_COLUMN_MATCH|NO_COLUMNS/);
  });
});
