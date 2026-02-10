// application/contracts/TableEvents.ts

/* ======================================================
   Base
   ====================================================== */

export interface BaseTableEvent {
  readonly tableId: string;
  readonly type: string;
}

/* ======================================================
   Cell Events
   ====================================================== */

export interface CellChangedEvent extends BaseTableEvent {
  type: 'CELL_CHANGED';
  rowId: number;
  columnId: string;
  newValue: unknown;
}
export interface CellDisplayChangedEvent extends BaseTableEvent {
  type: 'CELL_DISPLAY_CHANGED';
  rowId: number;
  columnId: string;
  newValue: unknown;
}

/* ======================================================
   Row Events
   ====================================================== */

export interface RowAddedEvent extends BaseTableEvent {
  type: 'ROW_ADDED';
  rowId: string;
}

export interface NewRowAddedEvent extends BaseTableEvent {
  type: 'NEW_ROW_ADDED';
  rowId: string;
}

export interface RowDeletedEvent extends BaseTableEvent {
  type: 'ROW_DELETED';
  rowId: string;
}

export interface RowRestoredEvent extends BaseTableEvent {
  type: 'ROW_RESTORED';
  rowId: string;
}

export interface RowReorderedEvent extends BaseTableEvent {
  type: 'ROW_REORDERED';
  sourceIndex: number;
  destIndex: number;
}

/* ======================================================
   Column Events
   ====================================================== */

export interface ColumnReorderedEvent extends BaseTableEvent {
  type: 'COLUMN_REORDERED';
  sourceIndex: number;
  destIndex: number;
}

export interface UnitColumnAddedEvent extends BaseTableEvent {
  type: 'UNIT_COLUMN_ADDED';
  reason: string;
  details?: unknown;
}

/* ======================================================
   Pagination / View Events
   ====================================================== */

export interface PageChangedEvent extends BaseTableEvent {
  type: 'PAGE_CHANGED';
  page: number;
}
export interface PageSizeChangedEvent extends BaseTableEvent {
  type: 'PAGE_SIZE_CHANGED';
  tableId:string
  pageSize: number;
}
export interface TableDeletedEvent extends BaseTableEvent {
  type: 'TABLE_DELETED';
  tableId:string
}
export interface TableResetEvent extends BaseTableEvent {
  type: 'TABLE_RESET';
  tableId:string
}

export interface RowsLoadedEvent extends BaseTableEvent {
  type: 'ROWS_LOADED';
  count: number;
}

/* ======================================================
   Dynamic / Async Events
   ====================================================== */

export interface DynamicDataRequestedEvent extends BaseTableEvent {
  type: 'DYNAMIC_DATA_REQUESTED';
  requestId: string;
  sourceColumn: string;
  value: unknown;
}

/* ======================================================
   Error Events
   ====================================================== */

export interface ValidationFailedEvent extends BaseTableEvent {
  type: 'VALIDATION_FAILED';
  reason: string;
  details?: unknown;
}

/* ======================================================
   Union
   ====================================================== */

export type TableEvent =
  | CellChangedEvent
  | CellDisplayChangedEvent
  | RowAddedEvent
  | NewRowAddedEvent
  | RowDeletedEvent
  | RowRestoredEvent
  | RowReorderedEvent
  | ColumnReorderedEvent
  | UnitColumnAddedEvent
  | PageChangedEvent
  | PageSizeChangedEvent
  | RowsLoadedEvent
  | DynamicDataRequestedEvent
  | ValidationFailedEvent
  | TableDeletedEvent
  | TableResetEvent;
