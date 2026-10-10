// Memory Iron Rule probe for the page-window repositories (persistence 'paged-idb').
//
// Seeds 50,000 synthetic rows into a fake (cursor-based, in-memory) IndexedDB
// and proves heap stays O(batch): display = one page window, search streams
// bounded batches, add-row / bulk-delete never hydrate the dataset.
// Ported from the arianERP host table's _tests/memoryIronRule.test.ts.

import { describe, expect, it } from 'vitest';

import {
  AddEmptyRowCommand,
  DeleteRowsCommand,
} from '../../../../application/commands';
import {
  AddNewRowCommandHandler,
} from '../../../../application/handlers/rowCommandsHandler';
import { DeleteRowsCommandHandler } from '../../../../application/handlers/deleteRowsCommandHandler';
import { PagedCachedTableRepository as CachedTableRepository } from '../PagedCachedTableRepository';
import { PagedIndexedDbTableRepository as IndexedDbTableRepository } from '../PagedIndexedDbTableRepository';
import type { WindowedTableRepository as TableRepository } from '../../../../application/ports/TableRepository';
import { isInitiallyHidden } from '../../../../bootstrap/builders';
import { Row } from '../../../../domain/entities/Row';
import { Cell } from '../../../../domain/entities/Cell';
import {
  CellDisplay,
  CellValue,
  ColumnId,
  RowId,
  RowState,
  RowStateEnum,
} from '../../../../domain/value-objects';

import { fakeDb } from './fakeIndexedDb';

/* ── Microtest runner ─────────────────────────────────────────────────────── */

let passed = 0;
const failures: string[] = [];

function assert(cond: boolean, msg: string): void {
  if (cond) passed += 1;
  else failures.push(msg);
}
function assertEq<T>(actual: T, expected: T, msg: string): void {
  assert(actual === expected, `${msg} (expected ${String(expected)}, got ${String(actual)})`);
}

/* ── Batch accounting (heap-bound proxy for streaming paths) ──────────────── */

const BATCH_LIMIT = 500; // repo default batchSize
let maxBatchSeen = 0;

function instrumentStreaming(repo: CachedTableRepository): void {
  const orig = repo.iterateRowRecords.bind(repo);
  repo.iterateRowRecords = async (
    store: string,
    tableKey: string,
    scope: Parameters<TableRepository['iterateRowRecords']>[2],
    onBatch: Parameters<TableRepository['iterateRowRecords']>[3],
    batchSize?: number,
  ) => {
    return orig(store, tableKey, scope, async (records, base) => {
      if (records.length > maxBatchSeen) maxBatchSeen = records.length;
      return onBatch(records, base);
    }, batchSize);
  };
}

/* ── Seed 50,000 synthetic rows directly into the fake IDB ───────────────── */

const TOTAL_ROWS = 50_000;
const STORE = 'erpTestStore';
const TABLE_KEY = 'memIronRuleTable';

function seedRows(): void {
  const rowsName = `${STORE}__rows`;
  const rowStore = fakeDb.createObjectStore(rowsName);
  rowStore.createIndex('byTableCollectionSort', ['tableId', 'collection', 'sortIndex']);
  rowStore.createIndex('byTable', 'tableId');
  fakeDb.createObjectStore(STORE);

  for (let i = 1; i <= TOTAL_ROWS; i++) {
    rowStore.put({
      id: `${TABLE_KEY}::${i}`,
      tableId: TABLE_KEY,
      rowId: i,
      collection: 'default',
      sortIndex: i,
      rowState: 'None', // RowStateEnum.Unchanged
      visibilityCondition: {},
      isSaveDescription: false,
      cells: [
        { colId: 'index', value: i, originalValue: i, display: String(i) },
        { colId: 'name', value: `row-${i}`, originalValue: `row-${i}`, display: `row-${i}` },
        { colId: 'amount', value: 1, originalValue: 1, display: '1' },
      ],
    });
  }

  (fakeDb.stores.get(STORE) as FakeObjectStore).put({
    id: TABLE_KEY,
    kind: 'meta',
    activeCollection: 'default',
    page: 1,
    pageSize: 10,
    totalRows: TOTAL_ROWS,
    totalRowsByCollection: { default: TOTAL_ROWS },
    collections: [
      {
        name: 'default',
        // 'index' column is required so Table.addNewRow assigns nextIndex and
        // persists the row's index cell.
        columns: [
          {
            fieldName: 'index',
            fieldCaption: 'index',
            fieldType: 'number',
          },
        ],
      },
    ],
  });
}

