// engine/ViewStateBuilder.ts

import { ColumnSchema } from '../bootstrap/type';
import { Cell } from '../domain/entities/Cell';
import { Row } from '../domain/entities/Row';
import { CollectionScope } from '../domain/entities/Table';
import { RowStateEnum } from '../domain/value-objects';
import { UIRow } from '../ui/type';
import { EngineErrorHandler } from './EngineErrorHandler';
import { SparseRowIndex } from './SparseRowIndex';
import { TableStore } from './tableStore';
import {
  MOBILE_PAGE_SIZE,
  MobileTableViewState,
  TableSnapShot,
  TableState,
  TableViewState,
  TCell,
} from './type';

export class ViewStateBuilder {
  private readonly uiRowIndex = new SparseRowIndex<number>();
  private uiRowIndexDirty = true;

  constructor(
    private readonly readStore: () => TableStore<TableState> | undefined,
    private readonly err: EngineErrorHandler,
  ) { }

  invalidateUiRowIndex(): void {
    this.uiRowIndexDirty = true;
  }

  getUiRowIndex(): SparseRowIndex<number> {
    this.ensureUiRowIndex();
    return this.uiRowIndex;
  }

  getUiRowCount(): number {
    return this.getUiRowIndex().size;
  }

  projectVisibleUiRows(range: { startIndex: number; endIndex: number }): UIRow[] {
    const ids = this.getUiRowIndex().projectVisible(range);
    const out: UIRow[] = [];
    for (const id of ids) {
      const row = this.getRowView(id);
      if (row) out.push(row);
    }
    return out;
  }

  private ensureUiRowIndex(): void {
    if (!this.uiRowIndexDirty) return;
    this.uiRowIndex.clear();
    const storeRef = this.readStore();
    if (!storeRef) {
      this.uiRowIndexDirty = false;
      return;
    }
    const { table } = storeRef.getState();
    const activeName = table.getActiveCollectionName();
    const sorted = table
      .getRows()
      .filter((row) => row.collection === activeName)
      .sort((a, b) => {
        const aIndex = Number(a.getCells().get('index')?.getValue() ?? 0);
        const bIndex = Number(b.getCells().get('index')?.getValue() ?? 0);
        return aIndex - bIndex;
      });
    for (const row of sorted) {
      const id = row.id.value;
      this.uiRowIndex.set(id, id);
    }
    this.uiRowIndexDirty = false;
  }

  private getStore() {
    const store = this.readStore();

    if (!store) {
      this.err.notFound('TableStore', 'active', 'ViewStateBuilder');
    }
    return store;
  }

  private mapRowCells(
    row: Row,
    columns: ColumnSchema[],
  ): Record<string, TCell> {
    const cells: Record<string, TCell> = {};

    for (const col of columns) {
      try {
        const cell = row.getCells().get(col.fieldName);

        cells[col.fieldName] = {
          value: cell?.getValue() ?? null,
          originalValue: cell?.getOriginalValue()?.value ?? null,
          display: cell?.getDisplay() ?? null,
        };
      } catch (error) {
        this.err.handle(error, 'ViewStateBuilder.mapRowCells');
      }
    }

    return cells;
  }

  private sortRows(rows: Row[]): Row[] {
    return rows.sort((a, b) => {
      const aIndex = Number(a.getCells().get('index')?.getValue() ?? 0);
      const bIndex = Number(b.getCells().get('index')?.getValue() ?? 0);
      return aIndex - bIndex;
    });
  }

  private mapRowToUIRow(
    row: Row,
    columns: ColumnSchema[],
    expandedRows: Record<string, boolean>,
  ): UIRow {
    return {
      id: row.id.value,
      rowState: row.rowState.value,
      changeFields: row.getChangeFields(),
      cells: this.mapRowCells(row, columns),
      isExpanded: !!expandedRows[row.id.value],
      visibilityCondition: row.visibilityCondition,
    };
  }

