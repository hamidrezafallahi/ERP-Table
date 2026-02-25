//domain/entities

import {
  CellChanged,
  ColumnReordered,
  DisplayChanged,
  MinimumRowConstraintViolated,
  RowAdded,
  RowDeleted,
  RowRemoved,
  RowReordered,
  RowRestored,
} from '../events';
import {
  CellValue,
  ColumnId,
  ColumnSchema,
  Pagination,
  RowId,
  RowState,
  RowStateEnum,
} from '../value-objects';
import { Cell } from './Cell';
import { Row } from './Row';

export class Table {
  constructor(
    public readonly id: string,
    private rows: Map<number, Row>,
    private columns: Map<string, ColumnSchema>,
    private pagination: Pagination,

  ) { }
  getColumnSchema(columnId: ColumnId): ColumnSchema | undefined {
    return this.columns.get(columnId.value);
  }
  setColumnSchema(columnId: ColumnId, columnSchema: ColumnSchema): ColumnSchema | undefined {
    const prev = this.columns.get(columnId.value);
    this.columns.set(columnId.value, columnSchema);
    return prev;
  }
  getColumns(): ColumnSchema[] {
    return Array.from(this.columns.values());
  }
  getColumnValues(colId: string): unknown[] {
    const result: unknown[] = [];
    for (const row of this.rows.values()) {
      const cell = row.getCell(colId);
      if (!cell) continue;
      result.push(cell.getValue().value);
    }
    return result;
  }
  setColumns(newColumns: ColumnSchema[]) {
    const updatedColumns = new Map<string, ColumnSchema>();
    for (const col of newColumns) {
      const existing = this.columns.get(col.id);
      updatedColumns.set(col.id, {
        ...col,
        hidden: existing?.hidden ?? col.hidden ?? false,
      });
    }
    this.columns = updatedColumns;
    for (const row of this.rows.values()) {
      for (const col of newColumns) {
        if (!row.getCells().has(col.id)) {
          const defaultValue =
            col.renderType === "number" ? new CellValue(0) : new CellValue("");
          const defaultDisplay =
            col.renderType === "number" ? new CellValue(0) : new CellValue("");
          row.ensureCell(new ColumnId(col.id), defaultValue, defaultDisplay);
        }
      }
    }
  }

