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

function unwrap(value: unknown): unknown {
  if (value instanceof CellValue) return value.value;
  if (value instanceof CellDisplay) return value.value;
  return value;
}

/**
 * Domain cell. Stores primitives (PR-101) — `CellValue` / `CellDisplay`
 * wrappers are allocated only when callers ask for value objects.
 */
export class Cell {
  private value: unknown;
  private originalValue: unknown;
  private display: unknown;

  constructor(
    public readonly rowId: RowId,
    public readonly columnId: ColumnId,
    value: unknown,
    originalValue: unknown,
    display: unknown,
  ) {
    this.value = unwrap(value);
    this.originalValue = unwrap(originalValue);
    this.display = unwrap(display);
  }

  changeValue(newValue: unknown): CellChanged | null {
    const previousValue = this.value;
    this.value = unwrap(newValue);
    return new CellChanged(this.rowId, this.columnId, this.value, previousValue);
  }

  changeDisplay(newValue: unknown): DisplayChanged | null {
    const next = unwrap(newValue);
    if (this.display === next) return null;
    this.display = next;
    return new DisplayChanged(this.rowId, this.columnId, next);
  }

  changeOriginalValue(newValue: unknown): CellChanged | null {
    const next = unwrap(newValue);
    if (this.originalValue === next) return null;
    const previousValue = this.originalValue;
    this.originalValue = next;
    return new CellChanged(this.rowId, this.columnId, next, previousValue);
  }

  getValue(): unknown {
    return this.value;
  }

  getValueObject(): CellValue {
    return new CellValue(this.value);
  }

  getDisplay(): unknown {
    return this.display;
  }

  getDisplayObject(): CellDisplay {
    return new CellDisplay(this.display);
  }

  getOriginalValue(): CellValue {
    return new CellValue(this.originalValue);
  }

  clone(): Cell {
    return new Cell(
      this.rowId,
      this.columnId,
      this.value,
      this.originalValue,
      this.display,
    );
  }
}
