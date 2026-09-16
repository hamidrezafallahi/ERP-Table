import type { ColumnSchema } from '../types/ColumnSchema';
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
  KeyValue,
  Pagination,
  RowId,
  RowState,
  RowStateEnum,
  TableActions,
} from '../value-objects';
import { Cell } from './Cell';
import { Collection } from './Collection';
import { Row } from './Row';

export type CollectionScope = 'active' | 'all' | string[];

export class Table {
  constructor(
    public readonly id: string,
    private collection: Map<string, Collection>,
    private pagination: Pagination,
    private action: TableActions,
    private activeCollection: string = 'default'
  ) { }

  // ─── Collection accessor helper ───────────────────────────────────────────

  private getActiveCollection(): Collection {
    const collection = this.collection.get(this.activeCollection);
    if (!collection) throw new Error(`Collection "${this.activeCollection}" not found`);
    return collection;
  }
  private getCollection(collectionName: string): Collection {
    const collection = this.collection.get(collectionName);
    if (!collection) throw new Error(`Collection "${collectionName}" not found`);
    return collection;
  }
  /** Finds which Collection currently owns a given column id (if any). */
  private findCollectionForColumn(columnKey: string): Collection | undefined {
    for (const col of this.collection.values()) {
      if (col.getColumns().has(columnKey)) return col;
    }
    return undefined;
  }

  getCollections(): Map<string, Collection> {
    return this.collection;
  }

  // ─── Column helpers ───────────────────────────────────────────────────────

  getColumnSchema(columnId: ColumnId): ColumnSchema | undefined {
    return this.getActiveCollection().getColumns().get(columnId.value);
  }

  getActiveCollectionName(): string {
    return this.activeCollection;
  }

  setActiveCollection(activeCollection: string): void {
    this.activeCollection = activeCollection;
  }

  getRowCollection(rowId: number): string | undefined {
    return this.getActiveCollection().getRows().get(rowId)?.getCollection();
  }

  setRowCollection(rowId: number, collection: string): void {
    this.getActiveCollection().getRows().get(rowId)?.setCollection(collection);
  }

  setColumnSchema(columnId: ColumnId, DetailColumnConfig: ColumnSchema): ColumnSchema | undefined {
    const prev = this.getActiveCollection().getColumns().get(columnId.value);
    this.getActiveCollection().getColumns().set(columnId.value, DetailColumnConfig);
    return prev;
  }

  getColumns(): ColumnSchema[] {
    return Array.from(this.getActiveCollection().getColumns().values());
  }
  getActiveCollectionColumns(): ColumnSchema[] {
    const allColumns = this.getActiveCollection().getColumns();
    return Array.from(allColumns.values()).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
  }

  getColumnsForCollectionScope(collectionScope: CollectionScope = 'active'): ColumnSchema[] {
    if (collectionScope === 'active') return this.getActiveCollectionColumns();

    const names = collectionScope === 'all' ? Array.from(this.collection.keys()) : collectionScope;
    const merged = new Map<string, ColumnSchema>();
    for (const name of names) {
      for (const [id, col] of this.getCollection(name).getColumns()) {
        merged.set(id, col);
      }
    }
    return Array.from(merged.values());
  }
  getColumnValues(colId: string): unknown[] {
    const result: unknown[] = [];
    for (const row of this.getActiveCollection().getRows().values()) {
      const cell = row.getCell(colId);
      if (!cell) continue;
      result.push(cell.getValue());
    }
    return result;
  }

