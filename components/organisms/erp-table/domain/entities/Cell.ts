// domain/entities/Cell.ts
import {
  CellChanged,
  DisplayChanged,
} from '../events';
import {
  CellDisplay,
  CellValue,
  ColumnId,
  RowId,
} from '../value-objects';

export class Cell {
  constructor(
    public readonly rowId: RowId,
    public readonly columnId: ColumnId,
    private value: CellValue,
    private originalValue: CellValue,
    private display: CellDisplay
  ) {}
  changeValue(newValue: CellValue): CellChanged | null {
    // if (this.value.equals(newValue)) return null;
    this.value = newValue;
    return new CellChanged(this.rowId, this.columnId, newValue);
  }

  changeDisplay(newValue: CellValue): DisplayChanged | null {
    if (this.display.equals(newValue)) return null;
    this.display = newValue;
    return new DisplayChanged(this.rowId, this.columnId, newValue);
  }

  changeOriginalValue(newValue: CellValue): CellChanged | null {
    if (this.originalValue.equals(newValue)) return null;
    this.originalValue = newValue;
    return new CellChanged(this.rowId, this.columnId, newValue);
  }

  getValue(): CellValue {
    return this.value;
  }
  getDisplay(): CellValue {
    return this.display;
  }
  getOriginalValue(): CellValue {
    return this.originalValue;
  }

  clone(): Cell {
    return new Cell(this.rowId, this.columnId, this.value, this.originalValue, this.display);
  }
 }
