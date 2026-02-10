import { IRequestConfig } from '@type/elementType';

import { UITableController } from '../../adapters/ui/UITableController';
import { FieldType } from '../../bootstrap/type';
import {
  ItemType,
  TCell,
} from '../../engine/type';

//domain/value-object
export class CellValue {
  constructor(public readonly value: unknown) { }

  equals(other: CellValue) {
    return this.value === other.value;
  }
}
export class CellDisplay {
  constructor(public readonly value: unknown) { }

  equals(other: CellDisplay) {
    return this.value === other.value;
  }
}

export class ColumnId {
  constructor(public readonly value: string) { }

  equals(other: ColumnId) {
    return this.value === other.value;
  }
}
export type SelectOption = {
  label: string;
  value: string;
};

export type ColumnSchema = {
  id: string;
  title: string;
  renderType: FieldType;
  selectOptions?: SelectOption[];
  hidden?: boolean;
  required?: boolean;
  dynamicValue?: IRequestConfig
  editable?: boolean;
  indexOptions?: (tableId: string, rowId: number, row: { id: string | number; cells: Record<string, TCell>; isExpanded: boolean }, controller: UITableController) => ItemType[];
  displayFormat?: (value: unknown) => unknown
  // در ادامه: validator, lookup, formula, dynamicRules...
};

export class RowId {
  constructor(public value: number) { }
  equals(other: RowId) {
    return this.value === other.value;
  }
  set(id: RowId) {
    this.value = id.value
  }
}
export class TableId {
  constructor(public value: string) { }
  equals(other: TableId) {
    return this.value === other.value;
  }
  set(id: TableId) {
    this.value = id.value
  }
}
export class RowState {
  constructor(public value: RowStateEnum) { }
  equals(other: RowStateEnum) {
    return this.value === other;
  }
  set(rowState: RowStateEnum) {
    this.value = rowState
  }
}

export enum RowStateEnum {
  Added = "Add",
  Modified = "Update",
  Deleted = "Delete",
  Unchanged = "None",
}
export enum RowOriginEnum {
  Persisted = "Add",
  New = "Update",

}

export class Pagination {
  constructor(
    public readonly page: number,
    public readonly pageSize: number
  ) {}

  changePage(page: number): Pagination {
    return new Pagination(page, this.pageSize);
  }

  changePageSize(size: number): Pagination {
    return new Pagination(100, size);
  }
}