/* ── Stubs for handler collaborators ─────────────────────────────────────── */

const auditStub = { log: (): void => undefined };
const permStub = {
  canAddRow: (): boolean => true,
  canDeleteRow: (): boolean => true,
};
const actor = {} as object;

/* ── Scenarios ───────────────────────────────────────────────────────────── */

async function scenarioDisplay(): Promise<void> {
  const repo = new CachedTableRepository();
  const table = await repo.getById(STORE, TABLE_KEY);
  const col = table.getCollections().get(table.getActiveCollectionName());
  assertEq(col ? col.getRows().size : -1, 10, 'display: getById RAM window = one page (10 rows)');

  const page2 = await repo.loadPage(STORE, TABLE_KEY, 2);
  const col2 = page2?.getCollections().get(page2.getActiveCollectionName());
  assertEq(col2 ? col2.getRows().size : -1, 10, 'display: loadPage(2) window = 10 rows');

  const page5000 = await repo.loadPage(STORE, TABLE_KEY, 5000);
  const colN = page5000?.getCollections().get(page5000.getActiveCollectionName());
  assertEq(colN ? colN.getRows().size : -1, 10, 'display: last full page window = 10 rows');

  // Sort order sanity: window rows must be the collection-sorted slice.
  const firstId = colN ? [...colN.getRows().keys()][0] : NaN;
  assertEq(firstId, 49991, 'display: page 5000 starts at row 49991 (index-ordered from IDB)');
}

async function scenarioSearch(): Promise<void> {
  const repo = new IndexedDbTableRepository();
  let yielded = 0;
  let maxBatch = 0;
  let matches = 0;
  await repo.iterateRowRecords(STORE, TABLE_KEY, 'active', async (records, _base) => {
    maxBatch = Math.max(maxBatch, records.length);
    yielded += records.length;
    for (const r of records) {
      const name = String((r.cells['name'] as { value: unknown } | undefined)?.value ?? '');
      if (name.includes('row-4999')) matches += 1;
    }
  });
  assertEq(yielded, TOTAL_ROWS, 'search: stream covers every row exactly once');
  assertEq(matches, 11, 'search: matches rows 4999,14999,...,44999 + row-49991..49999 = 11');
  assert(maxBatch <= BATCH_LIMIT, `search: max batch (${maxBatch}) ≤ batchSize (${BATCH_LIMIT})`);
}