  changeCell(
    rowId: RowId,
    columnId: ColumnId,
    value: CellValue
  ): CellChanged | null {
    const row = this.rows.get(rowId.value);
    if (!row) return null;
    const ev = row.changeCell(columnId, value);
    if (ev) {
      row.updateChangeFields(columnId);
    }
    return ev;
  }
  changeDisplay(
    rowId: RowId,
    columnId: ColumnId,
    value: CellValue
  ): DisplayChanged | null {
    const row = this.rows.get(rowId.value);
    if (!row) return null;
    const ev = row.changeDisplay(columnId, value);
    return ev;
  }
  addRow(rowId: RowId): RowAdded {
    const target = this.rows.get(rowId.value);
    if (!target) throw new Error("Row not found");

    const newRowId = new RowId(
      Math.floor((1 + Math.random()) * 0x10000000000000000)
    );

    const newCells = new Map<string, Cell>();

    for (const [colId, cell] of target.getCells().entries()) {
      newCells.set(
        colId,
        new Cell(
          newRowId,
          new ColumnId(colId),
          cell.getValue(),
          cell.getValue(),
          cell.getDisplay()
        )
      );
    }

    const newRow = new Row(
      newRowId,
      newCells,
      new RowState(RowStateEnum.Added),
      new Set(),
      target.moreDetails
    );

    // 🔹 1️⃣ تبدیل به آرایه
    const rowsArray = Array.from(this.rows.values());

    // 🔹 2️⃣ مرتب بر اساس index
    rowsArray.sort((a, b) =>
      (a.getCell("index")?.getValue().value as number) -
      (b.getCell("index")?.getValue().value as number)
    );
    const targetIndex = rowsArray.findIndex(r => r.id.value === rowId.value);
    rowsArray.splice(targetIndex + 1, 0, newRow);
    rowsArray.forEach((row, i) => {
      row.changeCell(
        new ColumnId("index"),
        new CellValue(i + 1)
      );
      row.updateChangeFields(new ColumnId("index"));
    });

    this.rows = new Map(
      rowsArray.map(r => [r.id.value, r])
    );
    const totalRows = this.pagination.totalRows;
    this.pagination = this.pagination.changeTotalRows(totalRows + 1)
    return new RowAdded(newRowId);
  }
  addNewRow(): RowAdded {
    const newRowId = new RowId(Math.floor((1 + Math.random()) * 0x10000000000000000))
    const cells = new Map<string, Cell>();
    const rowId = new RowId(newRowId.value);
    this.getColumns().forEach((column) => {
      const columnId = column.id;
      const cellValue = new CellValue(columnId == "index" ? this.rows.size + 1 : null)
      const cellDisplay = new CellValue(columnId == "index" ? this.rows.size + 1 : null)
      const cell = new Cell(
        rowId,
        new ColumnId(columnId),
        cellValue,
        cellValue,
        cellDisplay
      );
      cells.set(columnId, cell);
    });
    const newRow = new Row(newRowId, cells, new RowState(RowStateEnum.Added), new Set(), undefined);
    this.rows.set(newRowId.value, newRow);
    const totalRows = this.pagination.totalRows;
    this.pagination = this.pagination.changeTotalRows(totalRows + 1)
    const pageSize = this.pagination.pageSize;
    const lastPage = Math.ceil(totalRows / pageSize);
    this.changePage(lastPage);
    return new RowAdded(newRowId);
  }
  addColumns(newColumns: ColumnSchema[]): { added: ColumnId[] } {
    const added: ColumnId[] = [];
    for (const incoming of newColumns) {
      const key = incoming.id;
      const existing = this.columns.get(key);
      if (existing) {
        if (existing.renderType !== incoming.renderType) {

        }
        const shouldUnhide = existing.hidden === true;
        this.columns.set(key, {
          ...existing,
          title: incoming.title,
          required: incoming.required,
          editable: incoming.editable,
          renderType: existing.renderType,
          hidden: shouldUnhide ? false : existing.hidden,
        });

        if (shouldUnhide) {
          added.push(new ColumnId(incoming.id));
        }

        continue;
      }
      this.columns.set(key, { ...incoming, hidden: incoming.hidden ?? false });
      added.push(new ColumnId(incoming.id));

      for (const row of this.rows.values()) {
        const defaultValue =
          incoming.renderType === "number"
            ? new CellValue(0)
            : new CellValue("");
        const defaultDisplay =
          incoming.renderType === "number"
            ? new CellValue(0)
            : new CellValue("");
        row.ensureCell(new ColumnId(incoming.id), defaultValue, defaultDisplay);
      }
    }

    if (added.length > 0)
      return { added };
  }
  removeColumns(columnIds: ColumnId[]): { removed: ColumnId[] } {
    const removed: ColumnId[] = [];

    for (const colId of columnIds) {
      const key = colId.value;
      const schema = this.columns.get(key);
      if (!schema) continue;

      // already hidden => no-op
      if (schema.hidden) continue;

      // hide instead of delete
      this.columns.set(key, { ...schema, hidden: true });
      removed.push(colId);
    }
    return { removed };
  }
  getRows(): Row[] {
    return Array.from(this.rows.values());
  }
  getRow(rowId: number): Row | undefined {
    return this.rows.get(rowId);
  }

  getPagination() {
    return this.pagination;
  }
  setPagination(pagination: Pagination) {
    this.pagination = pagination
  }

