//application/ports

import { Row } from '../../domain/entities/Row';
import { CollectionScope, Table } from '../../domain/entities/Table';

export interface TableRepository {
  getById(store: string, tableKey: string): Promise<Table>;
  save(store: string, table: Table): Promise<void>;
  delete(store: string, tableKey: string): Promise<void>;
  resetTable(store: string, tableKey: string): Promise<void>;
  exists(store: string, tableKey: string): Promise<boolean>;
  getFromDbById?(store: string, tableKey: string): Promise<Table>;
}

/** Plain serialized row as streamed from IndexedDB (no domain objects). */
export interface PersistedRowRecord {
  rowId: number;
  collection: string;
  sortIndex: number;
  rowState: string;
  /** colId → { value, originalValue, display } — plain, no domain objects */
  cells: Record<string, { value: unknown; originalValue: unknown; display: unknown }>;
}

/**
 * Page-window repository ("paged IndexedDB" persistence mode).
 *
 * IndexedDB is the single source of truth for ALL rows; RAM holds exactly one
 * page window (Memory Iron Rule: heap is O(batch), never O(total rows)).
 * Opt-in via `persistence: 'paged-idb'`; the default event-sourced
 * repositories do NOT implement these methods.
 */
export interface WindowedTableRepository extends TableRepository {
  /**
   * Persist metadata + upsert rows currently held in the Table (page window).
   * Must NOT delete other pages' rows in IndexedDB.
   */
  save(store: string, table: Table): Promise<void>;

  /**
   * Replace IndexedDB source of truth with every row on `table`, then callers
   * should `loadPage` so RAM only keeps one page.
   */
  replaceAll(store: string, table: Table): Promise<void>;

  /** Flush pending IDB writes, load one page into RAM, return that window. */
  loadPage(
    store: string,
    tableKey: string,
    page: number,
    pageSize?: number,
  ): Promise<Table | null>;

  /**
   * Switch the persisted active collection (page resets to 1) and return a
   * Table whose RAM window holds page 1 of the NEW collection only.
   * Rows of other collections must remain untouched in IndexedDB.
   */
  setActiveCollection(
    store: string,
    tableKey: string,
    collection: string,
  ): Promise<Table | null>;

  /**
   * @deprecated Legacy: hydrates the whole dataset. Use `iterateRowRecords`.
   * All rows from IndexedDB (source of truth).
   */
  getAllRows(
    store: string,
    tableKey: string,
    collectionScope?: CollectionScope,
  ): Promise<Row[]>;

  /**
   * All row ids from IndexedDB (source of truth), without hydrating cells.
   * Used for select-all across the full dataset (not just the RAM page window).
   */
  getAllRowIds(
    store: string,
    tableKey: string,
    collectionScope?: CollectionScope,
  ): Promise<number[]>;

  /**
   * Stream serialized row records from IndexedDB in bounded batches via a
   * cursor over the byTableCollectionSort index (ordered, no full load).
   * The heap at any moment holds one batch — never the whole dataset.
   * Return false from onBatch to stop early.
   */
  iterateRowRecords(
    store: string,
    tableKey: string,
    collectionScope: CollectionScope,
    onBatch: (
      records: PersistedRowRecord[],
      /** Ordinal (0-based, collection-sorted position) of the batch's first record */
      ordinalBase: number,
    ) => Promise<boolean | void>,
    batchSize?: number,
  ): Promise<void>;

  /** Physically remove row records from IndexedDB (hard delete). */
  removeRows(store: string, tableKey: string, rowIds: number[]): Promise<void>;

  /**
   * Bulk soft/hard delete applied directly to persisted row records
   * (cursor-based — heap stays O(1)):
   * - `Added` rows are hard-removed from the store
   * - others get rowState = Deleted written on the record (cursor.update)
   * - already-Deleted rows are left untouched (no restore on bulk delete)
   */
  softDeleteRows(
    store: string,
    tableKey: string,
    rowIds: number[],
  ): Promise<{
    softDeleted: number;
    hardRemoved: number;
    /** Non-deleted rows remaining in the active collection after the delete. */
    remaining: number;
  }>;

  /** Drop RAM window only; IndexedDB untouched. */
  clearLocal(store: string, tableKey: string): void;

  /** Await queued IndexedDB writes for this table. */
  flush(store: string, tableKey: string): Promise<void>;
}

/** Type guard: true only for page-window repositories (`persistence: 'paged-idb'`). */
export function isWindowedRepository(
  repo: TableRepository,
): repo is WindowedTableRepository {
  const r = repo as Partial<WindowedTableRepository>;
  return (
    typeof r.loadPage === 'function' &&
    typeof r.iterateRowRecords === 'function' &&
    typeof r.softDeleteRows === 'function'
  );
}
