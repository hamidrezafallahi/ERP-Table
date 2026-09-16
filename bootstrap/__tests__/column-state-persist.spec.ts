import { afterEach, describe, expect, it } from 'vitest';

import { createGrid } from '../index';
import { InMemoryEventStore } from '../../infrastructure/eventStore/InMemoryEventStore';
import {
  columnStateStorageKey,
  serializeColumnState,
} from '../../engine/dataOps/columnState';
import {
  loadColumnStateFromStorage,
  saveColumnStateToStorage,
} from '../../infrastructure/ui/columnStatePersist';

type Row = { id: string; name: string; amount: number };

const memory = new Map<string, string>();
let localStorageInstalled = false;

function installMemoryLocalStorage(): void {
  if (localStorageInstalled) return;
  localStorageInstalled = true;
  const store = {
    getItem(key: string) {
      return memory.has(key) ? memory.get(key)! : null;
    },
    setItem(key: string, value: string) {
      memory.set(key, String(value));
    },
    removeItem(key: string) {
      memory.delete(key);
    },
    clear() {
      memory.clear();
    },
    key() {
      return null;
    },
    get length() {
      return memory.size;
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: store,
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  memory.clear();
});

async function boot(stateKey?: string, eventStore?: InMemoryEventStore) {
  installMemoryLocalStorage();
  const grid = createGrid<Row>({
    stateKey,
    eventStore,
    columnDefs: [
      { field: 'name', headerName: 'Name', type: 'text' },
      { field: 'amount', headerName: 'Amount', type: 'number' },
    ],
    rowData: [
      { id: '1', name: 'alpha', amount: 10 },
      { id: '2', name: 'beta', amount: 20 },
    ],
    getRowId: (row) => row.id,
  });
  await grid.ready;
  return grid;
}

describe('PR-115 columnState persist', () => {
  it('getColumnState includes pin and sort', async () => {
    const grid = await boot();
    await grid.api.applyColumnState([
      {
        colId: 'name',
        width: 180,
        hide: false,
        order: 0,
        pinned: 'start',
        sort: 'asc',
        sortIndex: 0,
      },
      {
        colId: 'amount',
        width: 100,
        hide: false,
        order: 1,
        pinned: null,
        sort: null,
        sortIndex: null,
      },
    ]);
    const name = grid.api.getColumnState().find((c) => c.colId === 'name');
    expect(name?.pinned).toBe('start');
    expect(name?.sort).toBe('asc');
    expect(name?.width).toBe(180);
    expect(grid.api.getSortModel()).toEqual([{ colId: 'name', sort: 'asc' }]);
  });

  it('resize + reorder + reload restores layout via stateKey', async () => {
    const stateKey = 'pr115-invoice';
    const first = await boot(stateKey);
    await first.api.applyColumnState([
      { colId: 'amount', width: 260, hide: false, order: 0 },
      { colId: 'name', width: 140, hide: true, order: 1, pinned: 'end' },
    ]);
    await new Promise((r) => setTimeout(r, 250));
    expect(
      loadColumnStateFromStorage(stateKey)?.find((c) => c.colId === 'amount')
        ?.width,
    ).toBe(260);

    const second = await boot(stateKey);
    const state = second.api.getColumnState();
    expect(state.find((c) => c.colId === 'amount')?.width).toBe(260);
    expect(state.find((c) => c.colId === 'name')?.hide).toBe(true);
    expect(state.find((c) => c.colId === 'name')?.pinned).toBe('end');
    const movable = state
      .filter((c) => c.colId !== 'index')
      .map((c) => c.colId);
    expect(movable).toEqual(['amount', 'name']);
  });

  it('emits COLUMN_STATE_CHANGED on EventStore after layout change', async () => {
    const eventStore = new InMemoryEventStore();
    const stateKey = 'pr115-events';
    const grid = await boot(stateKey, eventStore);
    await grid.api.applyColumnState([
      { colId: 'name', width: 200, hide: false, order: 0 },
      { colId: 'amount', width: 90, hide: false, order: 1 },
    ]);
    // Wait for debounce flush
    await new Promise((r) => setTimeout(r, 250));
    const events = await eventStore.read(`table:${grid.tableKey}`);
    const changed = events.filter((e) => e.type === 'COLUMN_STATE_CHANGED');
    expect(changed.length).toBeGreaterThanOrEqual(1);
    const payload = changed[changed.length - 1]!.payload as {
      columns: { colId: string; width: number }[];
    };
    expect(payload.columns.find((c) => c.colId === 'name')?.width).toBe(200);
  });

  it('storage helpers use namespaced key', () => {
    installMemoryLocalStorage();
    const key = 'demo';
    saveColumnStateToStorage(key, [
      { colId: 'a', width: 1, hide: false, order: 0 },
    ]);
    expect(memory.get(columnStateStorageKey(key))).toBe(
      serializeColumnState([
        { colId: 'a', width: 1, hide: false, order: 0 },
      ]),
    );
  });
});
