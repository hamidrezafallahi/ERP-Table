// adapters/infra/indexedDbTableRepository.ts

import { WindowedTableRepository } from '../../../application/ports/TableRepository';
import { ColumnSchema } from '../../../domain/types/ColumnSchema';
import { Cell } from '../../../domain/entities/Cell';
import { Collection } from '../../../domain/entities/Collection';
import { Row } from '../../../domain/entities/Row';
import { CollectionScope, Table } from '../../../domain/entities/Table';
import {
  CellValue,
  ColumnId,
  Pagination,
  RowId,
  RowState,
  RowStateEnum,
} from '../../../domain/value-objects';

// ─── Serialization ────────────────────────────────────────────────────────────

interface SerializedCell {
  colId: string;
  value: unknown;
  originalValue: unknown;
  display: unknown;
}

interface SerializedRowRecord {
  id: string;
  tableId: string;
  rowId: number;
  collection: string;
  sortIndex: number;
  rowState: RowStateEnum;
  visibilityCondition: Record<string, boolean>;
  isSaveDescription: boolean;
  cells: SerializedCell[];
}

/** Plain column fields only — IndexedDB cannot clone functions. */
type PersistedColumnSchema = {
  fieldName: string;
  fieldCaption: string;
  fieldType: ColumnSchema['fieldType'];
  fieldCollection?: string;
  order?: number;
  editable?: boolean;
  isUnique?: boolean;
  noCache?: boolean;
  expandable?: boolean;
  enableDeleteButton?: boolean;
  enableExpandButton?: boolean;
  enableMoveButton?: boolean;
  enableOptionsButton?: boolean;
  disable?: boolean;
  hidden?: boolean;
  className?: string;
  visibility: ColumnSchema['visibility'];
  selectOptions?: { label: string; value: string | number }[];
  minWidth?: number;
  style?: ColumnSchema['style'];
  popUpWidth?: number;
  labelValue?: ColumnSchema['labelValue'];
};

interface SerializedCollectionMeta {
  name: string;
  columns: PersistedColumnSchema[];
}

interface SerializedTableMeta {
  id: string;
  kind: 'meta';
  activeCollection: string;
  page: number;
  pageSize: number;
  /** Total rows of the ACTIVE collection (drives pagination). */
  totalRows: number;
  /** Exact row count per collection name — lets each collection keep its own pagination. */
  totalRowsByCollection?: Record<string, number>;
  /** 2 = row record keys are collection-scoped (table::collection::rowId). */
  recordKeyVersion?: number;
  collections: SerializedCollectionMeta[];
}

/** Legacy blob format (pre page-window) — migrated on read. */
interface LegacySerializedTable {
  id: string;
  pages?: string[];
  collections: Array<{
    name?: string;
    type?: string;
    rows: Array<{
      rowId: number;
      cells: SerializedCell[];
      rowState: RowStateEnum;
      visibilityCondition: Record<string, boolean>;
      collection?: string;
      rowType?: string;
      isSaveDescription: boolean;
    }>;
  }>;
  activeCollection?: string;
  activeDetailType?: string;
}

const DB_NAME = 'ERP_TABLE_DB';

/**
 * Row record key is COLLECTION-SCOPED: different collections legitimately hold
 * rows with the same server PK (e.g. CashStatementId 21 vs TankhahStatementId
 * 21). A bare `table::rowId` key made them overwrite each other in IndexedDB.
 */
function rowRecordId(tableId: string, collection: string, rowId: number): string {
  return `${tableId}::${collection}::${rowId}`;
}