  setColumns(newColumns: ColumnSchema[]): void {
    // Snapshot before clear — getColumns() returns the live Map reference.
    const existingByField = new Map(this.getActiveCollection().getColumns());
    for (const col of this.collection.values()) {
      col.getColumns().clear();
    }

    for (const col of newColumns) {
      const existing = existingByField.get(col.fieldName);
      const targetCollectionKey = col.fieldCollection ?? this.activeCollection;
      const updatedCol: ColumnSchema = {
        ...col,
        fieldCollection: targetCollectionKey,
        // Prefer explicit hidden from caller; otherwise keep persisted visibility.
        hidden: col.hidden ?? existing?.hidden ?? false,
        // PR-61: keep user/domain order across host schema refresh.
        order: existing?.order ?? col.order,
      };
      const targetCollection = this.collection.get(targetCollectionKey);
      if (targetCollection) {
        targetCollection.getColumns().set(col.fieldName, updatedCol);
      }
    }

    for (const row of this.getActiveCollection().getRows().values()) {
      for (const col of newColumns) {
        if (!row.getCells().has(col.fieldName)) {
          const defaultValue = col.fieldType === 'number' ? new CellValue(0) : new CellValue('');
          const defaultDisplay = col.fieldType === 'number' ? new CellValue(0) : new CellValue('');
          row.ensureCell(new ColumnId(col.fieldName), defaultValue, defaultDisplay);
        }
      }
    }
  }


  // ─── Cell mutations ───────────────────────────────────────────────────────

  changeCell(rowId: RowId, columnId: ColumnId, value: unknown): CellChanged | null {
    const row = this.getActiveCollection().getRows().get(rowId.value);
    if (!row) return null;
    const ev = row.changeCell(columnId, value);
    if (ev) row.updateChangeFields(columnId);
    return ev;
  }

  changeDisplay(rowId: RowId, columnId: ColumnId, value: unknown): DisplayChanged | null {
    const row = this.getActiveCollection().getRows().get(rowId.value);
    if (!row) return null;
    return row.changeDisplay(columnId, value);
  }

  saveDescription(rowId: RowId, flag: boolean): DescriptionSaved | null {
    const row = this.getActiveCollection().getRows().get(rowId.value);
    if (!row) return null;
    return row.saveDescription(flag);
  }

  // ─── Row operations ───────────────────────────────────────────────────────

  duplicateRow(rowId: RowId): RowAdded {
    const col = this.getActiveCollection();
    const target = col.getRows().get(rowId.value);
    if (!target) throw new Error('Row not found');

    const rowsArray = Array.from(col.getRows().values());
    const targetIndex = rowsArray.findIndex(r => r.id.value === rowId.value);
    const nextRow = targetIndex < rowsArray.length - 1 ? rowsArray[targetIndex + 1] : undefined;

    const targetIndexValue = target.getCell('index')?.getValue() as number;
    let x: number;
    if (!nextRow) {
      x = targetIndexValue + 1;
    } else {
      const nextIndexValue = nextRow.getCell('index')?.getValue() as number;
      x = (targetIndexValue + nextIndexValue) / 2;
    }

    const newRowId = new RowId(Math.floor((1 + Math.random()) * 0x10000000000000000));
    const newCells = new Map<string, Cell>();
    const newIndex = new CellValue(x);
    const newDisplay = new CellDisplay(x);

    for (const [colId, cell] of target.getCells().entries()) {
      if (colId === 'index') {
        newCells.set(colId, new Cell(newRowId, new ColumnId(colId), newIndex, newIndex, newDisplay));
      } else {
        newCells.set(
          colId,
          new Cell(
            newRowId,
            new ColumnId(colId),
            cell.getValueObject(),
            cell.getValueObject(),
            cell.getDisplayObject(),
          )
        );
      }
    }

    const newRow = new Row(
      newRowId,
      newCells,
      new RowState(RowStateEnum.Added),
      new Set(),
      target.visibilityCondition,
      target.collection,
      target.isSaveDescription
    );

    rowsArray.sort(
      (a, b) =>
        (a.getCell('index')?.getValue() as number) -
        (b.getCell('index')?.getValue() as number)
    );
    rowsArray.splice(targetIndex + 1, 0, newRow);
    col.setRows(new Map(rowsArray.map(r => [r.id.value, r])));

    return new RowAdded(newRowId);
  }

