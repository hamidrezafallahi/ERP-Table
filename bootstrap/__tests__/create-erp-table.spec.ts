import { describe, expect, it, vi } from 'vitest';
import type { TableRepository } from '../../application/ports/TableRepository';
import type { Table } from '../../domain/entities/Table';
import type { AuditLogger } from '../../application/ports/AuditLogger';
import { RowStateEnum } from '../../domain/value-objects';
import { NoopRemoteApi } from '../../infrastructure/Repositories/noopRemoteApi';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

class MemoryTableRepository implements TableRepository {
  private tables = new Map<string, Table>();

  private key(store: string, tableKey: string): string {
    return `${store}:${tableKey}`;
  }

  async getById(store: string, tableKey: string): Promise<Table> {
    const table = this.tables.get(this.key(store, tableKey));
    if (!table) {
      throw new Error(`Table not found: ${store}/${tableKey}`);
    }
    return table;
  }

  async save(store: string, table: Table): Promise<void> {
    this.tables.set(this.key(store, table.id), table);
  }

  async delete(store: string, tableKey: string): Promise<void> {
    this.tables.delete(this.key(store, tableKey));
  }

  async resetTable(store: string, tableKey: string): Promise<void> {
    this.tables.delete(this.key(store, tableKey));
  }

  async exists(store: string, tableKey: string): Promise<boolean> {
    return this.tables.has(this.key(store, tableKey));
  }
}

class SilentAuditLogger implements AuditLogger {
  log(): void {}
  error(): void {}
  warn(): void {}
  info(): void {}
}

