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
  value: string | number;
};
export type KeyValue = {
  key: string;
  value: unknown;
  display: unknown;
};

export type IRule = {
  type?: string | 'array' | 'object' | 'enum' | 'date' | 'number' | 'integer' | 'float' | 'boolean' | 'email' | 'url' | 'hex' | RegExp;
  required?: boolean;
  whitespace?: boolean;
  message?: string;
  transform?: (value: any) => any;
  pattern?: string | RegExp;
  min?: number;
  max?: number;
  len?: number;
  enum?: any[];
  validator?: (rule: IRule, value: any, callback: (error?: string[]) => void) => void | Promise<void>;
  asyncValidator?: (rule: IRule, value: any) => Promise<void>;
  warningOnly?: boolean;
  validateTrigger?: string | string[];
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
export type TableActions = "copy" | "cut" | "paste" | "pasteInsert" | null


export class Pagination {
  public readonly totalRows: number;
  public readonly totalPages: number;
  public readonly canPrev: boolean;
  public readonly canNext: boolean;

  constructor(
    public readonly page: number,
    public readonly pageSize: number,
    totalRows: number
  ) {
    this.totalRows = totalRows;
    this.totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    this.canPrev = page > 1;
    this.canNext = page < this.totalPages;
  }

  changePage(page: number): Pagination {
    return new Pagination(page, this.pageSize, this.totalRows);
  }
  changePageSize(size: number): Pagination {
    return new Pagination(
      Math.min(this.page, Math.ceil(this.totalRows / size)),
      size,
      this.totalRows
    );
  }

  toJSON() {
    return {
      page: this.page,
      pageSize: this.pageSize,
      totalRows: this.totalRows,
      totalPages: this.totalPages,
      canPrev: this.canPrev,
      canNext: this.canNext,
    };
  }
}