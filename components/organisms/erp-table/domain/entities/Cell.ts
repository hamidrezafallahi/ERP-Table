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
  private listeners = new Set<(newValue: CellValue) => void>();

  constructor(
    public readonly rowId: RowId,
    public readonly columnId: ColumnId,
    private value: CellValue,
    private originalValue: CellValue,
    private display: CellDisplay
  ) {}

  // اضافه کردن subscribe
  subscribe(cb: (newValue: CellValue) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb); // unsubscribe
  }

  private notify(newValue: CellValue) {
    this.listeners.forEach(cb => {
      try {
        cb(newValue);
      } catch (err) {
        console.error('Error in cell listener', err);
      }
    });
  }

  changeValue(newValue: CellValue): CellChanged | null {
    if (this.value.equals(newValue)) return null;
    this.value = newValue;
    this.notify(newValue); // notify خودکار
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
    // معمولاً originalValue تغییر نمی‌کنه، اما اگر بخواهی notify می‌تونی uncomment کنی
    // this.notify(newValue);
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