function sortIndexOf(row: Row): number {
  const raw = row.getCell('index')?.getValue();
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** IndexedDB rejects undefined/null/NaN/Infinity/objects as keys. */
function isValidIdbKey(value: unknown): value is IDBValidKey {
  if (typeof value === 'string') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (Array.isArray(value)) return value.length > 0 && value.every(isValidIdbKey);
  if (value instanceof ArrayBuffer) return true;
  if (ArrayBuffer.isView(value)) return true;
  return false;
}

function asTableIdKey(tableId: unknown): string | null {
  if (typeof tableId === 'string' && tableId.length > 0) return tableId;
  if (typeof tableId === 'number' && Number.isFinite(tableId)) return String(tableId);
  return null;
}

export class PagedIndexedDbTableRepository implements WindowedTableRepository {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDb();
  }

  private bindDb(db: IDBDatabase): IDBDatabase {
    db.onversionchange = () => {
      db.close();
      console.warn('DB version changed, connection closed');
      // Next getDb() must reopen at the new version
      this.dbPromise = this.initDb();
    };
    return db;
  }

  /**
   * Open at the *existing* DB version (no fixed version number).
   * ensureStores() bumps version only when new object stores are needed.
   * A fixed open(version) would throw VersionError after lazy upgrades.
   */
  private initDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME);
      request.onsuccess = () => resolve(this.bindDb(request.result));
      request.onerror = () => reject(request.error);
    });
  }

  private async getDb(): Promise<IDBDatabase> {
    return this.dbPromise;
  }

  private metaStore(storeName: string): string {
    return storeName;
  }

  private rowsStore(storeName: string): string {
    return `${storeName}__rows`;
  }

  private async ensureStores(db: IDBDatabase, storeName: string): Promise<IDBDatabase> {
    const meta = this.metaStore(storeName);
    const rows = this.rowsStore(storeName);
    if (db.objectStoreNames.contains(meta) && db.objectStoreNames.contains(rows)) {
      return db;
    }

    const nextVersion = db.version + 1;
    db.close();
    const newDb = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, nextVersion);
      req.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const upgraded = (event.target as IDBOpenDBRequest).result;
        if (!upgraded.objectStoreNames.contains(meta)) {
          upgraded.createObjectStore(meta, { keyPath: 'id' });
        }
        if (!upgraded.objectStoreNames.contains(rows)) {
          const rowStore = upgraded.createObjectStore(rows, { keyPath: 'id' });
          rowStore.createIndex('byTableCollectionSort', ['tableId', 'collection', 'sortIndex'], {
            unique: false,
          });
          rowStore.createIndex('byTable', 'tableId', { unique: false });
        }
      };
      req.onsuccess = () => resolve(this.bindDb(req.result));
      req.onerror = () => reject(req.error);
    });

    this.dbPromise = Promise.resolve(newDb);
    return newDb;
  }

  // ─── Row (de)serialization ──────────────────────────────────────────────────

  private serializeRow(tableId: string, row: Row): SerializedRowRecord {
    return {
      id: rowRecordId(tableId, row.collection, row.id.value),
      tableId,
      rowId: row.id.value,
      collection: row.collection,
      sortIndex: sortIndexOf(row),
      rowState: row.rowState.value,
      visibilityCondition: row.visibilityCondition,
      isSaveDescription: row.isSaveDescription,
      cells: Array.from(row.getCells().entries()).map(([colId, cell]) => ({
        colId,
        value: cell.getValue(),
        originalValue: cell.getOriginalValue().value,
        display: cell.getDisplay(),
      })),
    };
  }

  private deserializeRow(r: SerializedRowRecord): Row {
    const cells = new Map<string, Cell>();
    r.cells.forEach(c => {
      cells.set(
        c.colId,
        new Cell(
          new RowId(r.rowId),
          new ColumnId(c.colId),
          new CellValue(c.value),
          new CellValue(c.originalValue),
          new CellValue(c.display),
        ),
      );
    });

    const changeFields = new Set<string>();
    if (r.rowState === RowStateEnum.Modified) {
      r.cells.forEach(c => {
        if (c.value !== c.originalValue) changeFields.add(c.colId);
      });
    }

    return new Row(
      new RowId(r.rowId),
      cells,
      new RowState(r.rowState),
      changeFields,
      r.visibilityCondition,
      r.collection,
      r.isSaveDescription,
    );
  }

  private serializeColumn(col: ColumnSchema): PersistedColumnSchema {
    return {
      fieldName: col.fieldName,
      fieldCaption: col.fieldCaption,
      fieldType: col.fieldType,
      fieldCollection: col.fieldCollection,
      order: col.order,
      editable: col.editable,
      isUnique: col.isUnique,
      noCache: col.noCache,
      expandable: col.expandable,
      enableDeleteButton: col.enableDeleteButton,
      enableExpandButton: col.enableExpandButton,
      enableMoveButton: col.enableMoveButton,
      enableOptionsButton: col.enableOptionsButton,
      disable: col.disable,
      hidden: col.hidden,
      className: col.className,
      visibility: col.visibility,
      selectOptions: col.selectOptions,
      minWidth: col.minWidth,
      style: col.style,
      popUpWidth: col.popUpWidth,
      labelValue: col.labelValue,
    };
  }

  private buildMetaFromTable(
    table: Table,
    totalRowsOverride?: number,
    existing?: SerializedTableMeta | null,
  ): SerializedTableMeta {
    const id = asTableIdKey(table.id);
    if (!id) {
      throw new Error(`[PagedIndexedDbTableRepository] Cannot persist meta: invalid table.id (${String(table.id)})`);
    }

    const pagination = table.getPagination();
    const active = table.getActiveCollectionName() || 'default';
    const collections: SerializedCollectionMeta[] = [];
    for (const [name, col] of table.getCollections()) {
      collections.push({
        name,
        columns: Array.from(col.getColumns().values()).map(c => this.serializeColumn(c)),
      });
    }

    // Per-collection counts from the RAM window. The window only holds the
    // ACTIVE collection's page; other collections' Maps are empty here.
    // Only the ACTIVE count may be overwritten — a zero window count of an
    // inactive collection must never clobber its persisted total.
    const windowCounts: Record<string, number> = {};
    let counted = 0;
    let otherCollectionsHaveRows = false;
    for (const [name, col] of table.getCollections()) {
      const size = col.getRows().size;
      if (name === active) windowCounts[name] = size;
      else if (size > 0) otherCollectionsHaveRows = true;
      counted += size;
    }

    // Multi-collection FULL SEED (initial replaceAll): every collection Map
    // holds ALL its rows, so the ACTIVE collection's pagination total must be
    // ITS OWN count — never the grand total across collections. A page window
    // (save path) holds no rows of other collections and keeps the
    // override/Math.max behaviour below.
    const isFullMultiCollectionSeed = otherCollectionsHaveRows;
    const totalRows = isFullMultiCollectionSeed
      ? (windowCounts[active] ?? 0)
      : totalRowsOverride ?? Math.max(pagination.totalRows, counted);

    const totalRowsByCollection: Record<string, number> = {
      ...(existing?.totalRowsByCollection ?? {}),
      ...windowCounts,
      [active]: totalRows,
    };

    if (isFullMultiCollectionSeed) {
      // Full seed: every collection Map is complete — per-collection totals
      // are exact counts of their own Maps.
      for (const [name, col] of table.getCollections()) {
        totalRowsByCollection[name] = col.getRows().size;
      }
    }

    return {
      id,
      kind: 'meta',
      activeCollection: active,
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 10,
      totalRows,
      totalRowsByCollection,
      collections,
    };
  }

  private buildTableFromPage(
    meta: SerializedTableMeta,
    pageRows: Row[],
    page: number,
    pageSize: number,
  ): Table {
    const collectionMap = new Map<string, Collection>();
    const active = meta.activeCollection || 'default';

    for (const colMeta of meta.collections ?? []) {
      const colMap = new Map<string, ColumnSchema>();
      for (const c of colMeta.columns ?? []) {
        // Persisted columns are plain data; live handlers are reattached from config/RAM
        colMap.set(c.fieldName, c as ColumnSchema);
      }
      collectionMap.set(colMeta.name, new Collection(colMeta.name, new Map(), colMap));
    }

    if (!collectionMap.has(active)) {
      collectionMap.set(active, new Collection(active, new Map(), new Map()));
    }

    for (const row of pageRows) {
      const name = row.collection || active;
      let collection = collectionMap.get(name);
      if (!collection) {
        collection = new Collection(name, new Map(), new Map());
        collectionMap.set(name, collection);
      }
      collection.getRows().set(row.id.value, row);
    }

    // Pagination total = ACTIVE collection's own count. meta.totalRows may
    // transiently hold a grand total after a full multi-collection seed —
    // reading it directly made the FIRST render's paginator show every
    // collection's rows summed together.
    const total = meta.totalRowsByCollection?.[active] ?? meta.totalRows;
    return new Table(
      meta.id,
      collectionMap,
      new Pagination(page, pageSize, total),
      null,
      active,
    );
  }

  private async readMeta(
    db: IDBDatabase,
    storeName: string,
    tableId: string,
  ): Promise<SerializedTableMeta | LegacySerializedTable | null> {
    const key = asTableIdKey(tableId);
    if (!key) return null;

    const metaName = this.metaStore(storeName);
    if (!db.objectStoreNames.contains(metaName)) return null;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(metaName, 'readonly');
      const req = tx.objectStore(metaName).get(key);
      req.onsuccess = () => resolve((req.result as SerializedTableMeta | LegacySerializedTable) ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  private isLegacy(data: SerializedTableMeta | LegacySerializedTable): data is LegacySerializedTable {
    return !('kind' in data) || (data as SerializedTableMeta).kind !== 'meta';
  }

  private async migrateLegacy(
    db: IDBDatabase,
    storeName: string,
    legacy: LegacySerializedTable,
  ): Promise<SerializedTableMeta> {
    const active = legacy.activeCollection ?? legacy.activeDetailType ?? 'default';
    const allRows: Row[] = [];
    const collections: SerializedCollectionMeta[] = [];

    for (const c of legacy.collections ?? []) {
      const name = c.name ?? c.type ?? active;
      collections.push({ name, columns: [] });
      for (const r of c.rows ?? []) {
        allRows.push(
          this.deserializeRow({
            id: rowRecordId(legacy.id, r.collection ?? r.rowType ?? name, r.rowId),
            tableId: legacy.id,
            rowId: r.rowId,
            collection: r.collection ?? r.rowType ?? name,
            sortIndex: 0,
            rowState: r.rowState,
            visibilityCondition: r.visibilityCondition,
            isSaveDescription: r.isSaveDescription,
            cells: r.cells,
          }),
        );
      }
    }

    // Fix sortIndex from cell values after deserialize
    for (const row of allRows) {
      // already in row via cells
    }

    const meta: SerializedTableMeta = {
      id: legacy.id,
      kind: 'meta',
      activeCollection: active,
      page: 1,
      pageSize: 10,
      totalRows: allRows.length,
      collections,
    };

    db = await this.ensureStores(db, storeName);
    await this.putMeta(db, storeName, meta);
    await this.putRows(db, storeName, legacy.id, allRows);
    return meta;
  }

  private putMeta(db: IDBDatabase, storeName: string, meta: SerializedTableMeta): Promise<void> {
    const id = asTableIdKey(meta.id);
    if (!id) {
      console.warn('[PagedIndexedDbTableRepository] putMeta skipped: invalid id', meta?.id);
      return Promise.resolve();
    }

    // JSON round-trip strips functions; re-assert id because undefined keys are dropped
    let cloneable: SerializedTableMeta;
    try {
      cloneable = JSON.parse(JSON.stringify({ ...meta, id })) as SerializedTableMeta;
    } catch (e) {
      console.warn('[PagedIndexedDbTableRepository] putMeta skipped: not serializable', e);
      return Promise.resolve();
    }
    cloneable.id = id;

    if (!isValidIdbKey(cloneable.id)) {
      console.warn('[PagedIndexedDbTableRepository] putMeta skipped: id not a valid IDB key', cloneable.id);
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.metaStore(storeName), 'readwrite');
      tx.objectStore(this.metaStore(storeName)).put(cloneable);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private putRows(
    db: IDBDatabase,
    storeName: string,
    tableId: string,
    rows: Row[],
  ): Promise<void> {
    const key = asTableIdKey(tableId);
    if (!key) {
      console.warn('[PagedIndexedDbTableRepository] putRows skipped: invalid tableId', tableId);
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.rowsStore(storeName), 'readwrite');
      const os = tx.objectStore(this.rowsStore(storeName));
      for (const row of rows) {
        const record = this.serializeRow(key, row);
        if (!isValidIdbKey(record.id)) continue;
        // Ensure plain cloneable payload
        const cloneable = JSON.parse(JSON.stringify(record)) as SerializedRowRecord;
        cloneable.id = record.id;
        cloneable.tableId = key;
        os.put(cloneable);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /** Put already-serialized row records directly (no domain Row round-trip). */
  private putRowRecords(
    db: IDBDatabase,
    storeName: string,
    records: SerializedRowRecord[],
  ): Promise<void> {
    if (records.length === 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.rowsStore(storeName), 'readwrite');
      const os = tx.objectStore(this.rowsStore(storeName));
      for (const record of records) {
        if (!isValidIdbKey(record.id)) continue;
        os.put(JSON.parse(JSON.stringify(record)) as SerializedRowRecord);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private async deleteAllRowsForTable(
    db: IDBDatabase,
    storeName: string,
    tableId: string,
  ): Promise<void> {
    const key = asTableIdKey(tableId);
    if (!key) {
      console.warn('[PagedIndexedDbTableRepository] deleteAllRows skipped: invalid tableId', tableId);
      return;
    }

    const rowsName = this.rowsStore(storeName);
    if (!db.objectStoreNames.contains(rowsName)) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(rowsName, 'readwrite');
      const store = tx.objectStore(rowsName);

      // Prefer index; fall back to full scan if index/key range fails
      const runFullScan = () => {
        const req = store.openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if (!cursor) return;
          const row = cursor.value as SerializedRowRecord;
          if (String(row.tableId) === key) cursor.delete();
          cursor.continue();
        };
      };

      try {
        if (store.indexNames.contains('byTable') && isValidIdbKey(key)) {
          const index = store.index('byTable');
          const req = index.openCursor(IDBKeyRange.only(key));
          req.onsuccess = () => {
            const cursor = req.result;
            if (!cursor) return;
            cursor.delete();
            cursor.continue();
          };
          req.onerror = () => {
            runFullScan();
          };
        } else {
          runFullScan();
        }
      } catch {
        runFullScan();
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Single cursor pass over the byTableCollectionSort index, yielding batches.
   * The index gives collection-sorted order — no in-memory sort needed.
   * Falls back to a full scan when the index is missing (legacy stores).
   * onBatch may return false to stop early.
   */
  private async iterateRows(
    db: IDBDatabase,
    storeName: string,
    tableId: string,
    collection: string | null,
    onBatch: (
      records: SerializedRowRecord[],
      ordinalBase: number,
    ) => Promise<boolean | void>,
    batchSize = 500,
  ): Promise<void> {
    const key = asTableIdKey(tableId);
    if (!key) return;

    const rowsName = this.rowsStore(storeName);
    if (!db.objectStoreNames.contains(rowsName)) return;

    // Collection filter applied in-memory per batch (null = all collections).
    // Records from the index arrive already collection-sorted.
    const useIndex = collection !== null;
    let pending: SerializedRowRecord[] = [];
    let ordinal = 0;
    let stopped = false;

    const flush = async () => {
      if (pending.length === 0 || stopped) return;
      const batch = pending;
      pending = [];
      const base = ordinal;
      ordinal += batch.length;
      if ((await onBatch(batch, base)) === false) stopped = true;
    };

    const batchOrDefer = async (record: SerializedRowRecord | null) => {
      if (record) pending.push(record);
      if (pending.length >= batchSize) await flush();
    };

    if (useIndex && collection) {
      const runIndexed = () =>
        new Promise<void>((resolve, reject) => {
          const tx = db.transaction(rowsName, 'readonly');
          const index = tx.objectStore(rowsName).index('byTableCollectionSort');
          // Infinity is not a valid IndexedDB key — use safe numeric bounds
          const range = IDBKeyRange.bound(
            [key, collection, Number.MIN_SAFE_INTEGER],
            [key, collection, Number.MAX_SAFE_INTEGER],
          );
          const req = index.openCursor(range);
          req.onsuccess = async () => {
            const cursor = req.result;
            if (!cursor || stopped) {
              await flush();
              resolve();
              return;
            }
            await batchOrDefer(cursor.value as SerializedRowRecord);
            if (stopped) {
              await flush();
              resolve();
              return;
            }
            cursor.continue();
          };
          req.onerror = () => reject(req.error);
        });

      try {
        await runIndexed();
        return;
      } catch {
        // Index missing/corrupt — fall through to full scan below.
        pending = [];
        ordinal = 0;
        stopped = false;
      }
    }

    // Fallback: full scan (also serves collectionScope = 'all' / null collection)
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(rowsName, 'readonly');
      const store = tx.objectStore(rowsName);
      const req = store.openCursor();
      req.onsuccess = async () => {
        const cursor = req.result;
        if (!cursor || stopped) {
          await flush();
          resolve();
          return;
        }
        const record = cursor.value as SerializedRowRecord;
        if (String(record.tableId) === key && (!collection || record.collection === collection)) {
          await batchOrDefer(record);
          if (stopped) {
            await flush();
            resolve();
            return;
          }
        }
        cursor.continue();
      };
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Page-window read via cursor + offset on the sorted index.
   * Only `pageSize` records cross the heap — not the whole collection.
   */
  private async queryPageRows(
    db: IDBDatabase,
    storeName: string,
    tableId: string,
    collection: string,
    page: number,
    pageSize: number,
  ): Promise<Row[]> {
    const start = Math.max(0, (page - 1) * pageSize);
    const picked: SerializedRowRecord[] = [];

    await this.iterateRows(
      db,
      storeName,
      tableId,
      collection,
      async (records, ordinalBase) => {
        // Batch overlaps the page window?
        if (ordinalBase + records.length > start && picked.length < pageSize) {
          for (let i = 0; i < records.length; i++) {
            const pos = ordinalBase + i;
            if (pos >= start && pos < start + pageSize) {
              picked.push(records[i]);
              if (picked.length === pageSize) return false; // early stop
            }
          }
        }
        if (ordinalBase > start + pageSize) return false;
      },
      Math.max(pageSize, 500),
    );

    return picked.map(r => this.deserializeRow(r));
  }

  private async queryAllRowRecords(
    db: IDBDatabase,
    storeName: string,
    tableId: string,
  ): Promise<SerializedRowRecord[]> {
    const key = asTableIdKey(tableId);
    if (!key) return [];

    const rowsName = this.rowsStore(storeName);
    if (!db.objectStoreNames.contains(rowsName)) return [];

    return new Promise((resolve, reject) => {
      const tx = db.transaction(rowsName, 'readonly');
      const store = tx.objectStore(rowsName);

      if (store.indexNames.contains('byTable') && isValidIdbKey(key)) {
        try {
          const index = store.index('byTable');
          const req = index.getAll(IDBKeyRange.only(key));
          req.onsuccess = () => resolve((req.result as SerializedRowRecord[]) ?? []);
          req.onerror = () => reject(req.error);
          return;
        } catch {
          /* fall through */
        }
      }

      const req = store.getAll();
      req.onsuccess = () => {
        const all = (req.result as SerializedRowRecord[]) ?? [];
        resolve(all.filter(r => String(r.tableId) === key));
      };
      req.onerror = () => reject(req.error);
    });
  }

  private async ensureMeta(
    db: IDBDatabase,
    storeName: string,
    tableId: string,
  ): Promise<{ db: IDBDatabase; meta: SerializedTableMeta }> {
    const key = asTableIdKey(tableId);
    if (!key) {
      throw new Error(`[PagedIndexedDbTableRepository] ensureMeta: invalid tableId (${String(tableId)})`);
    }

    let current = await this.getDb().then(d => this.ensureStores(d, storeName));
    let raw = await this.readMeta(current, storeName, key);
    if (!raw) {
      throw new Error(`Table ${key} not found`);
    }
    if (this.isLegacy(raw)) {
      const migrated = await this.migrateLegacy(current, storeName, raw);
      current = await this.getDb();
      return { db: current, meta: migrated };
    }
    if (raw.recordKeyVersion !== 2) {
      // Pre-collection-scoped-keys format: row records were stored under
      // `table::rowId`, so rows of different collections sharing a server PK
      // had already clobbered each other. Re-key existing records once, then
      // continue at v2.
      const migrated = await this.migrateToCollectionScopedKeys(current, storeName, raw);
      current = await this.getDb();
      return { db: current, meta: migrated };
    }
    return { db: current, meta: raw };
  }

  /**
   * One-time re-key: `table::rowId` → `table::collection::rowId`.
   * Old-format records may collide (same PK in different collections overwrote
   * each other); after re-keying, per-collection counts in meta are re-derived
   * from the actual records so pagination stops being scrambled.
   */
  private async migrateToCollectionScopedKeys(
    db: IDBDatabase,
    storeName: string,
    meta: SerializedTableMeta,
  ): Promise<SerializedTableMeta> {
    db = await this.ensureStores(db, storeName);
    const rowsName = this.rowsStore(storeName);

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(rowsName, 'readwrite');
      const store = tx.objectStore(rowsName);
      const rekey = (src: IDBObjectStore) => {
        const req = src.openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if (!cursor) return;
          const rec = cursor.value as SerializedRowRecord;
          // Old format `table::rowId` has exactly 2 '::' segments; the new
          // collection-scoped key has 3. (Old ids DO contain '::', so a
          // substring check is wrong.)
          const segments = typeof rec.id === 'string' ? rec.id.split('::').length : 0;
          if (String(rec.tableId) === (meta.id ?? '') && segments === 2) {
            const rec2 = { ...rec, id: rowRecordId(rec.tableId, rec.collection, rec.rowId) };
            cursor.delete();
            store.put(JSON.parse(JSON.stringify(rec2)) as SerializedRowRecord);
          }
          cursor.continue();
        };
        req.onerror = () => reject(req.error);
      };
      rekey(store);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Recount every collection from actual persisted records (cursor-based).
    const counts: Record<string, number> = {};
    await this.iterateRows(
      db,
      storeName,
      meta.id ?? '',
      null,
      async records => {
        for (const rec of records) {
          counts[rec.collection] = (counts[rec.collection] ?? 0) + 1;
        }
      },
    );

    const next: SerializedTableMeta = {
      ...meta,
      recordKeyVersion: 2,
      totalRowsByCollection: counts,
      totalRows: counts[meta.activeCollection || 'default'] ?? meta.totalRows ?? 0,
    };
    await this.putMeta(db, storeName, next);
    return next;
  }

  // ─── TableRepository ────────────────────────────────────────────────────────

  async getById(storeName: string, tableId: string): Promise<Table> {
    const key = asTableIdKey(tableId);
    if (!key) {
      throw new Error(`[PagedIndexedDbTableRepository] getById: invalid tableId (${String(tableId)})`);
    }

    let db = await this.getDb();
    db = await this.ensureStores(db, storeName);
    const { db: d2, meta } = await this.ensureMeta(db, storeName, key);
    const page = meta.page || 1;
    const pageSize = meta.pageSize || 10;
    const rows = await this.queryPageRows(
      d2,
      storeName,
      key,
      meta.activeCollection || 'default',
      page,
      pageSize,
    );
    return this.buildTableFromPage(meta, rows, page, pageSize);
  }

  async save(storeName: string, table: Table): Promise<void> {
    const key = asTableIdKey(table?.id);
    if (!key) {
      console.warn('[PagedIndexedDbTableRepository] save skipped: invalid table.id', table?.id);
      return;
    }

    let db = await this.getDb();
    db = await this.ensureStores(db, storeName);

    let existingTotal = table.getPagination().totalRows;
    let existingMeta: SerializedTableMeta | null = null;
    try {
      const raw = await this.readMeta(db, storeName, key);
      if (raw && !this.isLegacy(raw)) {
        existingMeta = raw;
        existingTotal = Math.max(existingTotal, raw.totalRows);
      }
    } catch {
      /* first save */
    }

    // Prefer explicit pagination.totalRows from domain (add/delete update it).
    const totalRows = Math.max(existingTotal, table.getPagination().totalRows);
    // Pass existing meta so other collections' persisted row counts survive a
    // save from the page window (which holds no rows of other collections).
    const meta = this.buildMetaFromTable(table, totalRows, existingMeta);
    await this.putMeta(db, storeName, meta);

    const rows: Row[] = [];
    for (const col of table.getCollections().values()) {
      rows.push(...col.getRows().values());
    }
    await this.putRows(db, storeName, key, rows);
  }

  async replaceAll(storeName: string, table: Table): Promise<void> {
    const key = asTableIdKey(table?.id);
    if (!key) {
      console.warn('[PagedIndexedDbTableRepository] replaceAll skipped: invalid table.id', table?.id);
      return;
    }

    let db = await this.getDb();
    db = await this.ensureStores(db, storeName);

    // Other collections' rows must SURVIVE a replace of the active collection.
    // Keep their persisted records + counts and re-put them after the wipe.
    let survivorRecords: SerializedRowRecord[] = [];
    try {
      const raw = await this.readMeta(db, storeName, key);
      if (raw && !this.isLegacy(raw)) {
        const active = raw.activeCollection || 'default';
        // Collections fully present in the incoming table are re-seeded below
        // (bootstrap passes ALL collections) — their stale records must NOT be
        // resurrected after the wipe, or counts/rows get scrambled again.
        const incoming = new Set<string>();
        for (const col of table.getCollections().values()) {
          if (col.getRows().size > 0) incoming.add(col.getCollectionName());
        }
        const allRecords = await this.queryAllRowRecords(db, storeName, key);
        survivorRecords = allRecords.filter(
          r => r.collection !== active && !incoming.has(r.collection),
        );
      }
    } catch {
      /* first write — nothing to preserve */
    }

    const rows: Row[] = [];
    for (const col of table.getCollections().values()) {
      rows.push(...col.getRows().values());
    }

    await this.deleteAllRowsForTable(db, storeName, key);
    const meta = this.buildMetaFromTable(table, rows.length);
    meta.page = 1;
    meta.recordKeyVersion = 2;
    // Re-apply exact counts of surviving collections (window holds only the active one)
    const survivorCounts: Record<string, number> = {};
    for (const rec of survivorRecords) {
      survivorCounts[rec.collection] = (survivorCounts[rec.collection] ?? 0) + 1;
    }
    for (const [name, count] of Object.entries(survivorCounts)) {
      meta.totalRowsByCollection = meta.totalRowsByCollection ?? {};
      meta.totalRowsByCollection[name] = count;
    }
    await this.putMeta(db, storeName, meta);
    await this.putRows(db, storeName, key, rows);
    if (survivorRecords.length > 0) {
      await this.putRowRecords(db, storeName, survivorRecords);
    }
  }

  async loadPage(
    storeName: string,
    tableId: string,
    page: number,
    pageSize?: number,
  ): Promise<Table | null> {
    const key = asTableIdKey(tableId);
    if (!key) {
      // Leaving page / unmount — do not throw, do not touch IDB
      console.warn('[PagedIndexedDbTableRepository] loadPage skipped: invalid tableId', tableId);
      return null;
    }

    let db = await this.getDb();
    db = await this.ensureStores(db, storeName);
    const { db: d2, meta } = await this.ensureMeta(db, storeName, key);
    const size = pageSize ?? meta.pageSize ?? 10;
    const totalPages = Math.max(1, Math.ceil(Math.max(0, meta.totalRows) / Math.max(1, size)));
    const safePage = Math.max(1, Math.min(page, totalPages));

    const active = meta.activeCollection || 'default';
    const rows = await this.queryPageRows(
      d2,
      storeName,
      key,
      active,
      safePage,
      size,
    );

    // meta.totalRows is the ACTIVE collection's total; fall back for legacy metas
    const activeTotal = meta.totalRowsByCollection?.[active] ?? meta.totalRows ?? 0;
    const activeTotalPages = Math.max(1, Math.ceil(Math.max(0, activeTotal) / Math.max(1, size)));
    const collectionSafePage = Math.max(1, Math.min(safePage, activeTotalPages));

    let pageRows = rows;
    if (collectionSafePage !== safePage) {
      pageRows = await this.queryPageRows(d2, storeName, key, active, collectionSafePage, size);
    }

    meta.page = collectionSafePage;
    meta.pageSize = size;
    await this.putMeta(d2, storeName, meta);
    return this.buildTableFromPage(meta, pageRows, collectionSafePage, size);
  }

  /**
   * Persist the new active collection (page back to 1) and return a RAM window
   * holding page 1 of that collection only. Rows of other collections stay
   * untouched in IndexedDB — the returned Table contains no other-collection rows.
   */
  async setActiveCollection(
    storeName: string,
    tableId: string,
    collection: string,
  ): Promise<Table | null> {
    const key = asTableIdKey(tableId);
    if (!key) return null;

    let db = await this.getDb();
    db = await this.ensureStores(db, storeName);
    const { db: d2, meta } = await this.ensureMeta(db, storeName, key);

    if (!meta.collections?.some(c => c.name === collection)) {
      console.warn(`[PagedIndexedDbTableRepository] setActiveCollection: unknown collection "${collection}"`);
      return null;
    }

    const pageSize = meta.pageSize || 10;
    const total = meta.totalRowsByCollection?.[collection] ?? 0;
    const rows = await this.queryPageRows(d2, storeName, key, collection, 1, pageSize);

    meta.activeCollection = collection;
    meta.page = 1;
    meta.totalRows = total;
    await this.putMeta(d2, storeName, meta);

    return this.buildTableFromPage(meta, rows, 1, pageSize);
  }

  async getAllRows(
    storeName: string,
    tableId: string,
    collectionScope: CollectionScope = 'active',
  ): Promise<Row[]> {
    const key = asTableIdKey(tableId);
    if (!key) return [];

    let db = await this.getDb();
    db = await this.ensureStores(db, storeName);
    const { db: d2, meta } = await this.ensureMeta(db, storeName, key);
    const records = await this.queryAllRowRecords(d2, storeName, key);
    let rows = records.map(r => this.deserializeRow(r));

    if (collectionScope === 'all') {
      return rows.sort((a, b) => sortIndexOf(a) - sortIndexOf(b));
    }
    if (Array.isArray(collectionScope)) {
      const set = new Set(collectionScope);
      rows = rows.filter(r => set.has(r.collection));
    } else {
      const active = meta.activeCollection || 'default';
      rows = rows.filter(r => r.collection === active);
    }
    return rows.sort((a, b) => sortIndexOf(a) - sortIndexOf(b));
  }

  async getAllRowIds(
    storeName: string,
    tableId: string,
    collectionScope: CollectionScope = 'active',
  ): Promise<number[]> {
    const key = asTableIdKey(tableId);
    if (!key) return [];

    let db = await this.getDb();
    db = await this.ensureStores(db, storeName);
    const { db: d2, meta } = await this.ensureMeta(db, storeName, key);
    let records = await this.queryAllRowRecords(d2, storeName, key);

    if (collectionScope === 'all') {
      // keep all
    } else if (Array.isArray(collectionScope)) {
      const set = new Set(collectionScope);
      records = records.filter(r => set.has(r.collection));
    } else {
      const active = meta.activeCollection || 'default';
      records = records.filter(r => r.collection === active);
    }

    records.sort((a, b) => a.sortIndex - b.sortIndex);
    return records.map(r => r.rowId);
  }

  clearLocal(_store: string, _tableKey: string): void {
    // IndexedDB has no RAM window
  }

  async flush(_store: string, _tableKey: string): Promise<void> {
    // Direct IDB writes are awaited; nothing to flush
  }

  async exists(storeName: string, tableId: string): Promise<boolean> {
    const key = asTableIdKey(tableId);
    if (!key) return false;
    const db = await this.getDb();
    const metaName = this.metaStore(storeName);
    if (!db.objectStoreNames.contains(metaName)) return false;

    return new Promise(resolve => {
      const tx = db.transaction(metaName, 'readonly');
      const req = tx.objectStore(metaName).get(key);
      req.onsuccess = () => resolve(Boolean(req.result));
      req.onerror = () => resolve(false);
    });
  }

  async delete(storeName: string, tableId: string): Promise<void> {
    const key = asTableIdKey(tableId);
    if (!key) {
      console.warn('[PagedIndexedDbTableRepository] delete skipped: invalid tableId', tableId);
      return;
    }

    let db = await this.getDb();
    if (!db.objectStoreNames.contains(this.metaStore(storeName))) return;
    db = await this.ensureStores(db, storeName);

    await this.deleteAllRowsForTable(db, storeName, key);

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.metaStore(storeName), 'readwrite');
      tx.objectStore(this.metaStore(storeName)).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async resetTable(storeName: string, tableId: string): Promise<void> {
    const key = asTableIdKey(tableId);
    if (!key) {
      console.warn('[PagedIndexedDbTableRepository] resetTable skipped: invalid tableId', tableId);
      return;
    }

    let db = await this.getDb();
    if (!db.objectStoreNames.contains(this.metaStore(storeName))) return;
    db = await this.ensureStores(db, storeName);

    const raw = await this.readMeta(db, storeName, key);
    if (!raw) throw new Error(`Table ${key} not found`);

    await this.deleteAllRowsForTable(db, storeName, key);

    const active = this.isLegacy(raw)
      ? (raw.activeCollection ?? raw.activeDetailType ?? 'default')
      : raw.activeCollection;

    const meta: SerializedTableMeta = {
      id: key,
      kind: 'meta',
      activeCollection: active,
      page: 1,
      pageSize: this.isLegacy(raw) ? 10 : raw.pageSize || 10,
      totalRows: 0,
      collections: this.isLegacy(raw)
        ? []
        : (raw.collections ?? []).map(c => ({ name: c.name, columns: c.columns ?? [] })),
    };
    await this.putMeta(db, storeName, meta);
  }

  /**
   * Port: stream serialized row records in bounded batches (cursor over the
   * sorted index). 'active' → index cursor on the active collection;
   * 'all'/array → full scan filtered in-memory per batch. Heap = one batch.
   */
  async iterateRowRecords(
    storeName: string,
    tableId: string,
    collectionScope: CollectionScope = 'active',
    onBatch: (
      records: {
        rowId: number;
        collection: string;
        sortIndex: number;
        rowState: string;
        cells: Record<string, { value: unknown; originalValue: unknown; display: unknown }>;
      }[],
      ordinalBase: number,
    ) => Promise<boolean | void>,
    batchSize = 500,
  ): Promise<void> {
    const key = asTableIdKey(tableId);
    if (!key) return;

    let db = await this.getDb();
    db = await this.ensureStores(db, storeName);
    const { db: d2, meta } = await this.ensureMeta(db, storeName, key);
    const active = meta.activeCollection || 'default';
    const collection =
      collectionScope === 'active' ? active : null; // 'all' / array → full scan + filter

    if (collection !== null) {
      // Normalize to the port contract: cells as colId → cell Record (raw
      // StoredRowRecord keeps cells as an array — that shape broke consumers
      // like grid search and the Excel column scan).
      const normalized = async (
        records: SerializedRowRecord[],
        ordinalBase: number,
      ): Promise<boolean | void> =>
        onBatch(
          records.map(r => ({
            rowId: r.rowId,
            collection: r.collection,
            sortIndex: r.sortIndex,
            rowState: r.rowState,
            cells: Object.fromEntries(
              r.cells.map(c => [c.colId, { value: c.value, originalValue: c.originalValue, display: c.display }]),
            ),
          })),
          ordinalBase,
        );
      await this.iterateRows(d2, storeName, key, collection, normalized, batchSize);
      return;
    }

    const allowed = collectionScope === 'all' ? null : new Set(collectionScope as string[]);
    await this.iterateRows(
      d2,
      storeName,
      key,
      null,
      async (records, ordinalBase) => {
        const filtered = allowed ? records.filter(r => allowed.has(r.collection)) : records;
        if (filtered.length === 0) return;
        return onBatch(
          filtered.map(r => ({
            rowId: r.rowId,
            collection: r.collection,
            sortIndex: r.sortIndex,
            rowState: r.rowState,
            cells: Object.fromEntries(
              r.cells.map(c => [c.colId, { value: c.value, originalValue: c.originalValue, display: c.display }]),
            ),
          })),
          ordinalBase,
        );
      },
      batchSize,
    );
  }

  /**
   * Bulk soft/hard delete directly on persisted records in ONE readwrite
   * transaction — cursor over the `byTable` index (no full hydration, heap
   * stays O(1)). `Added` → hard delete; others → cursor.update to Deleted;
   * already-Deleted → untouched. Never goes through replaceAll.
   */
  async softDeleteRows(
    storeName: string,
    tableId: string,
    rowIds: number[],
  ): Promise<{
    softDeleted: number;
    hardRemoved: number;
    remaining: number;
  }> {
    const key = asTableIdKey(tableId);
    if (!key || rowIds.length === 0) {
      return { softDeleted: 0, hardRemoved: 0, remaining: 0 };
    }
    const wanted = new Set(rowIds);
    let softDeleted = 0;
    let hardRemoved = 0;
    let remaining = 0;

    const deleteOne = (record: SerializedRowRecord, recordStore: IDBObjectStore): void => {
      if (record.rowState === RowStateEnum.Added) {
        recordStore.delete(rowRecordId(key, record.collection, record.rowId));
        hardRemoved += 1;
        return;
      }
      if (record.rowState === RowStateEnum.Deleted) {
        return; // already deleted — no restore on bulk delete
      }
      record.rowState = RowStateEnum.Deleted;
      // Strip per-cell change markers: after a bulk delete the row is fully
      // Deleted — value-vs-original diffing must not resurrect change flags.
      record.cells = record.cells.map(c => ({ ...c, originalValue: c.value }));
      recordStore.put(JSON.parse(JSON.stringify(record)) as SerializedRowRecord);
      softDeleted += 1;
    };

    let db = await this.getDb();
    db = await this.ensureStores(db, storeName);
    const rowsName = this.rowsStore(storeName);

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([rowsName, this.metaStore(storeName)], 'readwrite');
      const recordStore = tx.objectStore(rowsName);

      // Runs AFTER the cursor pass finished (counts are final): update meta
      // within the SAME transaction — O(1), no scan. Chained from cursor
      // completion so it never races the delete/update callbacks.
      const finishMeta = () => {
        const metaReq = tx.objectStore(this.metaStore(storeName)).get(key);
        metaReq.onsuccess = () => {
          const meta = metaReq.result as SerializedTableMeta | undefined;
          if (meta && meta.kind === 'meta') {
            const active = meta.activeCollection || 'default';
            const activeTotal =
              meta.totalRowsByCollection?.[active] ?? meta.totalRows ?? 0;
            remaining = Math.max(0, activeTotal - softDeleted - hardRemoved);
            meta.totalRows = remaining;
            if (meta.totalRowsByCollection) {
              meta.totalRowsByCollection[active] = remaining;
            }
            tx.objectStore(this.metaStore(storeName)).put(
              JSON.parse(JSON.stringify(meta)) as SerializedTableMeta,
            );
          }
        };
        metaReq.onerror = () => reject(metaReq.error);
      };

      const runFullScan = () => {
        const req = recordStore.openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if (!cursor) {
            finishMeta();
            return;
          }
          const record = cursor.value as SerializedRowRecord;
          if (String(record.tableId) === key && wanted.has(record.rowId)) {
            deleteOne(record, recordStore);
          }
          cursor.continue();
        };
        req.onerror = () => reject(req.error);
      };

      const runIndexed = () => {
        const index = recordStore.index('byTable');
        const req = index.openCursor(IDBKeyRange.only(key));
        req.onsuccess = () => {
          const cursor = req.result;
          if (!cursor) {
            finishMeta();
            return;
          }
          const record = cursor.value as SerializedRowRecord;
          if (wanted.has(record.rowId)) deleteOne(record, recordStore);
          cursor.continue();
        };
        req.onerror = () => reject(req.error);
      };

      try {
        if (recordStore.indexNames.contains('byTable')) {
          runIndexed();
        } else {
          runFullScan();
        }
      } catch {
        runFullScan();
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error('softDeleteRows aborted'));
    });

    return { softDeleted, hardRemoved, remaining };
  }

  async removeRows(storeName: string, tableId: string, rowIds: number[]): Promise<void> {
    const key = asTableIdKey(tableId);
    if (!key || rowIds.length === 0) return;
    let db = await this.getDb();
    db = await this.ensureStores(db, storeName);
    const rowsName = this.rowsStore(storeName);
    const wanted = new Set(rowIds);

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([rowsName, this.metaStore(storeName)], 'readwrite');
      const rowStore = tx.objectStore(rowsName);
      // Row keys are collection-scoped — hard-removal by id must sweep every
      // collection (cursor over the byTable index, no full hydration).
      const sweep = (store: IDBObjectStore) => {
        const runIndexed = () => {
          const req = store.index('byTable').openCursor(IDBKeyRange.only(key));
          req.onsuccess = () => {
            const cursor = req.result;
            if (!cursor) return;
            const rec = cursor.value as SerializedRowRecord;
            if (wanted.has(rec.rowId)) cursor.delete();
            cursor.continue();
          };
        };
        try {
          if (store.indexNames.contains('byTable')) runIndexed();
          else runFullScan(store);
        } catch {
          runFullScan(store);
        }
      };
      const runFullScan = (store: IDBObjectStore) => {
        const req = store.openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if (!cursor) return;
          const rec = cursor.value as SerializedRowRecord;
          if (String(rec.tableId) === key && wanted.has(rec.rowId)) cursor.delete();
          cursor.continue();
        };
      };
      sweep(rowStore);
      const metaReq = tx.objectStore(this.metaStore(storeName)).get(key);
      metaReq.onsuccess = () => {
        const meta = metaReq.result as SerializedTableMeta | undefined;
        if (meta && meta.kind === 'meta') {
          meta.totalRows = Math.max(0, (meta.totalRows ?? 0) - rowIds.length);
          tx.objectStore(this.metaStore(storeName)).put(
            JSON.parse(JSON.stringify(meta)) as SerializedTableMeta,
          );
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