async function scenarioAddRow(): Promise<void> {
  const cached = new CachedTableRepository();
  instrumentStreaming(cached);
  const handler = new AddNewRowCommandHandler(
    cached as unknown as TableRepository,
    auditStub as never,
    permStub as never,
  );

  const ev = await handler.execute(
    { store: STORE, tableKey: TABLE_KEY } as unknown as AddEmptyRowCommand,
    actor as never,
  );
  assert(!!ev, 'add: handler produced an event');

  const meta = (fakeDb.stores.get(STORE) as FakeObjectStore).records.get(
    JSON.stringify(TABLE_KEY),
  ) as Record<string, unknown>;
  assertEq(meta['totalRows'], TOTAL_ROWS + 1, 'add: meta totalRows bumped by exactly 1');

  // The handler's addNewRow picks a random rowId; locate the persisted new
  // record by its sort/index cell rather than a guessed id.
  const rowsStoreAdd = fakeDb.stores.get(`${STORE}__rows`) as FakeObjectStore;
  let addedRecord: Record<string, unknown> | undefined;
  for (const rec of rowsStoreAdd.records.values()) {
    const cells = rec['cells'] as Array<{ colId: string; value: unknown }>;
    const idxCell = cells?.find(c => c.colId === 'index');
    if (idxCell && Number(idxCell.value) === TOTAL_ROWS + 1) {
      addedRecord = rec;
      break;
    }
  }
  assert(!!addedRecord, 'add: new row record persisted with index = TOTAL_ROWS + 1');
  const addedState = addedRecord ? String(addedRecord['rowState']) : '';
  assert(
    addedState === 'Add' || addedState === 'None',
    `add: persisted new row carries Added/Unchanged state (got "${addedState}")`,
  );

  const lastPage = Math.ceil((TOTAL_ROWS + 1) / 10);
  const t = await cached.loadPage(STORE, TABLE_KEY, lastPage);
  const col = t?.getCollections().get(t.getActiveCollectionName());
  assertEq(col ? col.getRows().size : -1, 1, 'add: last page window holds exactly the new row');
  const winIdx = col ? [...col.getRows().values()][0]?.getCell('index')?.getValue() : undefined;
  assertEq(Number(winIdx), TOTAL_ROWS + 1, 'add: window row is the newly added one (index = 50001)');

  // nextIndex must equal max(index)+1 = TOTAL_ROWS+1 — computed via ONE
  // streamed pass; heap bound verified through the instrumented batches.
  assert(
    maxBatchSeen <= BATCH_LIMIT,
    `add: streamed index scan max batch (${maxBatchSeen}) ≤ batchSize (${BATCH_LIMIT})`,
  );
}

async function scenarioBulkDelete(): Promise<void> {
  maxBatchSeen = 0;
  const cached = new CachedTableRepository();
  instrumentStreaming(cached);
  const handler = new DeleteRowsCommandHandler(
    cached as unknown as TableRepository,
    auditStub as never,
    permStub as never,
  );

  const ids = Array.from({ length: 7500 }, (_, i) => i + 1);
  const res = (await handler.execute(
    { store: STORE, tableKey: TABLE_KEY, rowIds: ids } as unknown as DeleteRowsCommand,
    actor as never,
  )) as { removed: number; softDeleted: number; remaining: number } | null;

  assert(!!res, 'bulk delete: handler returned a result');
  assertEq(res ? res.softDeleted : -1, 7500, 'bulk delete: softDeleted = 7500 (all Unchanged)');
  assertEq(res ? res.removed : -1, 0, 'bulk delete: no hard removals (no Added in selection)');
  assertEq(
    res ? res.remaining : -1,
    TOTAL_ROWS + 1 - 7500,
    'bulk delete: remaining = total - deleted',
  );

  // Record-level verification directly in the fake IDB (sync map reads —
  // FakeRequest.result only fills in a microtask, so read the map directly).
  const rowsStore = fakeDb.stores.get(`${STORE}__rows`) as FakeObjectStore;
  // Record keys are collection-scoped (`table::collection::rowId`).
  const r1 = rowsStore.records.get(JSON.stringify(`${TABLE_KEY}::default::1`)) as
    | Record<string, unknown>
    | undefined;
  assert(!!r1, 'bulk delete: soft-deleted record still persisted (soft, not hard)');
  assertEq(r1 ? r1['rowState'] : '', 'Delete', 'bulk delete: record 1 rowState = Deleted');
  // The row added in the previous scenario has a random rowId — assert via
  // its index cell that it was NOT touched by the bulk delete.
  let untouchedNew: Record<string, unknown> | undefined;
  for (const rec of rowsStore.records.values()) {
    const cells = rec['cells'] as Array<{ colId: string; value: unknown }>;
    const idxCell = cells?.find(c => c.colId === 'index');
    if (idxCell && Number(idxCell.value) === TOTAL_ROWS + 1) {
      untouchedNew = rec;
      break;
    }
  }
  assertEq(untouchedNew ? untouchedNew['rowState'] : '', 'Add', 'bulk delete: untouched row keeps Added');
  const r2 = rowsStore.records.get(JSON.stringify(`${TABLE_KEY}::default::2`)) as
    | Record<string, unknown>
    | undefined;
  const c2 = r2 ? (r2['cells'] as Array<{ colId: string; value: unknown; originalValue: unknown }>) : [];
  const name2 = c2.find(c => c.colId === 'name');
  assert(
    !!name2 && name2.value === name2.originalValue,
    'bulk delete: change markers stripped (originalValue === value)',
  );

  const meta = (fakeDb.stores.get(STORE) as FakeObjectStore).records.get(
    JSON.stringify(TABLE_KEY),
  ) as Record<string, unknown>;
  assertEq(
    meta['totalRows'],
    TOTAL_ROWS + 1 - 7500,
    'bulk delete: meta totalRows updated in place (O(1) math, no scan)',
  );

  assert(
    maxBatchSeen <= BATCH_LIMIT,
    `bulk delete: validity stream max batch (${maxBatchSeen}) ≤ batchSize (${BATCH_LIMIT})`,
  );
}

