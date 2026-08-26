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
  ) { }
  changeValue(newValue: unknown): CellChanged | null {
    // if (this.value.equals(newValue)) return null;
    const previousValue = this.value.value;
    this.value = new CellValue(newValue);
    return new CellChanged(this.rowId, this.columnId, newValue, previousValue);
  }
  changeDisplay(newValue: unknown): DisplayChanged | null {
    if (this.display.value===newValue) return null;
    this.display = new CellValue(newValue);
    return new DisplayChanged(this.rowId, this.columnId, newValue);
  }

  changeOriginalValue(newValue: unknown): CellChanged | null {
    if (this.originalValue.value ===newValue) return null;
    const previousValue = this.originalValue.value;
    this.originalValue = new CellValue(newValue);
    return new CellChanged(this.rowId, this.columnId, newValue, previousValue);
  }

  getValue(): unknown {
    return this.value.value;
  }
  getValueObject(): CellValue {
    return this.value;
  }
  getDisplay(): unknown {
    return this.display.value;
  }
  getDisplayObject(): CellDisplay {
    return this.display;
  }
  getOriginalValue(): CellValue {
    return this.originalValue;
  }

  clone(): Cell {
    return new Cell(this.rowId, this.columnId, this.value, this.originalValue, this.display);
  }
}
