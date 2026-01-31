// application/commands/tableCommands.ts
 
export interface BaseTableCommand {
  readonly tableId: string;
}

export type Actor = {
  userId: string;
  roles: string[];
};

/**
 * Base invariant:
 * هر Command دقیقاً متعلق به یک Table است
 */

/* ---------- Cell ---------- */

export interface ChangeCellValueCommand extends BaseTableCommand {
  readonly type: 'CHANGE_CELL_VALUE';
  readonly rowId: number;
  readonly columnId: string;
  readonly newValue: unknown;
}


/* ---------- Row ---------- */

export interface AddEmptyRowCommand extends BaseTableCommand {
  readonly type: 'ADD_EMPTY_ROW';
}

export interface DuplicateRowCommand extends BaseTableCommand {
  readonly type: 'DUPLICATE_ROW';
  readonly rowId: number;
}

export interface DeleteRowCommand extends BaseTableCommand {
  readonly type: 'ROW_DELETED';
  readonly rowId: number;
  
}
export interface ExpandRowCommand extends BaseTableCommand {
  readonly type: 'ROW_EXPANDED';
  readonly rowId: number
}

export interface RowReorderedCommand extends BaseTableCommand {
  readonly type: 'ROW_REORDERED';
  readonly draggedRowId: number;
  readonly droppedRowId: number;
}
/* ---------- Column ---------- */

export interface ColumnReorderedCommand extends BaseTableCommand {
  readonly type: 'COLUMN_REORDERED';
  readonly sourceIndex: number;
  readonly destIndex: number;
}
/* ---------- Table ---------- */
export interface DeleteTableCommand extends BaseTableCommand {
  readonly type: 'TABLE_DELETED';

}
export interface ResetTableCommand extends BaseTableCommand {
  readonly type: 'TABLE_RESET';
  readonly rowId: string;

}

/* ---------- Pagination ---------- */

export interface ChangePageCommand extends BaseTableCommand {
  readonly type: 'CHANGE_PAGE';
  readonly page: number;
}

export interface ChangePageSizeCommand extends BaseTableCommand {
  readonly type: 'CHANGE_PAGE_SIZE';
  readonly pageSize: number;
}

/* ---------- Other ---------- */

export interface ChangeUnitLevelCommand extends BaseTableCommand {
  readonly type: 'SET_UNIT_LEVEL';
  readonly level: number;
}

/* ---------- Union ---------- */

export type TableCommand =
  | ChangeCellValueCommand
  | AddEmptyRowCommand
  | DuplicateRowCommand
  | DeleteRowCommand
  | DeleteTableCommand
  | ResetTableCommand
  | RowReorderedCommand
  | ColumnReorderedCommand
  | ChangePageCommand
  | ChangePageSizeCommand
  | ExpandRowCommand
  | ChangeUnitLevelCommand;