  private mapRowsToUIRows(
    rows: Row[],
    columns: ColumnSchema[],
    expandedRows: Record<string, boolean>,
  ): UIRow[] {
    return this.sortRows(rows).map((row) =>
      this.mapRowToUIRow(row, columns, expandedRows),
    );
  }

  private getRenderableMobileRows(
    rows: Row[],
    mobileEditor: TableState['mobileEditor'],
  ): Row[] {
    return this.sortRows(
      rows
        .filter((row) => row.rowState.value !== RowStateEnum.Deleted)
        .filter(
          (row) =>
            !(
              mobileEditor?.mode === 'add' &&
              row.id.value === mobileEditor.rowId
            ),
        ),
    );
  }

  getViewState(): TableViewState | undefined {
    try {
      const storeRef = this.getStore();

      if (!storeRef) return undefined;

      const store = storeRef.getState();

      const { table, expandedRows, activeCell, selectedRows, gridSearch, mobileEditor, columnWidths } = store;

      const pagination = table.getPagination();

      const totalRows = table.getRows().length;

      const totalPages = Math.max(
        1,
        Math.ceil(totalRows / pagination.pageSize),
      );

      const columns = table.getActiveCollectionColumns()

      return {
        activeCell: activeCell ?? null,
        selectedRows,
        rows: this.mapRowsToUIRows(table.getVisibleRows(), columns, expandedRows),
        deletedRows: [],
        columns,
        activeCollectionColumn:table.getActiveCollectionColumns(),
        pagination: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalRows,
          totalPages,
          canPrev: pagination.page > 1,
          canNext: pagination.page < totalPages,
        },
        action: table.getTableAction(),
        gridSearch,
        mobileEditor,
        columnWidths: columnWidths ?? {},
      };
    } catch (error) {
      this.err.handle(error, 'ViewStateBuilder.getViewState');
      return undefined;
    }
  }

  /**
   * All active-collection UI rows (no pagination slice) for virtual scroll.
   */
  getAllUIRows(): UIRow[] | null {
    try {
      const storeRef = this.getStore();
      if (!storeRef) return null;
      const { table, expandedRows } = storeRef.getState();
      const columns = table.getActiveCollectionColumns();
      const activeName = table.getActiveCollectionName();
      const activeRows = table
        .getRows()
        .filter((r) => r.collection === activeName);
      return this.mapRowsToUIRows(activeRows, columns, expandedRows);
    } catch (error) {
      this.err.handle(error, 'ViewStateBuilder.getAllUIRows');
      return null;
    }
  }

  // ViewBuilder
  getAllRows(collectionScope: CollectionScope = 'active'): Row[] | null {
    const storeRef = this.getStore();
    if (!storeRef) return null;
    const { table } = storeRef.getState();
    return this.sortRows(table.getRows(collectionScope));
  }

  getMobileViewState(): MobileTableViewState | undefined {
    try {
      const storeRef = this.getStore();
      if (!storeRef) return undefined;

      const { table, expandedRows, mobileEditor } = storeRef.getState();
      const pagination = table.getPagination();
      const columns = table.getActiveCollectionColumns();
      const allRows = this.getRenderableMobileRows(table.getRows('active'), mobileEditor);
      const pageSize = Math.max(MOBILE_PAGE_SIZE, pagination.pageSize);
      const visibleRows = allRows.slice(0, pageSize);
      const totalRows = allRows.length;
      const visibleCount = Math.min(pageSize, totalRows);

      return {
        rows: this.mapRowsToUIRows(visibleRows, columns, expandedRows),
        columns,
        totalRows,
        visibleCount,
        hasMore: visibleCount < totalRows,
        pageSize,
        mobileEditor,
      };
    } catch (error) {
      this.err.handle(error, 'ViewStateBuilder.getMobileViewState');
      return undefined;
    }
  }

  getRowView(rowId: number): UIRow | null {
    const storeRef = this.getStore();
    if (!storeRef) return null;

      const { table, expandedRows } = storeRef.getState();
      const row = table.getRow(rowId) // getRows().find((item) => item.id.value === rowId);

    if (!row) return null;

    return this.mapRowToUIRow(
      row,
      table.getActiveCollectionColumns(),
      expandedRows,
    );
  }

  getSnapShot(collectionScope?: CollectionScope): TableSnapShot | null {
    const storeRef = this.getStore();
    if (!storeRef) return null;

    const { table } = storeRef.getState();
    const hasMeaningfulValue = (value: unknown) =>
      value !== undefined && value !== null && value !== '';

    return {
      rows: table
        .getRows(collectionScope)
        .filter(row =>
          Array.from(row.getCells().entries()).some(
            ([key, cell]) => key !== 'index' && hasMeaningfulValue(cell.getValue()),
          ),
        )
        .map(row => ({
          id: row.id.value,
          changeFields: row.getSnapshotChangeFields(),
          cells: Object.fromEntries(
            [...row.getCells()].map(([k, c]) => [k, c.getValue()]),
          ),
          rowState: row.rowState.value,
          collection: row.getCollection(),
          rowType: row.getCollection(),
          isSaveDescription: row.isSaveDescription,
        })),
    };
  }

  getExpandedRowData(
    rowId: number,
  ): Record<string, unknown> | null {
    const storeRef = this.getStore();
    if (!storeRef) return null;

    const { table } = storeRef.getState();
    const row = table.getRows().find(r => r.id.value === rowId);
    if (!row) return null;

    const rowValues: Record<string, unknown> = {};
    for (const [colId, cell] of row.getCells().entries()) {
      rowValues[colId] = cell.getValue();
    }
    return rowValues;
  }

  getActiveCell(): TableState['activeCell'] | null {
    const store = this.getStore()?.getState();
    if (!store) return null;
    return store.activeCell;
  }
  getActiveRow(): number | null {

    try {

      const store = this.getStore()?.getState();

      if (!store) return null;

      return store.activeRowId ?? null;

    } catch (error) {

      this.err.handle(error, 'ViewStateBuilder.getActiveRow');

      return null;
    }
  }

  getSelectedRows(): Record<number, boolean> | undefined {
    const store = this.getStore()?.getState();
    if (!store) return undefined;
    return store.selectedRows;
  }

  getCell(rowId: number, columnId: string): Cell | undefined {
    const store = this.getStore()?.getState();
    if (!store) return undefined;
    return store.table.getRow(rowId)?.getCell(columnId);
  }
  isActiveCell(rowId: number, columnId: string): boolean {

    try {
      const store = this.getStore();
      if (!store) return false;
      const { activeCell } = store.getState();
      return (
        !!activeCell &&
        activeCell.rowId === rowId &&
        activeCell.columnId === columnId
      );
    } catch (error) {
      this.err.handle(error, 'ViewStateBuilder.isActiveCell');
      return false;
    }
  }


  isSelectedRow(rowId: number): boolean {

    try {

      const store = this.getStore();

      if (!store) return false;

      const { selectedRows } = store.getState();

      return !!selectedRows && !!selectedRows[rowId];

    } catch (error) {

      this.err.handle(error, 'ViewStateBuilder.isSelectedRow');

      return false;
    }
  }


  isCutRow(rowId: number): boolean {
    try {
      const store = this.getStore();
      if (!store) return false;
      const { selectedRows, table } = store.getState();
      return selectedRows[rowId] && table.getTableAction() === 'cut';
    } catch (error) {
      this.err.handle(error, 'ViewStateBuilder.isCutRow');
      return false;
    }
  }


  isActiveRow(rowId: number): boolean {

    try {

      const store = this.getStore();

      if (!store) return false;

      const { activeRowId } = store.getState();

      return !!activeRowId && activeRowId === rowId;

    } catch (error) {

      this.err.handle(error, 'ViewStateBuilder.isActiveRow');

      return false;
    }
  }

}