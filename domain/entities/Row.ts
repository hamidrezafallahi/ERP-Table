//domain/entities
import {
  CellChanged,
  DescriptionSaved,
  DisplayChanged,
} from '../events';
import {
  CellDisplay,
  CellValue,
  ColumnId,
  RowId,
  RowState,
  RowStateEnum,
} from '../value-objects';
import { Cell } from './Cell';

export class Row {

  constructor(
    public id: RowId,
    public cells: Map<string, Cell>,
    public rowState: RowState,
    public changeFields: Set<string> = new Set(),
    public visibilityCondition: Record<string, boolean>,
    public collection: string = "default",
    public isSaveDescription: boolean,
    /**
     * Host object for `rowData` (PR-82). Same reference — never deep-cloned —
     * so `ColumnDef.valueGetter` can read the original `TRow`.
     */
    public data?: unknown,
    /** Stable host id from `getRowId` (string). */
    public sourceId?: string,
  ) { }
  updateChangeFields(columnId: ColumnId): void {
    const cell = this.getCell(columnId.value);
    if (!cell) return;
    const value = cell.getValueObject();
    const originalValue = cell.getOriginalValue();
    if (this.rowState.value !== RowStateEnum.Added) {
      if (!value.equals(originalValue)) {
        this.changeFields.add(columnId.value);
      } else {
        this.changeFields.delete(columnId.value);
      }
      if (this.changeFields.size > 0) {
        this.rowState = new RowState(RowStateEnum.Modified)
      } else {
        this.rowState = new RowState(RowStateEnum.Unchanged)
      }
    }
  }

  getCollection(): string {
    return this.collection
  }
  setCollection(collection:string) {
      this.collection = collection
  }
  getChangeFields(): readonly string[] {
    return Array.from(this.changeFields);
  }
  getSnapshotChangeFields(): readonly string[] {
    return Array.from(this.changeFields).map(field =>
      field.replace("index", "RowNum")
    );
  }
  changeCell(
    columnId: ColumnId,
    value:  unknown
  ): CellChanged | null {
    const cell = this.getCell(columnId.value);
    if (!cell) return null;
    return cell.changeValue(value);
  }
  saveDescription(
    flag: boolean,

  ): DescriptionSaved {
    this.isSaveDescription = flag
    return new DescriptionSaved( this.id,flag)   
  }
  changeDisplay(
    columnId: ColumnId,
    value: unknown
  ): DisplayChanged | null {
    const cell = this.getCell(columnId.value);
    if (!cell) return null;
    return cell.changeDisplay(value);
  }
  getCells(): ReadonlyMap<string, Cell> {
    return new Map(this.cells);
  }

  /**
   * Return a cell without materializing from host `data` (PR-101).
   */
  peekCell(columnId: string): Cell | undefined {
    return this.cells.get(columnId);
  }

  /**
   * Lazy host cells (PR-101): when `rowData` left values on `data`, materialize
   * a Cell on first read and cache it.
   */
  getCell(columnId: string): Cell | undefined {
    const existing = this.cells.get(columnId);
    if (existing) return existing;
    if (!this.data || typeof this.data !== 'object') return undefined;
    if (columnId === 'index') return undefined;
    const record = this.data as Record<string, unknown>;
    if (!Object.prototype.hasOwnProperty.call(record, columnId)) {
      return undefined;
    }
    const value = record[columnId];
    const cell = new Cell(
      this.id,
      ColumnId.for(columnId),
      value,
      value,
      value,
    );
    this.cells.set(columnId, cell);
    return cell;
  }

  /**
   * Read a cell value without allocating a Cell when the host object still
   * holds the canonical value (PR-101 hot path for sort/filter/quick filter).
   */
  readValue(columnId: string): unknown {
    const existing = this.cells.get(columnId);
    if (existing) return existing.getValue();
    if (columnId === 'index') return undefined;
    if (this.data && typeof this.data === 'object') {
      const record = this.data as Record<string, unknown>;
      if (Object.prototype.hasOwnProperty.call(record, columnId)) {
        return record[columnId];
      }
    }
    return undefined;
  }

  readDisplay(columnId: string): unknown {
    const existing = this.cells.get(columnId);
    if (existing) return existing.getDisplay();
    return this.readValue(columnId);
  }

  ensureCell(columnId: ColumnId, defaultValue: CellValue, displayValue: CellDisplay) {
    if (this.cells.has(columnId.value)) return;

    const newCell = new Cell(this.id, columnId, defaultValue, defaultValue, displayValue);
    this.cells.set(columnId.value, newCell);
  }
  setRowId(rowId: RowId) {
    this.id.set(rowId);
  }
 
  setVisibilityCondition(Condition: Record<string, boolean>) {
    this.visibilityCondition = Condition;
  }
  getVisibilityCondition(): Record<string, boolean> {
    return this.visibilityCondition
  }
 

  removeCell(columnId: ColumnId) {
    this.cells.delete(columnId.value);
  }


  setData(data: unknown): void {
    this.data = data;
  }

  getData(): unknown {
    return this.data;
  }

  clone(): Row {
    const clonedCells = new Map<string, Cell>();
    for (const [k, cell] of this.cells.entries()) {
      const clonedCell = cell.clone();
      clonedCells.set(k, clonedCell);
    }
    return new Row(
      this.id,
      clonedCells,
      this.rowState,
      this.changeFields,
      this.visibilityCondition,
      this.collection,
      this.isSaveDescription,
      this.data,
      this.sourceId,
    );
  }

}