  addRow(targetRowId: number, placedRowId?: number): RowAdded {
    const col = this.getActiveCollection();
    const target = col.getRows().get(targetRowId);
    if (!target) throw new Error('Row not found');

    const rowsArray = Array.from(col.getRows().values()).sort(
      (a, b) =>
        (a.getCell('index')?.getValue() as number) -
        (b.getCell('index')?.getValue() as number)
    );

    let placeIndex: number | undefined;
    let x = 0;

    if (placedRowId !== undefined) {
      placeIndex = rowsArray.findIndex(r => r.id.value === placedRowId);
      const placedRow = rowsArray[placeIndex];
      const placeIndexValue = placedRow?.getCell('index')?.getValue() as number;
      const nextRow = placeIndex < rowsArray.length - 1 ? rowsArray[placeIndex + 1] : undefined;
      if (nextRow) {
        const nextIndexValue = nextRow.getCell('index')?.getValue() as number;
        x = (placeIndexValue + nextIndexValue) / 2;
      } else {
        x = placeIndexValue + 1;
      }
    } else {
      const lastRowIndexValue = rowsArray[rowsArray.length - 1].getCell('index')?.getValue() as number;
      x = lastRowIndexValue + 1;
    }

    const newRowId = new RowId(Math.floor((1 + Math.random()) * 0x10000000000000000));
    const newCells = new Map<string, Cell>();
    const newIndex = new CellValue(x);
    const newDisplay = new CellDisplay(x);

    for (const [colId, cell] of target.getCells().entries()) {

      if (colId === "index") {
        newCells.set("index", new Cell(newRowId, new ColumnId("index"), newIndex, newIndex, newDisplay));
      } else {
        newCells.set(
          colId,
          new Cell(
            newRowId,
            new ColumnId(colId),
            cell.getValueObject(),
            cell.getValueObject(),
            cell.getDisplayObject(),
          )
        );
      }
    }

    const newRow = new Row(
      newRowId,
      newCells,
      new RowState(RowStateEnum.Added),
      new Set(),
      target.visibilityCondition,
      target.collection,
      target.isSaveDescription
    );

    rowsArray.splice((placeIndex ?? 0) + 1, 0, newRow);
    col.setRows(new Map<number, Row>(rowsArray.map(r => [r.id.value, r])));

    return new RowAdded(newRowId);
  }

  addNewRow(data?: KeyValue[]): RowAdded {
    const col = this.getActiveCollection();
    const newRowId = new RowId(Math.floor((1 + Math.random()) * 0x10000000000000000));
    const rowId = new RowId(newRowId.value);
    const cells = new Map<string, Cell>();

    const dataMap = data ? new Map(data.map(kv => [kv.key, kv])) : undefined;

    // getColumns() already returns the active collection columns.
    // Do not filter by fieldCollection === activeCollection: after reload /
    // setColumns, fieldCollection may be undefined and the filter would
    // create a row with zero cells (breaks validation + action clicks).
    this.getColumns().forEach(column => {
      const columnId = column.fieldName;
      let value: unknown = null;
      let display: unknown = null;
      if (columnId === "index") {
        const rows = Array.from(col.getRows().values());

        const maxIndex = rows.length
          ? Math.max(
            ...rows.map(r =>
              Number(r.getCell("index")?.getValue() ?? 0)
            )
          )
          : 0;

        value = maxIndex + 1;
        display = value;
      } else if (dataMap?.has(columnId)) {
        const item = dataMap.get(columnId);
        value = item?.value;
        display = item?.display;
      }

      const cellValue = new CellValue(value);
      const cellDisplay = new CellValue(display);
      cells.set(columnId, new Cell(rowId, new ColumnId(columnId), cellValue, cellValue, cellDisplay));
    });

    const newRow = new Row(
      newRowId,
      cells,
      new RowState(RowStateEnum.Added),
      new Set(),
      {} as Record<string, boolean>,
      this.activeCollection,
      false
    );

    col.getRows().set(newRowId.value, newRow);

    const totalRows = col.getRows().size;
    const lastPage = Math.ceil(totalRows / this.pagination.pageSize);
    this.changePage(lastPage);

    return new RowAdded(newRowId);
  }

