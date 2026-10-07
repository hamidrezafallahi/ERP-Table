// adapters/infra/cachedTableRepository.ts
import { WindowedTableRepository } from '../../../application/ports/TableRepository';
import { ColumnSchema } from '../../../domain/types/ColumnSchema';
import { CollectionScope } from '../../../domain/entities/Table';
import { Row } from '../../../domain/entities/Row';
import { Table } from '../../../domain/entities/Table';
import { Pagination } from '../../../domain/value-objects';
import { PagedIndexedDbTableRepository } from './PagedIndexedDbTableRepository';
import { PagedLocalTableRepository } from './PagedLocalTableRepository';

function isValidTableKey(tableKey: unknown): tableKey is string {
  return typeof tableKey === 'string' && tableKey.length > 0;
}

/**
 * RAM = current page window only.
 * IndexedDB = source of truth for all rows.
 *
 * After `clearLocal` (page leave / dispose), all IDB ops for that table are
 * skipped until the table is opened again via getById/replaceAll.
 */
export class PagedCachedTableRepository implements WindowedTableRepository {
  private localRepo: PagedLocalTableRepository;
  private indexedRepo: PagedIndexedDbTableRepository;
  private persistChain = new Map<string, Promise<void>>();
  /** Tables closed by dispose — block further IDB rebuild/load until reopened */
  private closedKeys = new Set<string>();

  constructor() {
    this.localRepo = new PagedLocalTableRepository();
    this.indexedRepo = new PagedIndexedDbTableRepository();
  }

  private queueKey(store: string, tableKey: string): string {
    return `${store}::${tableKey}`;
  }

  private isClosed(store: string, tableKey: string): boolean {
    return this.closedKeys.has(this.queueKey(store, tableKey));
  }

  private reopen(store: string, tableKey: string): void {
    this.closedKeys.delete(this.queueKey(store, tableKey));
  }

  private enqueuePersist(store: string, tableKey: string, task: () => Promise<void>): void {
    const key = this.queueKey(store, tableKey);
    const prev = this.persistChain.get(key) ?? Promise.resolve();
    const next = prev
      .catch(() => undefined)
      .then(async () => {
        if (this.closedKeys.has(key)) return; // aborted by dispose
        await task();
      })
      .catch(err => {
        console.error('[PagedCachedTableRepository] IndexedDB persist failed', err);
      });
    this.persistChain.set(key, next);
  }

  async flush(store: string, tableKey: string): Promise<void> {
    if (!isValidTableKey(tableKey)) return;
    const key = this.queueKey(store, tableKey);
    await (this.persistChain.get(key) ?? Promise.resolve());
  }

  async getById(store: string, tableKey: string): Promise<Table> {
    if (!isValidTableKey(tableKey)) {
      throw new Error('[PagedCachedTableRepository] getById: invalid tableKey');
    }
    // Opening again after dispose
    this.reopen(store, tableKey);

    if (await this.localRepo.exists(store, tableKey)) {
      return this.localRepo.getById(store, tableKey);
    }
    await this.flush(store, tableKey);
    const table = await this.indexedRepo.getById(store, tableKey);
    await this.localRepo.save(store, table);
    return table;
  }

  async save(store: string, table: Table): Promise<void> {
    if (!isValidTableKey(table?.id)) {
      console.warn('[PagedCachedTableRepository] save skipped: invalid table.id', table?.id);
      return;
    }
    if (this.isClosed(store, table.id)) {
      return; // page left — do not rebuild IDB
    }

    await this.localRepo.save(store, table);

    // Await meta+page rows to IDB so pagination/totalRows stay correct after add/delete.
    // Page window is small — safe for typing compared to full-table blob.
    await this.indexedRepo.save(store, table);
  }

