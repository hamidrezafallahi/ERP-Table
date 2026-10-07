// adapters/infra/localTableRepository.ts

import { WindowedTableRepository } from '../../../application/ports/TableRepository';
import { CollectionScope } from '../../../domain/entities/Table';
import { Row } from '../../../domain/entities/Row';
import { Table } from '../../../domain/entities/Table';
import {
  ColumnId,
  Pagination,
  RowState,
  RowStateEnum,
} from '../../../domain/value-objects';

/**
 * RAM window only — holds at most the current page of rows for each table.
 * IndexedDB is the source of truth; this never stores the full dataset.
 */
export class PagedLocalTableRepository implements WindowedTableRepository {
  private tables = new Map<string, Table>();

  async exists(_store: string, tableKey: string): Promise<boolean> {
    return this.tables.has(tableKey);
  }

  async getById(_store: string, tableKey: string): Promise<Table> {
    const table = this.tables.get(tableKey);
    if (!table) throw new Error(`Table ${tableKey} not found in local window`);
    return table;
  }

  async save(_store: string, table: Table): Promise<void> {
    this.tables.set(table.id, table);
  }

  async replaceAll(_store: string, table: Table): Promise<void> {
    this.tables.set(table.id, table);
  }

  async loadPage(
    _store: string,
    tableKey: string,
    _page: number,
    _pageSize?: number,
  ): Promise<Table | null> {
    const table = this.tables.get(tableKey);
    return table ?? null;
  }

  /**
   * RAM window: a switch replaces the window with the one returned by the
   * IndexedDB layer, so nothing to persist here — just keep the new table.
   */
  async setActiveCollection(
    _store: string,
    tableKey: string,
    collection: string,
  ): Promise<Table | null> {
    const table = this.tables.get(tableKey);
    if (!table) return null;
    table.setActiveCollection(collection);
    table.changePage(1);
    return table;
  }

  async getAllRows(
    _store: string,
    tableKey: string,
    collectionScope: CollectionScope = 'active',
  ): Promise<Row[]> {
    const table = this.tables.get(tableKey);
    if (!table) return [];
    return table.getRows(collectionScope);
  }

  async getAllRowIds(
    _store: string,
    tableKey: string,
    collectionScope: CollectionScope = 'active',
  ): Promise<number[]> {
    const rows = await this.getAllRows(_store, tableKey, collectionScope);
    return rows.map(r => r.id.value);
  }

  clearLocal(_store: string, tableKey: string): void {
    this.tables.delete(tableKey);
  }

  async flush(): Promise<void> {
    /* sync RAM — nothing to flush */
  }

  async delete(_store: string, tableKey: string): Promise<void> {
    this.tables.delete(tableKey);
  }

  async resetTable(_store: string, tableKey: string): Promise<void> {
    this.tables.delete(tableKey);
  }

  /**
   * RAM window only — streams the current page's rows as a single batch.
   * (The full dataset lives in IndexedDB, not here.)
   */
  async iterateRowRecords(
    _store: string,
    tableKey: string,
    collectionScope: CollectionScope,
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
  ): Promise<void> {
    const table = this.tables.get(tableKey);
    if (!table) return;
    const rows = table.getRows(collectionScope);
    const records = rows.map(r => {
      const cells: Record<string, { value: unknown; originalValue: unknown; display: unknown }> = {};
      for (const [colId, cell] of r.getCells().entries()) {
        cells[colId] = { value: cell.getValue(), originalValue: cell.getOriginalValue().value, display: cell.getDisplay() };
      }
      return {
        rowId: r.id.value,
        collection: r.getCollection(),
        sortIndex: Number(r.getCell('index')?.getValue() ?? 0),
        rowState: r.rowState.value as string,
        cells,
      };
    });
    await onBatch(records, 0);
  }

  async removeRows(): Promise<void> {
    /* RAM window: caller already removed from Table Map */
  }

  /**
   * RAM-window bulk delete (Memory Iron Rule compliant): only the current
   * page's rows are mutated — Added hard-removed, others soft-deleted via
   * domain Row state; already-Deleted untouched. Remaining counts come from
   * pagination totals minus this operation's effects (no full-dataset scan).
   */
  async softDeleteRows(
    _store: string,
    tableKey: string,
    rowIds: number[],
  ): Promise<{
    softDeleted: number;
    hardRemoved: number;
    remaining: number;
  }> {
    const table = this.tables.get(tableKey);
    if (!table || rowIds.length === 0) {
      return { softDeleted: 0, hardRemoved: 0, remaining: 0 };
    }

    const wanted = new Set(rowIds);
    let softDeleted = 0;
    let hardRemoved = 0;

    for (const col of table.getCollections().values()) {
      for (const row of Array.from(col.getRows().values())) {
        if (!wanted.has(row.id.value)) continue;
        if (row.rowState.value === RowStateEnum.Added) {
          col.getRows().delete(row.id.value);
          hardRemoved += 1;
          continue;
        }
        if (row.rowState.value === RowStateEnum.Deleted) continue;
        row.rowState = new RowState(RowStateEnum.Deleted);
        row.updateChangeFields(new ColumnId('RowState'));
        softDeleted += 1;
      }
    }

    const p = table.getPagination();
    const remaining = Math.max(0, p.totalRows - softDeleted - hardRemoved);
    table.setPagination(new Pagination(p.page, p.pageSize, remaining));

    return { softDeleted, hardRemoved, remaining };
  }
}