describe('createERPTable runtime wiring', () => {
  it('returns a started changelog projection wired to real app events', async () => {
    const { createERPTable } = await import('../index');
    const repo = new MemoryTableRepository();
    const audit = new SilentAuditLogger();
    const remoteApi = {
      request: async () => null,
    } as any;

    const result = await createERPTable({
      store: 'store-1',
      tableKey: 'table-1',
      actor: { userId: 'user-1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo,
      audit,
      remoteApi,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [
        {
          id: 1,
          collection: 'default',
          values: { name: 'alpha' },
        },
      ],
    });

    expect(result.eventStore).toBeDefined();
    expect(result.changelogProjection).toBeDefined();

    await result.engine.dispatch({
      type: 'CHANGE_PAGE',
      store: 'store-1',
      tableKey: 'table-1',
      page: 2,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const events = result.changelogProjection.query({
      tableId: 'table-1',
      type: 'PAGE_CHANGED',
    });
    const controllerEvents = result.controller.getChangelog({
      type: 'PAGE_CHANGED',
    });
    const historyItems = result.controller.getHistoryItems({
      type: 'PAGE_CHANGED',
    });

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('PAGE_CHANGED');
    expect((events[0].payload as { page: number }).page).toBe(2);
    expect(controllerEvents).toHaveLength(1);
    expect(result.controller.getChangelogCount({ type: 'PAGE_CHANGED' })).toBe(1);
    expect(historyItems).toHaveLength(1);
    expect(historyItems[0].title).toBe('Page changed');
    expect(historyItems[0].category).toBe('view');
    expect(historyItems[0].severity).toBe('info');
  });

  it('records previousValue on CELL_CHANGED and supports undo/redo', async () => {
    const { createERPTable } = await import('../index');
    const repo = new MemoryTableRepository();
    const audit = new SilentAuditLogger();
    const remoteApi = {
      request: async () => null,
    } as any;

    const result = await createERPTable({
      store: 'store-undo',
      tableKey: 'table-undo',
      actor: { userId: 'user-1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo,
      audit,
      remoteApi,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [
        {
          id: 1,
          collection: 'default',
          values: { name: 'alpha' },
        },
      ],
    });

    await result.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: 'store-undo',
      tableKey: 'table-undo',
      rowId: 1,
      columnId: 'name',
      newValue: 'beta',
    });

    const history = result.controller.getHistoryItems({ type: 'CELL_CHANGED' });
    expect(history).toHaveLength(1);
    expect(history[0].description).toContain('from alpha');
    expect(history[0].description).toContain('to beta');

    const stored = await result.eventStore.read('table:table-undo');
    const cellEvent = stored.find((e) => e.type === 'CELL_CHANGED');
    expect((cellEvent?.payload as { previousValue: unknown }).previousValue).toBe('alpha');
    expect((cellEvent?.payload as { newValue: unknown }).newValue).toBe('beta');

    expect(result.controller.canUndo()).toBe(true);
    await result.controller.undo();
    expect(result.table.getRow(1)?.getCell('name')?.getValue()).toBe('alpha');
    expect(result.controller.canRedo()).toBe(true);

    await result.controller.redo();
    expect(result.table.getRow(1)?.getCell('name')?.getValue()).toBe('beta');
  });

  it('supports undo of ROW_ADDED via compensating delete', async () => {
    const { createERPTable } = await import('../index');
    const repo = new MemoryTableRepository();
    const audit = new SilentAuditLogger();
    const remoteApi = {
      request: async () => null,
    } as any;

    const result = await createERPTable({
      store: 'store-row-undo',
      tableKey: 'table-row-undo',
      actor: { userId: 'user-1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo,
      audit,
      remoteApi,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [
        {
          id: 1,
          collection: 'default',
          values: { name: 'seed' },
        },
      ],
    });

    const beforeCount = result.table.getRows().length;
    await result.engine.dispatch({
      type: 'ADD_EMPTY_ROW',
      store: 'store-row-undo',
      tableKey: 'table-row-undo',
      autoActivate: false,
    });

    expect(result.table.getRows().length).toBe(beforeCount + 1);
    expect(result.controller.canUndo()).toBe(true);

    const added = result.table
      .getRows()
      .find((r) => r.id.value !== 1);
    expect(added).toBeTruthy();

    await result.controller.undo();
    expect(result.table.getRow(added!.id.value)).toBeUndefined();
    expect(result.table.getRows().length).toBe(beforeCount);
  });

  it('paste goes through AppService with shared correlationId and undo', async () => {
    const { createERPTable } = await import('../index');
    const repo = new MemoryTableRepository();
    const audit = new SilentAuditLogger();
    const remoteApi = {
      request: async () => null,
    } as any;

    const result = await createERPTable({
      store: 'store-paste',
      tableKey: 'table-paste',
      actor: { userId: 'user-1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo,
      audit,
      remoteApi,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [
        {
          id: 1,
          collection: 'default',
          values: { name: 'alpha' },
        },
        {
          id: 2,
          collection: 'default',
          values: { name: 'beta' },
        },
      ],
    });

    await result.engine.dispatch({
      type: 'ROW_SELECTION_TOGGLED',
      tableKey: 'table-paste',
      rowId: 1,
    });
    await result.engine.dispatch({
      type: 'ROW_SELECTION_TOGGLED',
      tableKey: 'table-paste',
      rowId: 2,
    });
    await result.engine.dispatch({
      type: 'SET_TABLE_ACTION',
      store: 'store-paste',
      tableKey: 'table-paste',
      action: 'copy',
    });

    const beforeCount = result.table.getRows().length;
    await result.engine.dispatch({
      type: 'SET_TABLE_ACTION',
      store: 'store-paste',
      tableKey: 'table-paste',
      action: 'paste',
      correlationId: 'paste-unit-1',
    });

    expect(result.table.getRows().length).toBe(beforeCount + 2);
    expect(result.cellUndoStack.undoDepth()).toBe(1);

    const stored = await result.eventStore.read('table:table-paste');
    const pasteEvents = stored.filter((e) => e.type === 'ROW_ADDED');
    expect(pasteEvents.length).toBeGreaterThanOrEqual(2);
    expect(pasteEvents.every((e) => e.correlationId === 'paste-unit-1')).toBe(
      true,
    );

    await result.controller.undo();
    expect(result.table.getRows().length).toBe(beforeCount);
    expect(result.table.getRow(1)?.getCell('name')?.getValue()).toBe('alpha');
    expect(result.table.getRow(2)?.getCell('name')?.getValue()).toBe('beta');
  });

  it('cut+paste undo restores soft-deleted sources and removes clones', async () => {
    const { createERPTable } = await import('../index');
    const repo = new MemoryTableRepository();
    const audit = new SilentAuditLogger();
    const remoteApi = {
      request: async () => null,
    } as any;

    const result = await createERPTable({
      store: 'store-cut-paste',
      tableKey: 'table-cut-paste',
      actor: { userId: 'user-1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo,
      audit,
      remoteApi,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [
        {
          id: 1,
          collection: 'default',
          values: { name: 'alpha' },
        },
        {
          id: 2,
          collection: 'default',
          values: { name: 'beta' },
        },
      ],
    });

    await result.engine.dispatch({
      type: 'ROW_SELECTION_TOGGLED',
      tableKey: 'table-cut-paste',
      rowId: 1,
    });
    await result.engine.dispatch({
      type: 'SET_TABLE_ACTION',
      store: 'store-cut-paste',
      tableKey: 'table-cut-paste',
      action: 'cut',
    });
    await result.engine.dispatch({
      type: 'SET_TABLE_ACTION',
      store: 'store-cut-paste',
      tableKey: 'table-cut-paste',
      action: 'paste',
      correlationId: 'cut-paste-1',
    });

    expect(result.table.getRow(1)?.rowState.value).toBe(RowStateEnum.Deleted);
    const clones = result.table
      .getRows()
      .filter((r) => r.id.value !== 1 && r.rowState.value !== RowStateEnum.Deleted);
    expect(clones.length).toBeGreaterThanOrEqual(1);
    expect(result.cellUndoStack.undoDepth()).toBe(1);

    await result.controller.undo();

    expect(result.table.getRow(1)?.rowState.value).toBe(RowStateEnum.Unchanged);
    expect(result.table.getRow(1)?.getCell('name')?.getValue()).toBe('alpha');
    expect(
      result.table
        .getRows()
        .filter((r) => r.rowState.value !== RowStateEnum.Deleted),
    ).toHaveLength(2);
  });

  it('redo of ROW_ADDED restores the same rowId and cell snapshot', async () => {
    const { createERPTable } = await import('../index');
    const repo = new MemoryTableRepository();
    const audit = new SilentAuditLogger();
    const remoteApi = {
      request: async () => null,
    } as any;

    const result = await createERPTable({
      store: 'store-row-redo',
      tableKey: 'table-row-redo',
      actor: { userId: 'user-1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo,
      audit,
      remoteApi,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [
        {
          id: 1,
          collection: 'default',
          values: { name: 'seed' },
        },
      ],
    });

    await result.engine.dispatch({
      type: 'ADD_EMPTY_ROW',
      store: 'store-row-redo',
      tableKey: 'table-row-redo',
      autoActivate: false,
    });

    const added = result.table.getRows().find((r) => r.id.value !== 1)!;
    const addedId = added.id.value;
    await result.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: 'store-row-redo',
      tableKey: 'table-row-redo',
      rowId: addedId,
      columnId: 'name',
      newValue: 'edited-on-new-row',
    });

    // Undo cell edit + undo add (two units) — or we only care about row unit.
    // Stack top is CELL_CHANGED; undo that first, then ROW_ADDED.
    await result.controller.undo();
    expect(result.table.getRow(addedId)?.getCell('name')?.getValue()).not.toBe(
      'edited-on-new-row',
    );

    await result.controller.undo();
    expect(result.table.getRow(addedId)).toBeUndefined();
    expect(result.controller.canRedo()).toBe(true);

    await result.controller.redo();
    const restored = result.table.getRow(addedId);
    expect(restored).toBeTruthy();
    expect(restored!.id.value).toBe(addedId);
    expect(restored!.rowState.value).toBe(RowStateEnum.Added);
  });

  it('batches CELL_CHANGED with shared correlationId into one undo', async () => {
    const { createERPTable } = await import('../index');
    const repo = new MemoryTableRepository();
    const audit = new SilentAuditLogger();
    const remoteApi = {
      request: async () => null,
    } as any;

    const result = await createERPTable({
      store: 'store-batch-undo',
      tableKey: 'table-batch-undo',
      actor: { userId: 'user-1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo,
      audit,
      remoteApi,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
        {
          fieldName: 'code',
          fieldCaption: 'Code',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [
        {
          id: 1,
          collection: 'default',
          values: { name: 'alpha', code: 'A1' },
        },
      ],
    });

    const correlationId = 'paste-batch-1';
    await result.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: 'store-batch-undo',
      tableKey: 'table-batch-undo',
      rowId: 1,
      columnId: 'name',
      newValue: 'beta',
      correlationId,
    });
    await result.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: 'store-batch-undo',
      tableKey: 'table-batch-undo',
      rowId: 1,
      columnId: 'code',
      newValue: 'B2',
      correlationId,
    });

    expect(result.cellUndoStack.undoDepth()).toBe(1);
    expect(result.controller.canUndo()).toBe(true);

    await result.controller.undo();
    expect(result.table.getRow(1)?.getCell('name')?.getValue()).toBe('alpha');
    expect(result.table.getRow(1)?.getCell('code')?.getValue()).toBe('A1');
    expect(result.controller.canUndo()).toBe(false);
  });

  it('streams changelog updates through controller.subscribeChangelog', async () => {
    const repo = new MemoryTableRepository();
    const audit = new SilentAuditLogger();
    const remoteApi = {
      request: async () => null,
    } as any;

    const { createERPTable } = await import('../index');
    const result = await createERPTable({
      store: 'store-2',
      tableKey: 'table-2',
      actor: { userId: 'user-2', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo,
      audit,
      remoteApi,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [
        {
          id: 1,
          collection: 'default',
          values: { name: 'alpha' },
        },
      ],
    });

    const lengths: number[] = [];
    const unsubscribe = result.controller.subscribeChangelog(
      (entries) => lengths.push(entries.length),
      { type: 'PAGE_CHANGED' },
    );
    const historyLengths: number[] = [];
    const unsubscribeHistory = result.controller.subscribeHistoryItems(
      (items) => historyLengths.push(items.length),
      { type: 'PAGE_CHANGED' },
    );

    await result.engine.dispatch({
      type: 'CHANGE_PAGE',
      store: 'store-2',
      tableKey: 'table-2',
      page: 3,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    unsubscribe();
    unsubscribeHistory();

    expect(lengths).toEqual([0, 1]);
    expect(historyLengths).toEqual([0, 1]);
  });

  it('notifies engine subscribers on row selection even when the cell snapshot is unchanged', async () => {
    const { createERPTable } = await import('../index');
    const { structuralEqual } = await import('../../engine/equality');
    const repo = new MemoryTableRepository();
    const audit = new SilentAuditLogger();
    const remoteApi = {
      request: async () => null,
    } as any;

    const result = await createERPTable({
      store: 'store-row-select',
      tableKey: 'table-row-select',
      actor: { userId: 'user-1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo,
      audit,
      remoteApi,
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [
        {
          id: 1,
          collection: 'default',
          values: { name: 'alpha' },
        },
      ],
    });

    const snapshotBefore = result.controller.getSnapShot('active');
    const listener = vi.fn();
    const unsubscribe = result.controller.subscribe(listener);

    result.controller.onRowSelect(1);

    expect(result.controller.isSelectedRow(1)).toBe(true);
    expect(result.controller.getViewState()?.selectedRows[1]).toBe(true);
    expect(
      structuralEqual(snapshotBefore, result.controller.getSnapShot('active')),
    ).toBe(true);
    expect(listener).toHaveBeenCalled();
    unsubscribe?.();
  });

  it('derives pageSize from tableHeight / rowHeight (default 40)', async () => {
    const { createERPTable } = await import('../index');
    const columns = [
      {
        fieldName: 'name',
        fieldCaption: 'Name',
        fieldType: 'text' as const,
        fieldCollection: 'default',
        visibility: { kind: 'always' as const },
      },
    ];
    const rows = [{ id: 1, collection: 'default', values: { name: 'a' } }];
    const base = {
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      remoteApi: { request: async () => null } as any,
      columns,
      rows,
      tableHeight: 400,
    };

    const defaultHeight = await createERPTable({
      ...base,
      store: 'store-rh-40',
      tableKey: 'table-rh-40',
    });
    expect(defaultHeight.controller.getViewState()?.pagination.pageSize).toBe(10);

    const tall = await createERPTable({
      ...base,
      store: 'store-rh-50',
      tableKey: 'table-rh-50',
      rowHeight: 50,
    });
    expect(tall.controller.getViewState()?.pagination.pageSize).toBe(8);
  });

  it('defaults to NoopRemoteApi and does not fetch when remoteApi is omitted', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const { createERPTable } = await import('../index');
    const result = await createERPTable({
      store: 'store-noop-remote',
      tableKey: 'table-noop-remote',
      actor: { userId: 'u1', roles: ['admin'] },
      tableType: 'default',
      activeCollection: 'default',
      repo: new MemoryTableRepository(),
      audit: new SilentAuditLogger(),
      columns: [
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ],
      rows: [{ id: 1, collection: 'default', values: { name: 'a' } }],
    });

    const api = result.controller.getRemoteApi();
    expect(api).toBeInstanceOf(NoopRemoteApi);
    await expect(
      api!.request({ endpoint: '/api/erp/anything', params: { q: 1 } }),
    ).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