  async replaceAll(store: string, table: Table): Promise<void> {
    if (!isValidTableKey(table?.id)) {
      console.warn('[PagedCachedTableRepository] replaceAll skipped: invalid table.id', table?.id);
      return;
    }
    // Full seed / reopen always clears the disposed flag
    this.reopen(store, table.id);
    await this.flush(store, table.id);
    await this.indexedRepo.replaceAll(store, table);
    const pageSize = table.getPagination().pageSize;
    const pageTable = await this.indexedRepo.loadPage(store, table.id, 1, pageSize);
    if (!pageTable) return;
    this.restoreLiveColumns(table, pageTable);
    await this.localRepo.save(store, pageTable);
  }

  async loadPage(
    store: string,
    tableKey: string,
    page: number,
    pageSize?: number,
  ): Promise<Table | null> {
    // Leaving the page / null tableKey — stop quietly, never touch IDB
    if (!isValidTableKey(tableKey) || this.isClosed(store, tableKey)) {
      return null;
    }

    await this.flush(store, tableKey);

    let previous: Table | null = null;
    if (await this.localRepo.exists(store, tableKey)) {
      previous = await this.localRepo.getById(store, tableKey);
      await this.indexedRepo.save(store, previous);
    }

    const table = await this.indexedRepo.loadPage(store, tableKey, page, pageSize);
    if (!table) {
      return previous;
    }

    if (previous) {
      this.restoreLiveColumns(previous, table);
      // Keep the higher totalRows of the SAME active collection only.
      // (previous may come from a different collection after a switch —
      //  its total must not leak into the newly loaded collection's pagination.)
      const prevActive = previous.getActiveCollectionName();
      const nextActive = table.getActiveCollectionName();
      if (prevActive === nextActive) {
        const prevTotal = previous.getPagination().totalRows;
        const cur = table.getPagination();
        if (prevTotal > cur.totalRows) {
          table.setPagination(new Pagination(cur.page, cur.pageSize, prevTotal));
          await this.indexedRepo.save(store, table);
        }
      }
    }

    await this.localRepo.save(store, table);
    return table;
  }

  /**
   * Collection switch: swap the RAM window with page 1 of the NEW collection
   * (loaded from IndexedDB) and persist the switch in meta. Rows of other
   * collections are never touched.
   */
  async setActiveCollection(
    store: string,
    tableKey: string,
    collection: string,
  ): Promise<Table | null> {
    if (!isValidTableKey(tableKey) || this.isClosed(store, tableKey)) return null;

    await this.flush(store, tableKey);

    // Push unsaved edits of the CURRENT window down to IndexedDB first
    let previous: Table | null = null;
    if (await this.localRepo.exists(store, tableKey)) {
      previous = await this.localRepo.getById(store, tableKey);
      await this.indexedRepo.save(store, previous);
    }

    const table = await this.indexedRepo.setActiveCollection(store, tableKey, collection);
    if (!table) {
      return previous; // unknown collection — keep the current window
    }

    if (previous) {
      this.restoreLiveColumns(previous, table);
    }

    await this.localRepo.save(store, table);
    return table;
  }

  /** ColumnSchema holds functions — never come back from IndexedDB; keep RAM handlers. */
  private restoreLiveColumns(from: Table, to: Table): void {
    for (const [name, col] of from.getCollections()) {
      const target = to.getCollections().get(name);
      if (!target) continue;
      const dest = target.getColumns();
      dest.clear();
      for (const [field, schema] of col.getColumns()) {
        dest.set(field, schema as ColumnSchema);
      }
    }
  }

  async getAllRows(
    store: string,
    tableKey: string,
    collectionScope?: CollectionScope,
  ): Promise<Row[]> {
    if (!isValidTableKey(tableKey) || this.isClosed(store, tableKey)) return [];
    await this.flush(store, tableKey);
    if (await this.localRepo.exists(store, tableKey)) {
      const current = await this.localRepo.getById(store, tableKey);
      await this.indexedRepo.save(store, current);
    }
    return this.indexedRepo.getAllRows(store, tableKey, collectionScope);
  }

