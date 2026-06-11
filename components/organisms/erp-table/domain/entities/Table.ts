//domain/entities

import {
  CellChanged,
  ColumnReordered,
  DescriptionSaved,
  DisplayChanged,
  MinimumRowConstraintViolated,
  RowAdded,
  RowDeleted,
  RowRemoved,
  RowReordered,
  RowRestored,
} from '../events';
import {
  CellDisplay,
  CellValue,
  ColumnId,
  ColumnSchema,
  KeyValue,
  Pagination,
  RowId,
  RowState,
  RowStateEnum,
  TableActions,
} from '../value-objects';
import { Cell } from './Cell';
import { Row } from './Row';

export class Table {
  constructor(
    public readonly id: string,
    private rows: Map<number, Row>,
    private columns: Map<string, ColumnSchema>,
    private pagination: Pagination,
    private action: TableActions,
    private activeTableType: string = "default"

  ) { }
  getColumnSchema(columnId: ColumnId): ColumnSchema | undefined {
    return this.columns.get(columnId.value);
  }
  getActiveTableType(): string {
    return this.activeTableType;
  }
  setActiveTableType(activeTableType: string) {
    this.activeTableType = activeTableType;
  }
  getRowType(rowId: number): string {
    const row = this.rows.get(rowId);
    return row.getRowType()
  }
  setRowType(rowId: number, type: string) {
    const row = this.rows.get(rowId);
    row.setRowType(type)
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
    value: unknown
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
    value: unknown
  ): DisplayChanged | null {
    const row = this.rows.get(rowId.value);
    if (!row) return null;
    const ev = row.changeDisplay(columnId, value);
    return ev;
  }
  saveDescription(
    rowId: RowId,
    flag: boolean
  ): DescriptionSaved | null {
    const row = this.rows.get(rowId.value);
    if (!row) return null;
    const ev = row.saveDescription(flag);
    return ev;
  }
  duplicateRow(rowId: RowId): RowAdded {
    const target = this.rows.get(rowId.value);
    if (!target) throw new Error("Row not found");
    const rowsArray = Array.from(this.rows.values());
    const targetIndex = rowsArray.findIndex(r => r.id.value === rowId.value);
    const nextRow = targetIndex < rowsArray.length - 1 ? rowsArray[targetIndex + 1] : undefined;
    let x = 0;
    const targetIndexValue = target.getCell("index")?.getValue().value as number;
    if (!nextRow) {
      x = targetIndexValue + 1
    } else {
      const nextIndexValue = nextRow.getCell("index")?.getValue().value as number;
      x = (targetIndexValue + nextIndexValue) / 2;
    }
    const newRowId = new RowId(
      Math.floor((1 + Math.random()) * 0x10000000000000000)
    );
    const newCells = new Map<string, Cell>();
    const newIndex = new CellValue(x)
    const newDisplay = new CellDisplay(x)
    for (const [colId, cell] of target.getCells().entries()) {
      if (colId == "index") {
        newCells.set(
          colId,
          new Cell(
            newRowId,
            new ColumnId(colId),
            newIndex,
            newIndex,
            newDisplay
          )
        );
      } else {
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

    }

    const newRow = new Row(
      newRowId,
      newCells,
      new RowState(RowStateEnum.Added),
      new Set(),
      target.moreDetails,
      target.visibilityCondition,
      target.rowType,
      target.isSaveDescription
    );
    rowsArray.sort((a, b) =>
      (a.getCell("index")?.getValue().value as number) -
      (b.getCell("index")?.getValue().value as number)
    );

    rowsArray.splice(targetIndex + 1, 0, newRow);

    this.rows = new Map(
      rowsArray.map(r => [r.id.value, r])
    );

    return new RowAdded(newRowId);
  }
  addRow(targetRowId: number, placedRowId?: number | undefined): RowAdded {
    const target = this.rows.get(targetRowId);
    if (!target) throw new Error("Row not found");
    let placeIndex;
    let x = 0;

    const rowsArray = Array.from(this.rows.values()).sort((a, b) =>
      (a.getCell("index")?.getValue().value as number) -
      (b.getCell("index")?.getValue().value as number)
    );
    if (placedRowId) {
      const placedRow = rowsArray.find(r => r.id.value === placedRowId)
      placeIndex = rowsArray.findIndex(r => r.id.value === placedRowId)
      const placeIndexValue = placedRow.getCell("index")?.getValue().value as number;
      const nextRow = placeIndex < rowsArray.length - 1 ? rowsArray[placeIndex + 1] : undefined;
      if (nextRow) {
        const nextIndexValue = nextRow.getCell("index")?.getValue().value as number;
        x = (placeIndexValue + nextIndexValue) / 2;
      } else {
        x = placeIndexValue + 1
      }
    } else {
      const lastRowIndexValue = rowsArray[rowsArray.length - 1].getCell("index").getValue().value as number
      x = lastRowIndexValue + 1
    }

    const newRowId = new RowId(
      Math.floor((1 + Math.random()) * 0x10000000000000000)
    );
    const newCells = new Map<string, Cell>();
    const newIndex = new CellValue(x)
    const newDisplay = new CellDisplay(x)
    for (const [colId, cell] of target.getCells().entries()) {
      if (colId == "index") {
        newCells.set(
          colId,
          new Cell(
            newRowId,
            new ColumnId(colId),
            newIndex,
            newIndex,
            newDisplay
          )
        );
      } else {
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

    }

    const newRow = new Row(
      newRowId,
      newCells,
      new RowState(RowStateEnum.Added),
      new Set(),
      target.moreDetails,
      target.visibilityCondition,
      target.rowType,
      target.isSaveDescription
    );
    rowsArray.sort((a, b) =>
      (a.getCell("index")?.getValue().value as number) -
      (b.getCell("index")?.getValue().value as number)
    );

    rowsArray.splice(placeIndex + 1, 0, newRow);

    this.rows = new Map(
      rowsArray.map(r => [r.id.value, r])
    );

    return new RowAdded(newRowId);
  }


  addNewRow(data?: KeyValue[]): RowAdded {
    const newRowId = new RowId(
      Math.floor((1 + Math.random()) * 0x10000000000000000)
    );

    const rowId = new RowId(newRowId.value);
    const cells = new Map<string, Cell>();

      const dataMap = data
      ? new Map(data.map(kv => [kv.key, kv]))
      : undefined;

    this.getColumns().forEach((column) => {
      const columnId = column.id;

      let value: unknown = null;
      let display: unknown = null;

      if (columnId === "index") {
        value = this.rows.size + 1;
        display = this.rows.size + 1;
      } else if (dataMap?.has(columnId)) {
        const item = dataMap.get(columnId);
        value = item?.value;
        display = item?.display;
      }

     

      const cellValue = new CellValue(value);
      const cellDisplay = new CellValue(display);
      const cell = new Cell(
        rowId,
        new ColumnId(columnId),
        cellValue,
        cellValue,
        cellDisplay
      );

      cells.set(columnId, cell);
    });

    const visibilityCondition: Record<string, boolean> = {};

    const newRow = new Row(
      newRowId,
      cells,
      new RowState(RowStateEnum.Added),
      new Set(),
      undefined,
      visibilityCondition,
      this.activeTableType,
      false
    );

    this.rows.set(newRowId.value, newRow);

    // ✅ pagination update
    const totalRows = this.rows.size;
    const pageSize = this.pagination.pageSize;
    const lastPage = Math.ceil(totalRows / pageSize);
    this.changePage(lastPage);

    return new RowAdded(newRowId);
  }
  addNewRows(cmd: { rows: KeyValue[][], detailFieldKey: string }): RowAdded[] {
    const events: RowAdded[] = [];
    const rows = this.getRows();
    const existingValues = new Set(
      rows.map(r => {
        const cell = r.getCell(cmd.detailFieldKey);
        return cell?.getValue()?.value;
      })
    );
    for (const data of cmd.rows) {
      const incomingValue = data.find(kv => kv.key === cmd.detailFieldKey)?.value;
      if (incomingValue !== undefined && !existingValues.has(incomingValue)) {
        const event = this.addNewRow(data);
        events.push(event);
        existingValues.add(incomingValue);
      }
    }
    return events;
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
          rules: incoming.rules,
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
  setTableAction(action: TableActions) {
    this.action = action
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
    const filteredRows = this.getRows().filter(r => r.rowType === this.activeTableType);
    const start = (this.pagination.page - 1) * this.pagination.pageSize;
    const end = start + this.pagination.pageSize;
    return filteredRows.slice(start, end);
  }
  getTableAction() {
    return this.action
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
      return new MinimumRowConstraintViolated(rowId);
    }
    if (row.rowState.value == RowStateEnum.Added && this.rows.size > 1) {
      this.rows.delete(rowId.value);
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
      (a.getCell('index')?.getValue().value as number) -
      (b.getCell('index')?.getValue().value as number)
    )
    const fromIndex = rowsArray.findIndex(r => r.id.value === draggedRowNum);
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
    let newIndex: number;
    if (insertIndex === 0) {
      newIndex = rowsArray[0]?.getCell("index")?.getValue().value as number / 2;
    } else if (insertIndex >= rowsArray.length) {
      const lastIndex = rowsArray[rowsArray.length - 1]?.getCell("index")?.getValue().value as number;
      newIndex = lastIndex + 1;
    } else {
      const prevRow = rowsArray[insertIndex - 1];
      const nextRow = rowsArray[insertIndex];
      const prevIndex = prevRow.getCell("index")?.getValue().value as number;
      const nextIndex = nextRow.getCell("index")?.getValue().value as number;
      newIndex = (prevIndex + nextIndex) / 2;
    }

    moved.changeCell(
      new ColumnId("index"),
      newIndex,
    );
    rowsArray.splice(insertIndex, 0, moved);
    this.rows = new Map(rowsArray.map(r => [r.id.value, r]));
    moved.updateChangeFields(new ColumnId("index"))
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
      const cloned = new Table(this.id, clonedRows, clonedColumns, this.pagination, null, this.activeTableType);
      cloned.pagination = this.pagination;
      return cloned;
    }

  }
}
