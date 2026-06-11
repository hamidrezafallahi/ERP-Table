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
    public moreDetails: unknown,
    public visibilityCondition: Record<string, boolean>,
    public rowType: string = "default",
    public isSaveDescription: boolean
  ) { }
  updateChangeFields(columnId: ColumnId): void {
    const cell = this.cells.get(columnId.value);
    if (!cell) return;
    const value = cell.getValue();
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

  getRowType(): string {
    return this.rowType
  }
  setRowType(type:string) {
      this.rowType = type
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
    const cell = this.cells.get(columnId.value);
    if (!cell) return null;
        console.log("here",columnId.value,value)
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
    const cell = this.cells.get(columnId.value);
    if (!cell) return null;
    return cell.changeDisplay(value);
  }
  getCells(): ReadonlyMap<string, Cell> {
    return new Map(this.cells);
  }
  getCell(columnId: string): Cell {
    return this.cells.get(columnId)
  }
  ensureCell(columnId: ColumnId, defaultValue: CellValue, displayValue: CellDisplay) {
    if (this.cells.has(columnId.value)) return;

    const newCell = new Cell(this.id, columnId, defaultValue, defaultValue, displayValue);
    this.cells.set(columnId.value, newCell);
  }
  setRowId(rowId: RowId) {
    this.id.set(rowId);
  }
  setMoreDetails(detail: unknown) {
    this.moreDetails = detail;
  }
  setVisibilityCondition(Condition: Record<string, boolean>) {
    this.visibilityCondition = Condition;
  }
  getVisibilityCondition(): Record<string, boolean> {
    return this.visibilityCondition
  }
  getMoreDetails() {
    return this.moreDetails;
  }

  removeCell(columnId: ColumnId) {
    this.cells.delete(columnId.value);
  }


  clone(): Row {
    const clonedCells = new Map<string, Cell>();
    for (const [k, cell] of this.cells.entries()) {
      const clonedCell = cell.clone();
      clonedCells.set(k, clonedCell);
    }
    return new Row(this.id, clonedCells, this.rowState, this.changeFields, this.moreDetails, this.visibilityCondition, this.rowType,this.isSaveDescription);
  }

}
