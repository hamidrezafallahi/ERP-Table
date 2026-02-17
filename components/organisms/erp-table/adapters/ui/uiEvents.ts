// adapters/ui/uiEvents.ts

import { Table } from '../../domain/entities/Table';

/* ---------- Base ---------- */

export interface UICommandBase {
  readonly type: string;

}
/* ---------- Cell ---------- */

export interface UICellChangeEvent extends UICommandBase {
  readonly type: 'UI_CELL_CHANGE';
  readonly rowId: number;
  readonly columnId: string;
  readonly value: unknown;
}
export interface UICellChangeDisplayEvent extends UICommandBase {
  readonly type: 'UI_CELL_CHANGE_DISPLAY';
  readonly rowId: number;
  readonly columnId: string;
  readonly value: string;
}
export interface UIMoveActiveCellEvent extends UICommandBase {
  readonly type: 'UI_MOVE_ACTIVE_CELL';
  readonly rowId: number;
  readonly columnId: string;
  readonly direction: "next" | "prev";
}
export interface UIMoveActiveVerticalCellEvent extends UICommandBase {
  readonly type: 'UI_MOVE_ACTIVE_CELL_VERTICAL';
  readonly rowId: number;
  readonly columnId: string;
  readonly direction: 'up' | 'down';
}
export interface UIActiveFirstCellEvent extends UICommandBase {
  readonly type: 'UI_ACTIVE_FIRST_CELL';
  readonly rowId: number;
}
export interface UIActiveCellEvent extends UICommandBase {
  readonly type: 'UI_ACTIVE_CELL';
  readonly rowId: number;
  readonly columnId: string;
}









/* ---------- Pagination ---------- */

export interface ChangePageSizeUiCommand extends UICommandBase {
  readonly type: 'CHANGE_PAGE_SIZE';
  readonly pageSize: number;
}

export interface ChangePageUiCommand extends UICommandBase {
  readonly type: 'CHANGE_PAGE';
  readonly page: number;
}

/* ---------- Row ---------- */

export interface ActiveRowUiCommand extends UICommandBase {
  readonly type: 'UI_ACTIVE_ROW';
  readonly rowId: number;


}
export interface AddEmptyRowUiCommand extends UICommandBase {
  readonly type: 'ADD_EMPTY_ROW';
}

export interface DuplicateRowUiCommand extends UICommandBase {
  readonly type: 'DUPLICATE_ROW';
  readonly rowId: number;
}

export interface DeleteRowUiCommand extends UICommandBase {
  readonly type: 'ROW_DELETED';
  readonly rowId: number;
}
export interface DeleteTableUiCommand extends UICommandBase {
  readonly type: 'TABLE_DELETED';
}
export interface RegisterTableUiCommand extends UICommandBase {
  readonly type: 'TABLE_REGISTERED';
  readonly storeName: string;
  readonly table: Table
}

export interface ToggleRowExpandedUiCommand extends UICommandBase {
  readonly type: 'TOGGLE_ROW_EXPANDED';
  readonly rowId: number;
}

export interface ReorderRowUiCommand extends UICommandBase {
  readonly type: 'ROW_REORDERED';
  readonly draggedRowId: number;
  readonly droppedRowId: number;
  readonly position:'before' | 'after';
}
export interface ToggleRowSelectedUiCommand extends UICommandBase {
  readonly type: 'TOGGLE_ROW_SELECTED';
 
}
export interface RowSelectedUiCommand extends UICommandBase {
  readonly type: 'ROW_SELECTED';
  readonly rowId: number;
}
 
/* ---------- Keyboard ---------- */

export interface KeyDownUiCommand extends UICommandBase {
  readonly type: 'KEY_DOWN';
  readonly event: KeyboardEvent;
  readonly ctx: {
    tableKey: string;
    activeRowId: number | null;
    activeColumnId: string | null;
  };
}

/* ---------- Union ---------- */

export type UITableCommand =
  ActiveRowUiCommand
  | ToggleRowSelectedUiCommand
  | RowSelectedUiCommand
  | UIMoveActiveVerticalCellEvent
  | UIMoveActiveCellEvent
  | UIActiveCellEvent
  | UIActiveFirstCellEvent
  | UICellChangeEvent
  | UICellChangeDisplayEvent
  | ChangePageSizeUiCommand
  | ChangePageUiCommand
  | AddEmptyRowUiCommand
  | DuplicateRowUiCommand
  | DeleteRowUiCommand
  | DeleteTableUiCommand
  | RegisterTableUiCommand
  | ToggleRowExpandedUiCommand
  | ReorderRowUiCommand
  | KeyDownUiCommand;