/* ── Scenario 5: multi-collection seed with overlapping server PKs ────────── */
// Regression: row records were keyed `table::rowId`, so CashStatements and
// TankhahStatements sharing ids (21, 22, 23…) overwrote each other and
// per-collection counts got scrambled. Keys are now `table::collection::rowId`.

async function scenarioMultiCollectionKeys(): Promise<void> {
  const STORE_MC = 'erpTestMcStore';
  const TABLE_MC = 'mcTable';
  const rowsName = `${STORE_MC}__rows`;
  const rowStore = fakeDb.createObjectStore(rowsName);
  rowStore.createIndex('byTableCollectionSort', ['tableId', 'collection', 'sortIndex']);
  rowStore.createIndex('byTable', 'tableId');
  fakeDb.createObjectStore(STORE_MC);

  const putRow = (collection: string, rowId: number, price: number) => {
    rowStore.put({
      id: `${TABLE_MC}::${collection}::${rowId}`,
      tableId: TABLE_MC,
      rowId,
      collection,
      sortIndex: rowId,
      rowState: 'None',
      visibilityCondition: {},
      isSaveDescription: false,
      cells: [
        { colId: 'index', value: rowId, originalValue: rowId, display: String(rowId) },
        { colId: 'Price', value: price, originalValue: price, display: String(price) },
      ],
    });
  };
  // CashStatements ids 1..11 and TankhahStatements ids 1..12 — OVERLAPPING PKs.
  for (let i = 1; i <= 11; i++) putRow('CashStatements', i, i);
  for (let i = 1; i <= 12; i++) putRow('TankhahStatements', i, i * 10);

  (fakeDb.stores.get(STORE_MC) as FakeObjectStore).put({
    id: TABLE_MC,
    kind: 'meta',
    activeCollection: 'CashStatements',
    page: 1,
    pageSize: 10,
    totalRows: 11,
    totalRowsByCollection: { CashStatements: 11, TankhahStatements: 12 },
    recordKeyVersion: 2,
    collections: [
      { name: 'CashStatements', columns: [] },
      { name: 'TankhahStatements', columns: [] },
    ],
  });

  const repo = new IndexedDbTableRepository();

  // FIRST-RENDER pagination: even when meta.totalRows transiently holds a
  // grand total (11 + 12 = 23), the paginator must read the ACTIVE
  // collection's own count (11) — no collection switch required.
  const grandMeta = (fakeDb.stores.get(STORE_MC) as FakeObjectStore).records.get(
    JSON.stringify(TABLE_MC),
  ) as Record<string, unknown>;
  grandMeta['totalRows'] = 23; // simulate the old first-seed grand total
  const firstRender = await repo.loadPage(STORE_MC, TABLE_MC, 1);
  assertEq(
    firstRender?.getPagination().totalRows,
    11,
    'multi-coll: FIRST render pagination total = active collection count (11, not 23)',
  );
  assertEq(
    firstRender?.getPagination().totalPages,
    2,
    'multi-coll: FIRST render totalPages derived from 11 rows, not 23',
  );

  // Page 1 of CashStatements must show ONLY CashStatements rows (ids 1..10).
  const cash = await repo.loadPage(STORE_MC, TABLE_MC, 1);
  const cashRows = cash?.getRows() ?? [];
  assertEq(cashRows.length, 10, 'multi-coll: CashStatements page 1 shows 10 rows');
  const cashIds = new Set(cashRows.map(r => r.id.value));
  assertEq(cashIds.size, 10, 'multi-coll: no duplicate ids within the window');
  assert(
    cashRows.every(r => String(r.collection) === 'CashStatements'),
    'multi-coll: window holds ONLY CashStatements rows (no Tankhah leakage)',
  );

  // Switching to TankhahStatements shows its OWN rows, count intact.
  const tank = await repo.setActiveCollection(STORE_MC, TABLE_MC, 'TankhahStatements');
  const tankRows = tank?.getRows() ?? [];
  assertEq(tankRows.length, 10, 'multi-coll: TankhahStatements page 1 shows 10 rows');
  assert(
    tankRows.every(r => String(r.collection) === 'TankhahStatements'),
    'multi-coll: Tankhah window holds ONLY TankhahStatements rows',
  );
  const tankMeta = (fakeDb.stores.get(STORE_MC) as FakeObjectStore).records.get(
    JSON.stringify(TABLE_MC),
  ) as Record<string, unknown>;
  const counts = tankMeta['totalRowsByCollection'] as Record<string, number>;
  assertEq(counts['CashStatements'], 11, 'multi-coll: CashStatements count stays 11 after switch');
  assertEq(counts['TankhahStatements'], 12, 'multi-coll: TankhahStatements count stays 12 after switch');
  assertEq(tankMeta['totalRows'], 12, 'multi-coll: totalRows follows the ACTIVE collection (12)');

  // Streaming per collection also stays isolated.
  let tankSeen = 0;
  await repo.iterateRowRecords(STORE_MC, TABLE_MC, ['TankhahStatements'], async records => {
    tankSeen += records.length;
    assert(
      records.every(r => r.collection === 'TankhahStatements'),
      'multi-coll: stream yields only TankhahStatements records',
    );
  });
  assertEq(tankSeen, 12, 'multi-coll: stream covers exactly the 12 Tankhah rows');
}