  addNewRows(cmd: { rows: KeyValue[][]; detailFieldKey: string }): RowAdded[] {
    const events: RowAdded[] = [];
    const existingValues = new Set(
      this.getRows().map(r => r.getCell(cmd.detailFieldKey)?.getValue())
    );

    for (const data of cmd.rows) {
      const incomingValue = data.find(kv => kv.key === cmd.detailFieldKey)?.value;
      if (incomingValue !== undefined && !existingValues.has(incomingValue)) {
        events.push(this.addNewRow(data));
        existingValues.add(incomingValue);
      }
    }
    return events;
  }

  addColumns(newColumns: ColumnSchema[]): { added: ColumnId[] } {
    const added: ColumnId[] = [];
    const allColumns = this.getActiveCollection().getColumns();
    for (const incoming of newColumns) {
      const key = incoming.fieldName;
      const existing = allColumns.get(key);
      const targetCollectionKey = incoming.fieldCollection ?? this.activeCollection;
      const targetCollection = this.collection.get(targetCollectionKey);
      if (!targetCollection) continue;
      if (existing) {
        const shouldUnhide = existing.hidden === true;
        targetCollection.getColumns().set(key, {
          ...existing,
          editable: incoming.editable ?? existing.editable,
          hidden: shouldUnhide ? false : existing.hidden,
        });
        if (shouldUnhide) added.push(new ColumnId(incoming.fieldName));
        continue;
      }
       targetCollection.getColumns().set(key, {
        ...incoming,
        fieldCollection: targetCollectionKey,
        hidden: incoming.hidden ?? false,
      });
      added.push(new ColumnId(incoming.fieldName));

      for (const row of this.getActiveCollection().getRows().values()) {
        const defaultValue =
          incoming.fieldType === 'number' ? new CellValue(0) : new CellValue('');
        const defaultDisplay =
          incoming.fieldType === 'number' ? new CellValue(0) : new CellValue('');
        row.ensureCell(new ColumnId(incoming.fieldName), defaultValue, defaultDisplay);
      }
    }

    return { added };
  }

  setColumnHidden(columnId: string, hidden: boolean): boolean {
    const cols = this.getActiveCollection().getColumns();
    const existing = cols.get(columnId);
    if (!existing) return false;
    if (Boolean(existing.hidden) === hidden) return false;
    cols.set(columnId, { ...existing, hidden });
    return true;
  }

  /** Runtime pin on `columnDef.pinned` (PR-114). Index column is not mutable. */
  setColumnPinned(columnId: string, pinned: 'start' | 'end' | null): boolean {
    const cols = this.getActiveCollection().getColumns();
    const existing = cols.get(columnId);
    if (!existing) return false;
    const bridge = { ...(existing.columnDef ?? {}) };
    if (pinned == null) delete bridge.pinned;
    else bridge.pinned = pinned;
    const nextPinned = bridge.pinned ?? null;
    const prevPinned = existing.columnDef?.pinned ?? null;
    if (nextPinned === prevPinned) return false;
    cols.set(columnId, { ...existing, columnDef: bridge });
    return true;
  }

  removeColumns(columnIds: ColumnId[]): { removed: ColumnId[] } {
    const removed: ColumnId[] = [];
    for (const colId of columnIds) {
      const ownerCollection = this.findCollectionForColumn(colId.value);
      if (!ownerCollection) continue;
      const schema = ownerCollection.getColumns().get(colId.value);
      if (!schema || schema.hidden) continue;
      ownerCollection.getColumns().set(colId.value, { ...schema, hidden: true });
      removed.push(colId);
    }
    return { removed };
  }

  // ─── Row reads ────────────────────────────────────────────────────────────


  getRows(collectionScope: CollectionScope = 'active'): Row[] {
    if (collectionScope === 'all') {
      const rows: Row[] = [];
      for (const col of this.collection.values()) {
        rows.push(...col.getRows().values());
      }
      return rows;
    }

    if (Array.isArray(collectionScope)) {
      const rows: Row[] = [];
      for (const name of collectionScope) {
        const collection = this.getCollection(name);
        rows.push(...collection.getRows().values());
      }
      return rows;
    }

    return Array.from(this.getActiveCollection().getRows().values());
  }
  getCollectionsRows(collections: string[]): Row[] {
    const rows: Row[] = [];
    for (const name of collections) {
      const collection = this.getCollection(name);
      rows.push(...collection.getRows().values());
    }
    return rows;
  }