  changePage(page: number) {
    this.pagination = this.pagination.changePage(page);

  }
  changePageSize(size: number) {
    this.pagination = this.pagination
      .changePageSize(size)
      .changePage(1);

  }
  getVisibleRows() {
    const start = (this.pagination.page - 1) * this.pagination.pageSize;
    const end = start + this.pagination.pageSize;
    return this.getRows().slice(start, end);
  }
  addRows(newRows: Row[]) {
    newRows.forEach((r) => {
      this.rows.set(r.id.value, r)
    });


  }
  deleteRow(rowId: RowId): RowDeleted | RowRestored | RowRemoved | MinimumRowConstraintViolated | null {
    const row = this.rows.get(rowId.value);
    if (!row) return null
    if (row.rowState.value == RowStateEnum.Added && this.rows.size == 1) {
      this.rows.delete(rowId.value);
      this.addNewRow()
      // const totalRows = this.pagination.totalRows;
      // this.pagination.changeTotalRows(totalRows - 1)
      return new MinimumRowConstraintViolated(rowId);
    }
    if (row.rowState.value == RowStateEnum.Added && this.rows.size > 1) {
      this.rows.delete(rowId.value);
      // const totalRows = this.pagination.totalRows;
      // this.pagination.changeTotalRows(totalRows - 1)
      return new RowRemoved(rowId);
    } else if (row.rowState.value == RowStateEnum.Unchanged) {
      row.rowState = new RowState(RowStateEnum.Deleted)
      row.updateChangeFields(new ColumnId("RowState"))

      return new RowDeleted(rowId);
    } else {
      if (row.getChangeFields().length > 0) {
        row.rowState = new RowState(RowStateEnum.Modified)
        row.updateChangeFields(new ColumnId("RowState"))

        return new RowRestored(rowId);
      } else {
        row.rowState = new RowState(RowStateEnum.Unchanged)
        row.updateChangeFields(new ColumnId("RowState"))

        return new RowRestored(rowId);
      }
    }
  }
  reorderRows(draggedRowNum: number, droppedRowNum: number, position: 'before' | 'after' = 'after'): RowReordered {
    if (draggedRowNum === droppedRowNum) {
      return new RowReordered(draggedRowNum, droppedRowNum);
    }

    const rowsArray = Array.from(this.rows.values()).sort((a, b) =>
      (a.cells.get('index').getValue().value as number) -
      (b.cells.get('index').getValue().value as number)
    ); const fromIndex = rowsArray.findIndex(r => r.id.value === draggedRowNum);
    const toIndex = rowsArray.findIndex(r => r.id.value === droppedRowNum);
    if (fromIndex === -1 || toIndex === -1) {
      throw new Error(`Row ${draggedRowNum} or ${droppedRowNum} does not exist`);
    }
    const [moved] = rowsArray.splice(fromIndex, 1);
    let insertIndex = toIndex;
    if (position === 'after') {
      insertIndex = toIndex + 1;
      if (fromIndex < toIndex) insertIndex -= 1;
    } else {
      if (fromIndex < toIndex) insertIndex -= 1;
    }

    rowsArray.splice(insertIndex, 0, moved);
    const rebuilt = new Map<number, Row>();
    rowsArray.forEach((row, i) => {
      const newRowNum = i + 1;
      row.changeCell(new ColumnId("index"), new CellValue(newRowNum));
      row.updateChangeFields(new ColumnId("index"));
      row.setRowId(new RowId(row.id.value));
      rebuilt.set(row.id.value, row);
    });
    this.rows = rebuilt;
    return new RowReordered(draggedRowNum, droppedRowNum);
  }
  reorderColumns(sourceIndex: number, destIndex: number): ColumnReordered {
    const colsArray = Array.from(this.columns.values());
    const [moved] = colsArray.splice(sourceIndex, 1);
    colsArray.splice(destIndex, 0, moved);
    this.columns = new Map(colsArray.map((c) => [c.id, c]));

    return new ColumnReordered(sourceIndex, destIndex);
  }
  clone(): Table {
    const clonedRows = new Map<number, Row>();
    for (const [k, row] of this.rows.entries()) {


      const clonedColumns = new Map(this.columns);
      const cloned = new Table(this.id, clonedRows, clonedColumns, this.pagination);
      cloned.pagination = this.pagination;
      return cloned;
    }

  }
}
