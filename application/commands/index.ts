// application/commands/tableCommands.ts

import { Table } from '../../domain/entities/Table';
import { TableActions } from '../../domain/value-objects';
import type { FilterModel } from '../../engine/dataOps/filterModel';
import type {
  GridSearchState,
  MobileEditorState,
} from '../../engine/type';

export interface BaseTableCommand {
  readonly store: string;
  readonly tableKey: string;
  /** When set, undoable events from separate executes merge into one undo unit. */
  readonly correlationId?: string;
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
  readonly store: string;
  readonly tableKey: string;
  readonly rowId: number;
  readonly columnId: string;
  readonly direction: 'next' | 'prev';
}
export interface MoveActiveCellVerticalCommand {
  readonly type: 'MOVE_ACTIVE_CELL_VERTICAL';
  readonly store: string;
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
export interface MoveVerticalActiveRow {
  readonly type: 'MOVE_VERTICAL_ACTIVE_ROW';
  readonly tableKey: string;
  readonly direction: 'up' | 'down';
}
export interface ActiveCellCommand {
  readonly type: 'ACTIVE_CELL';
  readonly tableKey: string;

  readonly rowId: number;
  readonly columnId: string;
}
export interface ActiveRowCommand extends BaseTableCommand {
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
 
export interface SaveDescriptionCommand extends BaseTableCommand {
  readonly type: 'SAVE_DESCRIPTION';
  readonly rowId: number;
  readonly flag: boolean;
 
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
export interface AddNewRowsCommand extends BaseTableCommand {
  readonly type: 'ADD_NEW_ROWS';
  readonly detailFieldKey: string;
  readonly rows: {
    key: string;
    value: unknown;
    display: unknown;
  }[][];
  readonly autoActivate?: boolean;
}


export interface DuplicateRowCommand extends BaseTableCommand {
  readonly type: 'DUPLICATE_ROW';
  readonly rowId: number;
}

/**
 * Clone one source row (clipboard paste). Engine batches these with a shared
 * correlationId so undo reverses the whole paste unit.
 */
export interface PasteCellsCommand extends BaseTableCommand {
  readonly type: 'PASTE_CELLS';
  readonly updates: readonly {
    rowId: number;
    columnId: string;
    rawText: string;
  }[];
}

export interface PasteRowCommand extends BaseTableCommand {
  readonly type: 'PASTE_ROW';
  readonly sourceRowId: number;
  /** When set (pasteInsert), place the clone relative to this row. */
  readonly placeAtRowId?: number;
}

export interface DeleteRowCommand extends BaseTableCommand {
  readonly type: 'ROW_DELETED';
  readonly rowId: number;

}

/** Undo-stack redo: re-insert a previously added row with original identity/values. */
export interface RestoreAddedRowCommand extends BaseTableCommand {
  readonly type: 'RESTORE_ADDED_ROW';
  readonly rowId: number;
  readonly cells: Readonly<
    Record<
      string,
      {
        readonly value: unknown;
        readonly display?: unknown;
        readonly originalValue?: unknown;
      }
    >
  >;
  readonly collection?: string;
  readonly isSaveDescription?: boolean;
}

export interface DeleteRowsCommand extends BaseTableCommand {
  readonly type: 'ROWS_DELETED';
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
export interface SelectPageRowsCommand {
  readonly type: 'TOGGLE_SELECT_PAGE_ROWS';
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
export interface SetActiveCollectionCommand extends BaseTableCommand {
  readonly type: 'SET_ACTIVE_COLLECTION';
  readonly activeCollection: string;

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
export interface ChangeTableActionCommand extends BaseTableCommand {
  readonly type: 'SET_TABLE_ACTION';
  action: TableActions
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

export interface ApplyDynamicProjectionCommand extends BaseTableCommand {
  readonly type: 'APPLY_DYNAMIC_PROJECTION';
  readonly tableKey: string;
  readonly rowId: number;
  readonly columnId: string;

}

/* ---------- UI overlay state (engine-managed) ---------- */

export interface SetGridSearchCommand {
  readonly type: 'SET_GRID_SEARCH';
  readonly tableKey: string;
  readonly search: GridSearchState;
}

export interface SetMobileEditorCommand {
  readonly type: 'SET_MOBILE_EDITOR';
  readonly tableKey: string;
  readonly editor: MobileEditorState;
}

export interface ResizeColumnCommand {
  readonly type: 'RESIZE_COLUMN';
  readonly tableKey: string;
  readonly columnId: string;
  readonly width: number;
}

export interface SetColumnVisibleCommand {
  readonly type: 'SET_COLUMN_VISIBLE';
  readonly tableKey: string;
  readonly columnId: string;
  readonly visible: boolean;
}

export interface ToggleColumnGroupCommand {
  readonly type: 'TOGGLE_COLUMN_GROUP';
  readonly tableKey: string;
  readonly groupId: string;
}

export interface SetColumnPinnedCommand {
  readonly type: 'SET_COLUMN_PIN';
  readonly tableKey: string;
  readonly columnId: string;
  readonly pinned: 'start' | 'end' | null;
}

export interface SetSortModelCommand {
  readonly type: 'SET_SORT_MODEL';
  readonly tableKey: string;
  /** Empty / omit fields cleared by host ⇒ document `index` order. */
  readonly sortModel: readonly {
    readonly colId: string;
    readonly sort: 'asc' | 'desc';
  }[];
}

export interface SetQuickFilterTextCommand {
  readonly type: 'SET_QUICK_FILTER_TEXT';
  readonly tableKey: string;
  /** Empty string clears the filter (all rows visible). */
  readonly quickFilterText: string;
}

export interface SetFilterModelCommand {
  readonly type: 'SET_FILTER_MODEL';
  readonly tableKey: string;
  /** Empty object clears all column filters. */
  readonly filterModel: FilterModel;
}

export interface SetRowGroupColumnsCommand {
  readonly type: 'SET_ROW_GROUP_COLUMNS';
  readonly tableKey: string;
  /** Only the first entry is active in 0.12.0 (RFC-002). */
  readonly columns: readonly string[];
}

export interface SetGroupDefaultExpandedCommand {
  readonly type: 'SET_GROUP_DEFAULT_EXPANDED';
  readonly tableKey: string;
  readonly expanded: boolean;
}

export interface ToggleRowGroupCommand {
  readonly type: 'TOGGLE_ROW_GROUP';
  readonly tableKey: string;
  /** `normalizeGroupKey` of the group. */
  readonly groupKey: string;
}

/* ---------- Union ---------- */

export type EngineTableCommand =
  SelectActiveRowToLastCommand
  | SelectRangeCommand
  | ToggleRowExpandCommand
  | SelectRowCommand
  | CollapseAllRowsCommand
  | RegisterTableCommand
  | DisposeTableCommand
  | DeleteRowsCommand
  | ToggleRowSelectionCommand
  | SelectAllRowsCommand
  | SelectPageRowsCommand
  | ClearRowSelectionCommand
  | ActiveCellCommand
  | ActiveRowCommand
  | MoveActiveCellCommand
  | MoveActiveCellVerticalCommand
  | MoveVerticalSelectedRows
  | MoveVerticalActiveRow
  | ActiveFirstCellCommand
  | ExpandRowCommand
  | ChangeTableActionCommand
  | SetGridSearchCommand
  | SetMobileEditorCommand
  | ResizeColumnCommand
  | SetColumnVisibleCommand
  | ToggleColumnGroupCommand
  | SetColumnPinnedCommand
  | SetSortModelCommand
  | SetQuickFilterTextCommand
  | SetFilterModelCommand
  | SetRowGroupColumnsCommand
  | SetGroupDefaultExpandedCommand
  | ToggleRowGroupCommand;

export type ApplicationTableCommand =
  | ChangeCellValueCommand
  | SaveDescriptionCommand
  | ChangeCellDisplayValueCommand
  | AddEmptyRowCommand
  | AddNewRowsCommand
  | DuplicateRowCommand
  | PasteCellsCommand
  | PasteRowCommand
  | DeleteRowCommand
  | RestoreAddedRowCommand
  | DeleteTableCommand
  | SetActiveCollectionCommand
  | ResetTableCommand
  | RowReorderedCommand
  | ColumnReorderedCommand
  | ChangePageCommand
  | ChangePageSizeCommand
  | ApplyDynamicProjectionCommand;

export type TableCommand =
  | EngineTableCommand
  | ApplicationTableCommand;

const applicationCommandTypes = new Set<TableCommand['type']>([
  'CHANGE_CELL_VALUE',
  'SAVE_DESCRIPTION',
  'CHANGE_CELL_DISPLAY_VALUE',
  'ADD_EMPTY_ROW',
  'ADD_NEW_ROWS',
  'DUPLICATE_ROW',
  'PASTE_ROW',
  'PASTE_CELLS',
  'ROW_DELETED',
  'RESTORE_ADDED_ROW',
  'TABLE_DELETED',
  'SET_ACTIVE_COLLECTION',
  'TABLE_RESET',
  'ROW_REORDERED',
  'COLUMN_REORDERED',
  'CHANGE_PAGE',
  'CHANGE_PAGE_SIZE',
  'APPLY_DYNAMIC_PROJECTION',
]);

export function isApplicationTableCommand(
  command: TableCommand
): command is ApplicationTableCommand {
  return applicationCommandTypes.has(command.type);
}