/* ── Scenario 6: value-bearing dependent columns visible at init ─────────── */
// Regression 1: isInitiallyHidden only applied the "column already holds data →
// show it" rule when activeCollection === 'default' — dependent columns that
// arrived WITH data on multi-collection pages stayed hidden.
// Regression 2: the fix must scope the value scan to the column's OWN
// collection (fieldCollection) — a value in one tab must NOT unhide the
// same-named column in other tabs.

function scenarioDependentColumnsVisibleAtInit(): void {
  const makeRow = (
    rowId: number,
    values: Record<string, unknown>,
    collection: string,
  ): Row => {
    const cells = new Map<string, Cell>();
    for (const [field, value] of Object.entries(values)) {
      cells.set(
        field,
        new Cell(
          new RowId(rowId),
          new ColumnId(field),
          new CellValue(value),
          new CellValue(value),
          new CellDisplay(value),
        ),
      );
    }
    return new Row(
      new RowId(rowId),
      cells,
      new RowState(RowStateEnum.Unchanged),
      new Set(),
      {},
      collection,
      false,
    );
  };

  // Dependent column BELONGING to CashStatements (fieldCollection set).
  const cashDependent: Parameters<typeof isInitiallyHidden>[0] = {
    fieldName: 'Description',
    fieldCaption: 'Description',
    fieldType: 'text',
    fieldCollection: 'CashStatements',
    visibility: { kind: 'whenFieldTruthy', fieldName: 'Amount' },
  };
  // Same column shape but EMPTY — must stay hidden even in its own collection.
  const cashDependentEmpty: Parameters<typeof isInitiallyHidden>[0] = {
    fieldName: 'Note',
    fieldCaption: 'Note',
    fieldType: 'text',
    fieldCollection: 'CashStatements',
    visibility: { kind: 'whenFieldTruthy', fieldName: 'Amount' },
  };

  // Domain rows: CashStatements rows HOLD Description data; Tankhah rows do
  // not. Both collections coexist in the same init payload.
  const domainRows: Row[] = [
    makeRow(1, { Amount: 100, Description: 'desc-1', Note: null }, 'CashStatements'),
    makeRow(2, { Amount: 200, Description: null, Note: null }, 'TankhahStatements'),
  ];
  // Plain input rows (server payload shape) with the same split.
  const inputRows: Parameters<typeof isInitiallyHidden>[1] = [
    { id: 1, collection: 'CashStatements', values: { Amount: 100, Description: 'srv-desc' } },
    { id: 2, collection: 'TankhahStatements', values: { Amount: 200 } },
  ];

  // Own collection: value-bearing dependent column becomes VISIBLE at init.
  assert(
    isInitiallyHidden(cashDependent, domainRows, 'CashStatements') === false,
    'init-visibility: value-bearing dependent column VISIBLE in its OWN collection (domain rows)',
  );
  assert(
    isInitiallyHidden(cashDependent, inputRows, 'CashStatements') === false,
    'init-visibility: value-bearing dependent column VISIBLE in its OWN collection (input rows)',
  );
  // No cross-collection leak: the Tankhah-scoped TWIN of the same column
  // (same fieldName, fieldCollection = TankhahStatements) must stay hidden —
  // its OWN rows hold no Description, so Cash data must not unhide it.
  const tankDependent: Parameters<typeof isInitiallyHidden>[0] = {
    ...cashDependent,
    fieldCollection: 'TankhahStatements',
  };
  assert(
    isInitiallyHidden(tankDependent, domainRows, 'CashStatements') === true,
    'init-visibility: NO cross-collection leak — Tankhah twin stays hidden (domain rows)',
  );
  assert(
    isInitiallyHidden(tankDependent, inputRows, 'CashStatements') === true,
    'init-visibility: NO cross-collection leak — Tankhah twin stays hidden (input rows)',
  );
  // Empty column stays hidden even in its own collection.
  assert(
    isInitiallyHidden(cashDependentEmpty, domainRows, 'CashStatements') === true,
    'init-visibility: empty dependent column stays hidden in its OWN collection (domain rows)',
  );
  assert(
    isInitiallyHidden(cashDependentEmpty, inputRows, 'CashStatements') === true,
    'init-visibility: empty dependent column stays hidden in its OWN collection (input rows)',
  );

  // No fieldCollection: column falls back to the ACTIVE collection scope.
  const unscoped: Parameters<typeof isInitiallyHidden>[0] = {
    ...cashDependent,
    fieldCollection: undefined,
  };
  assert(
    isInitiallyHidden(unscoped, inputRows, 'CashStatements') === false,
    'init-visibility: unscoped column resolves to the ACTIVE collection (visible)',
  );
  assert(
    isInitiallyHidden(unscoped, inputRows, 'TankhahStatements') === true,
    'init-visibility: unscoped column resolves to the ACTIVE collection (hidden elsewhere)',
  );

  // 'default' keeps the old behaviour (regression guard): an UNSCOPED column
  // evaluates against the 'default' rows only — none here, so hidden.
  assert(
    isInitiallyHidden(unscoped, inputRows, 'default') === true,
    'init-visibility: default scope only shows the column if default rows hold data',
  );
  // 'always' / 'never' rules are unaffected.
  assert(
    isInitiallyHidden(
      { ...cashDependent, visibility: { kind: 'always' } },
      inputRows,
      'TankhahStatements',
    ) === false,
    'init-visibility: "always" rule unchanged',
  );
  assert(
    isInitiallyHidden(
      { ...cashDependent, visibility: { kind: 'never' } },
      inputRows,
      'CashStatements',
    ) === true,
    'init-visibility: "never" rule unchanged',
  );

  // ── whenRemoteFlag regression (edit-open in TafsiliStatements) ─────────
  // FifthId/SixthId/SeventhId-like column: visibility depends on a REMOTE
  // flag (resolveOn via RpWayId). At edit-open no remote call has run, so
  // the only evidence available is the cell's own value — a value-bearing
  // whenRemoteFlag column must be VISIBLE in its OWN collection.
  const remoteFlagDependent: Parameters<typeof isInitiallyHidden>[0] = {
    fieldName: 'FifthId',
    fieldCaption: 'سطح پنجم',
    fieldType: 'selectOption',
    fieldCollection: 'TafsiliStatements',
    visibility: {
      kind: 'whenRemoteFlag',
      sourceFieldName: 'RpWayId',
      flag: 'FifthId',
    },
  };
  const remoteFlagTwin: Parameters<typeof isInitiallyHidden>[0] = {
    ...remoteFlagDependent,
    fieldCollection: 'CashStatements',
  };
  const remoteFlagRows: Row[] = [
    makeRow(10, { RpWayId: 36, FifthId: 1757, SixthId: null }, 'TafsiliStatements'),
    makeRow(11, { RpWayId: 35 }, 'CashStatements'),
  ];
  const remoteFlagInputs: Parameters<typeof isInitiallyHidden>[1] = [
    { id: 10, collection: 'TafsiliStatements', values: { RpWayId: 36, FifthId: 1757 } },
    { id: 11, collection: 'CashStatements', values: { RpWayId: 35 } },
  ];
  assert(
    isInitiallyHidden(remoteFlagDependent, remoteFlagRows, 'CashStatements') === false,
    'init-visibility: whenRemoteFlag column WITH value VISIBLE in its OWN collection (domain rows)',
  );
  assert(
    isInitiallyHidden(remoteFlagDependent, remoteFlagInputs, 'CashStatements') === false,
    'init-visibility: whenRemoteFlag column WITH value VISIBLE in its OWN collection (input rows)',
  );
  assert(
    isInitiallyHidden(remoteFlagTwin, remoteFlagRows, 'TafsiliStatements') === true,
    'init-visibility: NO cross-collection leak — whenRemoteFlag twin stays hidden (domain rows)',
  );
  assert(
    isInitiallyHidden(remoteFlagTwin, remoteFlagInputs, 'TafsiliStatements') === true,
    'init-visibility: NO cross-collection leak — whenRemoteFlag twin stays hidden (input rows)',
  );
  // No value in own collection → still hidden (flag-less path keeps default).
  const remoteFlagEmpty: Parameters<typeof isInitiallyHidden>[0] = {
    ...remoteFlagDependent,
    fieldName: 'SixthId',
    visibility: { ...remoteFlagDependent.visibility, flag: 'SixthId' } as never,
  };
  assert(
    isInitiallyHidden(remoteFlagEmpty, remoteFlagRows, 'CashStatements') === true,
    'init-visibility: whenRemoteFlag column WITHOUT value stays hidden (domain rows)',
  );
  assert(
    isInitiallyHidden(remoteFlagEmpty, remoteFlagInputs, 'CashStatements') === true,
    'init-visibility: whenRemoteFlag column WITHOUT value stays hidden (input rows)',
  );
}

/* ── Run ─────────────────────────────────────────────────────────────── */

describe('Memory Iron Rule (paged-idb repositories)', () => {
  it(`keeps heap O(batch) with ${TOTAL_ROWS} rows`, async () => {
    seedRows();

    await scenarioDisplay();
    await scenarioSearch();
    await scenarioAddRow();
    await scenarioBulkDelete();
    await scenarioMultiCollectionKeys();
    scenarioDependentColumnsVisibleAtInit();

    expect(failures).toEqual([]);
    expect(passed).toBeGreaterThan(0);
  }, 120_000);
});
