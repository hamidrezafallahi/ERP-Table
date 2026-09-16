import type { TableActions } from '../../domain/value-objects';
import type { ArrowDirection } from '../../engine/selection/cellRange';
import type { GridSearchState, MobileEditorState } from '../../engine/type';

/**
 * Session-centric view / keyboard intents.
 * These are not domain commands; GridSession maps them to engine dispatches.
 */
export type ViewIntent =
  | { type: 'ADD_EMPTY_ROW'; autoActivate?: boolean }
  | { type: 'DUPLICATE_ROW'; rowId: number }
  | { type: 'DELETE_ROW'; rowId: number }
  | { type: 'TOGGLE_ROW_SELECTION'; rowId: number }
  | { type: 'SELECT_FROM_ACTIVE_TO_LAST'; anchorRowId: number }
  | { type: 'ACTIVATE_FIRST_CELL'; rowId: number }
  | {
      type: 'MOVE_ACTIVE_CELL';
      rowId: number;
      columnId: string;
      direction: 'next' | 'prev';
    }
  | {
      type: 'MOVE_ACTIVE_CELL_VERTICAL';
      rowId: number;
      columnId: string;
      direction: 'up' | 'down';
    }
  | { type: 'MOVE_VERTICAL_SELECTED_ROWS'; direction: 'up' | 'down' }
  | { type: 'MOVE_VERTICAL_ACTIVE_ROW'; direction: 'up' | 'down' }
  | { type: 'COLLAPSE_ALL_ROWS' }
  | { type: 'CHANGE_PAGE'; page: number }
  | { type: 'CHANGE_PAGE_SIZE'; pageSize: number }
  | { type: 'SET_TABLE_ACTION'; action: TableActions }
  | { type: 'SET_GRID_SEARCH'; search: GridSearchState }
  | { type: 'SET_MOBILE_EDITOR'; editor: MobileEditorState }
  | {
      type: 'CHANGE_VIEWPORT';
      scrollOffset: number;
      viewportSize?: number;
      rowHeight?: number;
      overscan?: number;
    }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'EXTEND_CELL_RANGE'; direction: ArrowDirection }
  | { type: 'EXTEND_CELL_RANGE_TO_EDGE'; direction: ArrowDirection }
  | { type: 'JUMP_ACTIVE_CELL_ROW_EDGE'; edge: 'start' | 'end' }
  | { type: 'JUMP_ACTIVE_CELL_GRID'; corner: 'first' | 'last' }
  | { type: 'SELECT_ALL_CELLS' };

export type ViewIntentDispatcher = (intent: ViewIntent) => Promise<void>;