  getRow(rowId: number): Row | undefined {
    return this.getActiveCollection().getRows().get(rowId);
  }

  /** Host `rowData` sync (PR-82) — put without going through add/undo. */
  hostPutRow(row: Row): void {
    this.getActiveCollection().getRows().set(row.id.value, row);
  }

  /** Host `rowData` sync (PR-82) — drop to match the host array. */
  hostRemoveRow(rowId: number): void {
    this.getActiveCollection().getRows().delete(rowId);
  }

  addRows(newRows: Row[]): void {
    const rows = this.getActiveCollection().getRows();
    newRows.forEach(r => rows.set(r.id.value, r));
  }

  // ─── Pagination ───────────────────────────────────────────────────────────

  getPagination(): Pagination {
    return this.pagination;
  }

  setPagination(pagination: Pagination): void {
    this.pagination = pagination;
  }

  changePage(page: number): void {
    this.pagination = this.pagination.changePage(page);
  }

  changePageSize(size: number): void {
    this.pagination = this.pagination.changePageSize(size).changePage(1);
  }

  getVisibleRows(): Row[] {
    const filteredRows = this.getRows().filter(r => r.collection === this.activeCollection);
    const start = (this.pagination.page - 1) * this.pagination.pageSize;
    return filteredRows.slice(start, start + this.pagination.pageSize);
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  setTableAction(action: TableActions): void {
    this.action = action;
  }

  getTableAction(): TableActions {
    return this.action;
  }

  // ─── Delete / restore ─────────────────────────────────────────────────────

  /**
   * Re-inserts a previously Added row after hard-remove (undo of ADD → redo).
   * Preserves rowId and cell values; no-ops if the id already exists.
   */
  restoreAddedRow(params: {
    rowId: number;
    cells: Readonly<
      Record<
        string,
        {
          readonly value: unknown;
          readonly display?: unknown;
          readonly originalValue?: unknown;
        }
      >
    >;
    collection?: string;
    isSaveDescription?: boolean;
  }): RowAdded {
    const col = this.getActiveCollection();
    const existing = col.getRows().get(params.rowId);
    if (existing) {
      return new RowAdded(existing.id);
    }

    const rowId = new RowId(params.rowId);
    const cells = new Map<string, Cell>();

    for (const [columnId, snap] of Object.entries(params.cells)) {
      const value = new CellValue(snap.value);
      const original = new CellValue(
        snap.originalValue !== undefined ? snap.originalValue : snap.value,
      );
      const display = new CellDisplay(
        snap.display !== undefined ? snap.display : snap.value,
      );
      cells.set(
        columnId,
        new Cell(rowId, new ColumnId(columnId), value, original, display),
      );
    }

    for (const column of this.getColumns()) {
      if (cells.has(column.fieldName)) continue;
      const empty = new CellValue(null);
      cells.set(
        column.fieldName,
        new Cell(
          rowId,
          new ColumnId(column.fieldName),
          empty,
          empty,
          new CellDisplay(null),
        ),
      );
    }

    const newRow = new Row(
      rowId,
      cells,
      new RowState(RowStateEnum.Added),
      new Set(),
      {} as Record<string, boolean>,
      params.collection ?? this.activeCollection,
      params.isSaveDescription ?? false,
    );

    col.getRows().set(rowId.value, newRow);
    return new RowAdded(rowId);
  }

  deleteRow(
    rowId: RowId
  ): RowDeleted | RowRestored | RowRemoved | MinimumRowConstraintViolated | null {
    const col = this.getActiveCollection();
    const rows = col.getRows();
    const row = rows.get(rowId.value);
    if (!row) return null;
    if (row.rowState.value === RowStateEnum.Added && rows.size === 1) {
      rows.delete(rowId.value);
      this.addNewRow();
      return new MinimumRowConstraintViolated(rowId);
    }

    if (row.rowState.value === RowStateEnum.Added && rows.size > 1) {
      rows.delete(rowId.value);
      return new RowRemoved(rowId);
    }

    if (row.rowState.value === RowStateEnum.Unchanged) {
      row.rowState = new RowState(RowStateEnum.Deleted);
      row.updateChangeFields(new ColumnId('RowState'));
      return new RowDeleted(rowId);
    }

    // Modified or Deleted → restore
    if (row.getChangeFields().length > 0) {
      row.rowState = new RowState(RowStateEnum.Modified);
    } else {
      row.rowState = new RowState(RowStateEnum.Unchanged);
    }
    row.updateChangeFields(new ColumnId('RowState'));
    return new RowRestored(rowId);
  }
  // ─── Reorder ──────────────────────────────────────────────────────────────
  reorderRows(
    draggedRowNum: number,
    droppedRowNum: number,
    position: 'before' | 'after' = 'after'
  ): RowReordered {
    if (draggedRowNum === droppedRowNum) return new RowReordered(draggedRowNum, droppedRowNum);

    const col = this.getActiveCollection();
    const rowsArray = Array.from(col.getRows().values()).sort(
      (a, b) =>
        (a.getCell('index')?.getValue() as number) -
        (b.getCell('index')?.getValue() as number)
    );

    const fromIndex = rowsArray.findIndex(r => r.id.value === draggedRowNum);
    const toIndex = rowsArray.findIndex(r => r.id.value === droppedRowNum);
    if (fromIndex === -1 || toIndex === -1)
      throw new Error(`Row ${draggedRowNum} or ${droppedRowNum} does not exist`);

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
      newIndex = (rowsArray[0]?.getCell('index')?.getValue() as number) / 2;
    } else if (insertIndex >= rowsArray.length) {
      newIndex = (rowsArray[rowsArray.length - 1]?.getCell('index')?.getValue() as number) + 1;
    } else {
      const prevIndex = rowsArray[insertIndex - 1].getCell('index')?.getValue() as number;
      const nextIndex = rowsArray[insertIndex].getCell('index')?.getValue() as number;
      newIndex = (prevIndex + nextIndex) / 2;
    }

    moved.changeCell(new ColumnId('index'), newIndex);
    rowsArray.splice(insertIndex, 0, moved);
    col.setRows(new Map(rowsArray.map(r => [r.id.value, r])));
    moved.updateChangeFields(new ColumnId('index'));

    return new RowReordered(draggedRowNum, droppedRowNum);
  }

