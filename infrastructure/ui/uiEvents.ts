// adapters/ui/uiEvents.ts

import { Table } from '../../domain/entities/Table';
import { TableActions } from '../../domain/value-objects';
import type {
  GridSearchState,
} from '../../engine/type';

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
export interface UIDescriptionSaveEvent extends UICommandBase {
  readonly type: 'UI_DESCRIPTION_SAVE';
  readonly rowId: number;
  readonly flag: boolean;
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
export interface AddNewRowsUiCommand extends UICommandBase {
  readonly type: 'ADD_NEW_ROWS';
  readonly detailFieldKey: string;
  readonly rows: {
    key: string;
    value: unknown;
    display: unknown;
  }[][];
}

export interface DuplicateRowUiCommand extends UICommandBase {
  readonly type: 'DUPLICATE_ROW';
  readonly rowId: number;
}

export interface DeleteRowUiCommand extends UICommandBase {
  readonly type: 'ROW_DELETED';
  readonly rowId: number;
}
export interface DeleteSelectedRowsUiCommand extends UICommandBase {
  readonly type: 'UI_DELETE_SELECTED_ROW';
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
  readonly position: 'before' | 'after';
}

export interface ReorderColumnUiCommand extends UICommandBase {
  readonly type: 'COLUMN_REORDERED';
  readonly sourceIndex: number;
  readonly destIndex: number;
}
export interface ToggleRowSelectedUiCommand extends UICommandBase {
  readonly type: 'TOGGLE_ROW_SELECTED';

}
export interface TogglePageRowSelectedUiCommand extends UICommandBase {
  readonly type: 'TOGGLE_PAGE_ROW_SELECTED';

}
export interface ClearRowSelectionUiCommand extends UICommandBase {
  readonly type: 'CLEAR_ROW_SELECTION';
}
export interface RowSelectedUiCommand extends UICommandBase {
  readonly type: 'ROW_SELECTED';
  readonly rowId: number;
}
/* ---------- Table ---------- */

export interface ActionTableUiCommand extends UICommandBase {
  readonly type: 'UI_ACTION_TABLE';
  readonly action: TableActions;
}
export interface ActiveCollectionUiCommand extends UICommandBase {
  readonly type: 'UI_CHANGE_ACTIVE_COLLECTION';
  readonly activeCollection: string;
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

/* ---------- Grid search ---------- */

export interface SetGridSearchUiCommand extends UICommandBase {
  readonly type: 'UI_SET_GRID_SEARCH';
  readonly search: GridSearchState;
}

export interface ClearGridSearchUiCommand extends UICommandBase {
  readonly type: 'UI_CLEAR_GRID_SEARCH';
}

/* ---------- Mobile editor ---------- */

export interface OpenMobileAddUiCommand extends UICommandBase {
  readonly type: 'UI_OPEN_MOBILE_ADD';
}

export interface OpenMobileEditUiCommand extends UICommandBase {
  readonly type: 'UI_OPEN_MOBILE_EDIT';
  readonly rowId: number;
}

export interface CloseMobileEditorUiCommand extends UICommandBase {
  readonly type: 'UI_CLOSE_MOBILE_EDITOR';
}

export interface ResizeColumnUiCommand extends UICommandBase {
  readonly type: 'UI_RESIZE_COLUMN';
  readonly columnId: string;
  readonly width: number;
}

/* ---------- Union ---------- */

export type UITableCommand =
  ActiveRowUiCommand
  | ToggleRowSelectedUiCommand
  | TogglePageRowSelectedUiCommand
  | ClearRowSelectionUiCommand
  | RowSelectedUiCommand
  | UIMoveActiveVerticalCellEvent
  | UIMoveActiveCellEvent
  | UIActiveCellEvent
  | UIActiveFirstCellEvent
  | UICellChangeEvent
  | UIDescriptionSaveEvent
  | UICellChangeDisplayEvent
  | ChangePageSizeUiCommand
  | ChangePageUiCommand
  | AddEmptyRowUiCommand
  | AddNewRowsUiCommand
  | DuplicateRowUiCommand
  | DeleteRowUiCommand
  | DeleteTableUiCommand
  | RegisterTableUiCommand
  | ToggleRowExpandedUiCommand
  | ReorderRowUiCommand
  | ReorderColumnUiCommand
  | ActionTableUiCommand
  | ActiveCollectionUiCommand
  | DeleteSelectedRowsUiCommand
  | KeyDownUiCommand
  | SetGridSearchUiCommand
  | ClearGridSearchUiCommand
  | OpenMobileAddUiCommand
  | OpenMobileEditUiCommand
  | CloseMobileEditorUiCommand
  | ResizeColumnUiCommand;
