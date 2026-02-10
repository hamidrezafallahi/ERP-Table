// application/commands/tableCommands.ts

import { Table } from '../../domain/entities/Table';

export interface BaseTableCommand {
  readonly store: string;
  readonly tableKey: string;
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

export interface MoveActiveCellCommand extends BaseTableCommand {
  readonly type: 'MOVE_ACTIVE_CELL';
  rowId: number;
  columnId: string;
  direction: 'next' | 'prev';
}
export interface MoveActiveCellVerticalCommand extends BaseTableCommand {
  readonly type: 'MOVE_ACTIVE_CELL_VERTICAL';
  rowId: number;
  columnId: string;
  direction: 'up' | 'down';
}
export interface ActiveCellCommand extends BaseTableCommand {
  readonly type: 'ACTIVE_CELL';
  rowId: number;
  columnId: string;
}
export interface ActiveRowCommand extends BaseTableCommand {
  readonly type: 'ACTIVE_ROW';
  rowId: number;
}
export interface ActiveFirstCellCommand extends BaseTableCommand {
  readonly type: 'ACTIVATE_FIRST_CELL';
  readonly rowId: number;

}

export interface ChangeCellValueCommand extends BaseTableCommand {
  readonly type: 'CHANGE_CELL_VALUE';
  readonly rowId: number;
  readonly columnId: string;
  readonly newValue: unknown;
}
export interface ChangeCellDisplayValueCommand extends BaseTableCommand {
  readonly type: 'CHANGE_CELL_DISPLAY_VALUE';
  readonly rowId: number;
  readonly columnId: string;
  readonly newValue: string;
}


/* ---------- Row ---------- */

export interface AddEmptyRowCommand extends BaseTableCommand {
  readonly type: 'ADD_EMPTY_ROW';
  readonly autoActivate: boolean;
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
  readonly tableKey: string,
  readonly rowId: number,
  readonly value: boolean

}
export interface ToggleRowCommand extends BaseTableCommand {
  readonly type: 'ROW_TOGGLED';
  readonly tableKey: string,
  readonly rowId: number

}

export interface RowReorderedCommand extends BaseTableCommand {
  readonly type: 'ROW_REORDERED';
  readonly draggedRowId: number;
  readonly droppedRowId: number;
  readonly position: 'before' | 'after';
}
export interface ToggleRowSelectionCommand extends BaseTableCommand {
  readonly type: 'ROW_SELECTION_TOGGLED';
  readonly rowId: number;

}
export interface SelectAllRowsCommand extends BaseTableCommand {
  readonly type: 'SELECT_ALL_ROWS';


}
export interface ClearRowSelectionCommand extends BaseTableCommand {
  readonly type: 'CLEAR_ROW_SELECTION';


}
export interface CollapseAllRowsCommand extends BaseTableCommand {
  readonly type: 'COLLAPSE_ALL_ROWS';

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
export interface RegisterTableCommand extends BaseTableCommand {
  readonly type: 'TABLE_REGISTERED';
  readonly store: string,
  readonly table: Table

}
export interface DisposeTableCommand extends BaseTableCommand {
  readonly type: 'TABLE_DISPOSED';
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
  ToggleRowCommand
  | CollapseAllRowsCommand
  | RegisterTableCommand
  | DisposeTableCommand
  | ToggleRowSelectionCommand
  | SelectAllRowsCommand
  | ClearRowSelectionCommand
  | ActiveCellCommand
  | ActiveRowCommand
  | MoveActiveCellCommand
  | MoveActiveCellVerticalCommand
  | ActiveFirstCellCommand
  | ChangeCellValueCommand
  | ChangeCellDisplayValueCommand
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