  reorderColumns(sourceIndex: number, destIndex: number): ColumnReordered {
    // Reorder in display order (same as getActiveCollectionColumns), then
    // rewrite `order` so a later host setColumns does not hide the move.
    const activeCollection = this.getActiveCollection();
    const colsMap = activeCollection.getColumns();
    const colsArray = Array.from(colsMap.values()).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    const [moved] = colsArray.splice(sourceIndex, 1);
    if (!moved) {
      return new ColumnReordered(sourceIndex, destIndex);
    }
    colsArray.splice(destIndex, 0, moved);

    colsMap.clear();
    for (let i = 0; i < colsArray.length; i += 1) {
      const col = colsArray[i];
      if (!col) continue;
      colsMap.set(col.fieldName, { ...col, order: i });
    }

    return new ColumnReordered(sourceIndex, destIndex);
  }

  // ─── Clone ────────────────────────────────────────────────────────────────

  clone(): Table {
    const clonedCollection = new Map<string, Collection>();

    for (const [collectionName, col] of this.collection.entries()) {

      const clonedRows = new Map<number, Row>();

      for (const [k, row] of col.getRows().entries()) {
        clonedRows.set(k, row.clone());
      }

      clonedCollection.set(
        collectionName,
        new Collection(
          col.getCollectionName(),
          clonedRows,
          new Map(col.getColumns())
        )
      );
    }

    return new Table(
      this.id,
      clonedCollection,
      this.pagination,
      this.action,
      this.activeCollection
    );
  }
}