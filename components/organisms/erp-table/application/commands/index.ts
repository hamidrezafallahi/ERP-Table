// application/commands/tableCommands.ts

import { Table } from '../../domain/entities/Table';

export interface BaseTableCommand {
  readonly store: string;
  readonly tableKey: string;
}

export type Actor = {
  readonly userId: string;
  readonly roles: string[];
};

/**
 * Base invariant:
 * هر Command دقیقاً متعلق به یک Table است
 */

/* ---------- Cell ---------- */

export interface MoveActiveCellCommand {
  readonly type: 'MOVE_ACTIVE_CELL';
  readonly tableKey: string;

  readonly rowId: number;
  readonly columnId: string;
  readonly direction: 'next' | 'prev';
}
export interface MoveActiveCellVerticalCommand {
  readonly type: 'MOVE_ACTIVE_CELL_VERTICAL';
  readonly tableKey: string;

  readonly rowId: number;
  readonly columnId: string;
  readonly direction: 'up' | 'down';
}
export interface MoveVerticalSelectedRows {
  readonly type: 'MOVE_VERTICAL_SELECTED_ROWS';
  readonly tableKey: string;
  readonly direction: 'up' | 'down';
}
export interface ActiveCellCommand {
  readonly type: 'ACTIVE_CELL';
  readonly tableKey: string;

  readonly rowId: number;
  readonly columnId: string;
}
export interface ActiveRowCommand {
  readonly type: 'ACTIVE_ROW';
  readonly tableKey: string;

  readonly rowId: number;
}
export interface ActiveFirstCellCommand {
  readonly type: 'ACTIVATE_FIRST_CELL';
  readonly tableKey: string;

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
export interface ExpandRowCommand {
  readonly type: 'ROW_EXPANDED';
  readonly tableKey: string,
  readonly rowId: number,
  readonly value: boolean

}
export interface SelectRowCommand {
  readonly type: 'ROW_SELECTED';
  readonly tableKey: string,
  readonly rowId: number,
}
export interface ToggleRowSelectionCommand {
  readonly type: "ROW_SELECTION_TOGGLED";
  readonly tableKey: string;
  readonly rowId: number;

}
export interface ToggleRowExpandCommand {
  readonly type: 'ROW_EXPAND_TOGGLED';
  readonly tableKey: string,
  readonly rowId: number

}
export interface SelectRangeCommand {
  readonly type: "ROW_RANGE_SELECTED";
  readonly tableKey: string;
  readonly rowId: number;
}
export interface SelectActiveRowToLastCommand {
  readonly type: "SELECT_FROM_ACTIVE_TO_LAST";
  readonly tableKey: string;
  readonly anchorRowId: number;
}
export interface RowReorderedCommand extends BaseTableCommand {
  readonly type: 'ROW_REORDERED';
  readonly draggedRowId: number;
  readonly droppedRowId: number;
  readonly position: 'before' | 'after';
}

export interface SelectAllRowsCommand {
  readonly type: 'TOGGLE_SELECT_ALL_ROWS';
  readonly tableKey: string;



}
export interface ClearRowSelectionCommand {
  readonly type: 'CLEAR_ROW_SELECTION';
  readonly tableKey: string;



}
export interface CollapseAllRowsCommand {
  readonly type: 'COLLAPSE_ALL_ROWS';
  readonly tableKey: string;


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
export interface ApplyDynamicProjectionCommand extends BaseTableCommand {
  readonly type: 'APPLY_DYNAMIC_PROJECTION';
  readonly tableKey: string;
  readonly rowId: number;
  readonly columnId: string;

}

/* ---------- Union ---------- */

export type TableCommand =
  SelectActiveRowToLastCommand
  | SelectRangeCommand
  | ToggleRowExpandCommand
  | SelectRowCommand
  | CollapseAllRowsCommand
  | RegisterTableCommand
  | DisposeTableCommand
  | ToggleRowSelectionCommand
  | SelectAllRowsCommand
  | ActiveCellCommand
  | ActiveRowCommand
  | MoveActiveCellCommand
  | MoveActiveCellVerticalCommand
  | MoveVerticalSelectedRows
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
  | ApplyDynamicProjectionCommand
  | ChangeUnitLevelCommand;
