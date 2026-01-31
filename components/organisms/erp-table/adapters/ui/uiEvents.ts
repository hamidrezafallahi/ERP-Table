// adapters/ui/uiEvents.ts

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

export interface ToggleRowExpandedUiCommand extends UICommandBase {
  readonly type: 'TOGGLE_ROW_EXPANDED';
  readonly rowId: number;
}

export interface ReorderRowUiCommand extends UICommandBase {
  readonly type: 'ROW_REORDERED';
  readonly draggedRowId: number;
  readonly droppedRowId: number;
}

/* ---------- Keyboard ---------- */

export interface KeyDownUiCommand extends UICommandBase {
  readonly type: 'KEY_DOWN';
  readonly event: KeyboardEvent;
  readonly ctx: {
    tableId: string;
    activeRowId: number | null;
  };
}

/* ---------- Union ---------- */

export type UITableCommand =
  | UICellChangeEvent
  | ChangePageSizeUiCommand
  | ChangePageUiCommand
  | AddEmptyRowUiCommand
  | DuplicateRowUiCommand
  | DeleteRowUiCommand
  | DeleteTableUiCommand
  | ToggleRowExpandedUiCommand
  | ReorderRowUiCommand
  | KeyDownUiCommand;
