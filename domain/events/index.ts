//domain/events
import {
  CellValue,
  ColumnId,
  RowId,
} from '../value-objects';

export class TablePageChanged {
  constructor(
    public readonly page: number,
    public readonly pageSize: number
  ) {}
}


export class CellChanged {
  readonly type = 'CELL_CHANGED';
  constructor(
    public readonly rowId: RowId,
    public readonly columnId: ColumnId,
    public readonly newValue: unknown,
    public readonly previousValue: unknown,
  ) { }
}
export class DisplayChanged {
  readonly type = 'DISPLAY_CHANGED';
  constructor(
    public readonly rowId: RowId,
    public readonly columnId: ColumnId,
    public readonly newValue: unknown
  ) { }
}
export class DescriptionSaved {
  readonly type = 'DESCRIPTION_SAVED';
  constructor(
    public readonly rowId: RowId,
    public readonly flag: boolean,
 
  ) { }
}
export class Validated {
  readonly type = 'CELL_VALIDATED';
  constructor(
    public readonly rowId: RowId,
    public readonly columnId: ColumnId,
    public readonly valid: boolean,
    public readonly error: string
  ) { }
}

export class ColumnReordered {
  readonly type = "COLUMN_REORDERED";
  constructor(
    public readonly sourceIndex: number,
    public readonly destIndex: number
  ) { }
}

export class DynamicDataRequested {
  readonly type = 'DYNAMIC_DATA_REQUESTED';

  constructor(
    public readonly sourceColumn: ColumnId,
    public readonly value: CellValue
  ) { }
}

export type PageChanged = { type: "PageChanged"; payload: { page: number; }; };

export class RowAdded {
  readonly type = 'ROW_ADDED';
  constructor(public readonly rowId: RowId) { }
}
export class NewRowAdded {
  readonly type = 'NEW_ROW_ADDED';

  constructor(public readonly rowId: RowId,
    public readonly initialValues: Record<string, unknown>
  ) { }
}

export class RowDeleted {
  readonly type = "ROW_DELETED";
  constructor(public readonly rowId: RowId) { }
}
export class RowRemoved {
  readonly type = "NEW_ROW_REMOVED";
  constructor(public readonly rowId: RowId) { }
}
export class MinimumRowConstraintViolated {
  readonly type = "NEW_AND_FIRST_ROW_CAN_NOT_BE_REMOVE";
  constructor(public readonly rowId: RowId) { }
}


export class RowRestored {
  readonly type = "ROW_RESTORED";
  constructor(public readonly rowId: RowId) { }
}

export class RowReordered {
  readonly type = "ROW_REORDERED";
  constructor(
    public readonly draggedRowNum: number,
    public readonly droppedRowNum: number
  ) { }
}

export class RowExpanded {
  constructor(public readonly rowId: RowId) {}
}
export class RowCollapsed {
  constructor(public readonly rowId: RowId) {}
}