//domain/entities
import {
  CellChanged,
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
    private cells: Map<string, Cell>,
    public rowState: RowState,
    private changeFields: Set<string> = new Set(),
 


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

  getChangeFields(): readonly string[] {
    return Array.from(this.changeFields);
  }
  changeCell(
    columnId: ColumnId,
    value: CellValue
  ): CellChanged | null {
    const cell = this.cells.get(columnId.value);
    if (!cell) return null;
    return cell.changeValue(value);
  }
  changeDisplay(
    columnId: ColumnId,
    value: CellValue
  ): DisplayChanged | null {
    const cell = this.cells.get(columnId.value);
    if (!cell) return null;
    return cell.changeDisplay(value);
  }
  getCells(): ReadonlyMap<string, Cell> {
    return new Map(this.cells);
  }
  getCell(columnId:string): Cell{
    return this.cells.get(columnId)
  }
  ensureCell(columnId: ColumnId, defaultValue: CellValue,displayValue:CellDisplay) {
    if (this.cells.has(columnId.value)) return;
    this.cells.set(columnId.value, new Cell(this.id, columnId, defaultValue, defaultValue,displayValue));
  }
  setRowId(rowId: RowId) {
    this.id.set(rowId);
  }

  removeCell(columnId: ColumnId) {
    this.cells.delete(columnId.value);
  }
  clone(): Row {
    const clonedCells = new Map<string, Cell>();
    for (const [k, cell] of this.cells.entries()) {
      clonedCells.set(k, cell.clone());
    }
    return new Row(this.id, clonedCells, this.rowState,this.changeFields );
  }
}