  async getAllRowIds(
    store: string,
    tableKey: string,
    collectionScope?: CollectionScope,
  ): Promise<number[]> {
    if (!isValidTableKey(tableKey) || this.isClosed(store, tableKey)) return [];
    await this.flush(store, tableKey);
    if (await this.localRepo.exists(store, tableKey)) {
      const current = await this.localRepo.getById(store, tableKey);
      await this.indexedRepo.save(store, current);
    }
    return this.indexedRepo.getAllRowIds(store, tableKey, collectionScope);
  }

  clearLocal(store: string, tableKey: string): void {
    if (!isValidTableKey(tableKey)) return;
    const key = this.queueKey(store, tableKey);
    this.closedKeys.add(key);
    // Cancel queued persists — in-flight tasks check closedKeys
    this.persistChain.set(key, Promise.resolve());
    this.localRepo.clearLocal(store, tableKey);
  }

  async delete(store: string, tableKey: string): Promise<void> {
    if (!isValidTableKey(tableKey)) return;
    await this.flush(store, tableKey);
    this.localRepo.clearLocal(store, tableKey);
    this.closedKeys.add(this.queueKey(store, tableKey));
    await this.indexedRepo.delete(store, tableKey);
  }

  async resetTable(store: string, tableKey: string): Promise<void> {
    if (!isValidTableKey(tableKey) || this.isClosed(store, tableKey)) return;
    await this.flush(store, tableKey);
    await this.indexedRepo.resetTable(store, tableKey);
    this.localRepo.clearLocal(store, tableKey);
    const empty = await this.indexedRepo.loadPage(store, tableKey, 1);
    if (empty) await this.localRepo.save(store, empty);
  }

  async exists(store: string, tableKey: string): Promise<boolean> {
    if (!isValidTableKey(tableKey)) return false;
    if (await this.localRepo.exists(store, tableKey)) return true;
    return this.indexedRepo.exists(store, tableKey);
  }

  /** Stream row records in batches (never the whole dataset in heap). */
  async iterateRowRecords(
    store: string,
    tableKey: string,
    collectionScope: CollectionScope,
    onBatch: Parameters<WindowedTableRepository['iterateRowRecords']>[3],
    batchSize?: number,
  ): Promise<void> {
    if (!isValidTableKey(tableKey) || this.isClosed(store, tableKey)) return;
    await this.flush(store, tableKey);
    // Push unsaved RAM-window edits down so streaming sees them.
    if (await this.localRepo.exists(store, tableKey)) {
      const current = await this.localRepo.getById(store, tableKey);
      await this.indexedRepo.save(store, current);
    }
    await this.indexedRepo.iterateRowRecords(store, tableKey, collectionScope, onBatch, batchSize);
  }

  async removeRows(store: string, tableKey: string, rowIds: number[]): Promise<void> {
    if (!isValidTableKey(tableKey) || this.isClosed(store, tableKey)) return;
    await this.flush(store, tableKey);
    await this.indexedRepo.removeRows(store, tableKey, rowIds);
  }

  /**
   * Bulk delete straight on IndexedDB records (Memory Iron Rule: no full
   * hydration, no replaceAll). After the persisted delete, the RAM window is
   * reloaded from IndexedDB so pagination/rows stay consistent.
   */
  async softDeleteRows(
    store: string,
    tableKey: string,
    rowIds: number[],
  ): Promise<{
    softDeleted: number;
    hardRemoved: number;
    remaining: number;
  }> {
    if (!isValidTableKey(tableKey) || this.isClosed(store, tableKey) || rowIds.length === 0) {
      return { softDeleted: 0, hardRemoved: 0, remaining: 0 };
    }
    await this.flush(store, tableKey);
    const result = await this.indexedRepo.softDeleteRows(store, tableKey, rowIds);
    // Re-derive the RAM window from the new SoT state (O(pageSize) heap);
    // pageSize comes from persisted meta.
    const pageTable = await this.indexedRepo.loadPage(store, tableKey, 1);
    if (pageTable) await this.localRepo.save(store, pageTable);
    return result;
  }
}
