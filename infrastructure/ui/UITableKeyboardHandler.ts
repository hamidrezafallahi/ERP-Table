// adapters/ui/UITableKeyboardHandler.ts

import { AuditLogger } from '../../application/ports/AuditLogger';
import { TableEngine } from '../../engine/tableEngine';

type KeydownCtx = {
  activeRowId: number | null;
  activeColumnId: string | null;
};

/**
 * تمام منطق keyboard shortcut از UITableController اینجا مستقر شده.
 * دسترسی مستقیم به engine دارد تا نیازی به callback chains نباشد.
 */
export class UITableKeyboardHandler {
  constructor(
    private readonly engine: TableEngine,
    private readonly store: string,
    private readonly tableKey: string,
    private readonly audit: AuditLogger,
  ) {}

  async handle(e: KeyboardEvent, ctx: KeydownCtx): Promise<void> {
    try {
      await this.handleInternal(e, ctx);
    } catch (error) {
      this.audit.log({
        type: 'ERROR',
        message: 'Unhandled error in keyboard handler',
        payload: { error, code: e.code, ctx },
      });
    }
  }

  private async handleInternal(e: KeyboardEvent, ctx: KeydownCtx): Promise<void> {
    const view = this.engine.getViewState();
    if (!view) return;

    const { canPrev, canNext, page } = view.pagination;
    const { altKey, shiftKey, ctrlKey, code } = e;
    const { activeRowId, activeColumnId } = ctx;
    const selectedRows = this.engine.getSelectedRows();

    switch (code) {
      case 'KeyN': {
        if (altKey) {
          e.preventDefault();
          this.engine.dispatch({ type: 'ADD_EMPTY_ROW', store: this.store, tableKey: this.tableKey, autoActivate: true });
        }
        return;
      }

      case 'KeyD': {
        if (altKey && activeRowId != null) {
          e.preventDefault();
          this.engine.dispatch({ type: 'DUPLICATE_ROW', store: this.store, tableKey: this.tableKey, rowId: activeRowId });
        }
        return;
      }

      case 'Delete': {
        if (altKey && activeRowId) {
          e.preventDefault();
          this.engine.dispatch({ type: 'ROW_DELETED', store: this.store, tableKey: this.tableKey, rowId: activeRowId });
        }
        return;
      }

      case 'End': {
        if (shiftKey && ctrlKey && activeRowId != null) {
          e.preventDefault();
          this.engine.dispatch({ type: 'SELECT_FROM_ACTIVE_TO_LAST', tableKey: this.tableKey, anchorRowId: activeRowId });
          return;
        }
        if (shiftKey && activeRowId != null) {
          e.preventDefault();
          this.engine.dispatch({ type: 'ROW_SELECTION_TOGGLED', tableKey: this.tableKey, rowId: activeRowId });
        }
        return;
      }

      case 'Space': {
        if (activeRowId != null && ctrlKey) {
          e.preventDefault();
          this.engine.dispatch({ type: 'ROW_SELECTION_TOGGLED', tableKey: this.tableKey, rowId: activeRowId });
        }
        return;
      }

      case 'NumpadEnter':
      case 'Enter': {
        e.preventDefault();
        if (activeRowId) {
          if (!activeColumnId) {
            this.engine.dispatch({ type: 'ACTIVATE_FIRST_CELL', tableKey: this.tableKey, rowId: activeRowId });
          } else {
            this.engine.dispatch({
              type: 'MOVE_ACTIVE_CELL',
              store: this.store,
              tableKey: this.tableKey,
              rowId: activeRowId,
              columnId: activeColumnId,
              direction: shiftKey ? 'prev' : 'next',
            });
          }
        }
        return;
      }

      case 'Tab': {
        if (activeRowId && activeColumnId) {
          e.preventDefault();
          this.engine.dispatch({
            type: 'MOVE_ACTIVE_CELL',
            store: this.store,
            tableKey: this.tableKey,
            rowId: activeRowId,
            columnId: activeColumnId,
            direction: shiftKey ? 'prev' : 'next',
          });
        }
        return;
      }

      case 'ArrowLeft': {
        if (altKey) {
          e.preventDefault();
          await this.engine.dispatch({ type: 'COLLAPSE_ALL_ROWS', tableKey: this.tableKey });
          return;
        }
        if (!activeRowId || !activeColumnId) return;
        e.preventDefault();
        this.engine.dispatch({
          type: 'MOVE_ACTIVE_CELL',
          store: this.store,
          tableKey: this.tableKey,
          rowId: activeRowId,
          columnId: activeColumnId,
          direction: 'next',
        });
        return;
      }

      case 'ArrowRight': {
        if (!activeRowId || !activeColumnId) return;
        e.preventDefault();
        this.engine.dispatch({
          type: 'MOVE_ACTIVE_CELL',
          store: this.store,
          tableKey: this.tableKey,
          rowId: activeRowId,
          columnId: activeColumnId,
          direction: 'prev',
        });
        return;
      }

      case 'ArrowDown': {
        if (altKey && selectedRows) {
          e.preventDefault();
          this.engine.dispatch({ type: 'MOVE_VERTICAL_SELECTED_ROWS', tableKey: this.tableKey, direction: 'down' });
          return;
        }
        if (ctrlKey && activeRowId) {
          e.preventDefault();
          this.engine.dispatch({ type: 'MOVE_VERTICAL_ACTIVE_ROW', tableKey: this.tableKey, direction: 'down' });
          return;
        }
        if (!activeRowId)  return;
        if (!activeColumnId)  return;
        e.preventDefault();
        this.engine.dispatch({
          type: 'MOVE_ACTIVE_CELL_VERTICAL',
          store: this.store,
          tableKey: this.tableKey,
          rowId: activeRowId,
          columnId: activeColumnId,
          direction: 'down',
        });
        return;
      }

      case 'ArrowUp': {
        if (altKey && selectedRows) {
          e.preventDefault();
          this.engine.dispatch({ type: 'MOVE_VERTICAL_SELECTED_ROWS', tableKey: this.tableKey, direction: 'up' });
          return;
        }
        if (ctrlKey && activeRowId) {
          e.preventDefault();
          this.engine.dispatch({ type: 'MOVE_VERTICAL_ACTIVE_ROW', tableKey: this.tableKey, direction: 'up' });
          return;
        }
        if (!activeRowId) return;
        if (!activeColumnId) return;
        e.preventDefault();
        this.engine.dispatch({
          type: 'MOVE_ACTIVE_CELL_VERTICAL',
          store: this.store,
          tableKey: this.tableKey,
          rowId: activeRowId,
          columnId: activeColumnId,
          direction: 'up',
        });
        return;
      }

      case 'PageUp': {
        if (!canPrev) return;
        e.preventDefault();
        this.engine.dispatch({ type: 'CHANGE_PAGE', tableKey: this.tableKey, page: page - 1, store: this.store });
        return;
      }

      case 'PageDown': {
        if (!canNext) return;
        e.preventDefault();
        this.engine.dispatch({ type: 'CHANGE_PAGE', tableKey: this.tableKey, page: page + 1, store: this.store });
        return;
      }

      case 'KeyC': {
        if (altKey) {
          e.preventDefault();
          this.engine.dispatch({ type: 'SET_TABLE_ACTION', store: this.store, tableKey: this.tableKey, action: 'copy' });
        }
        return;
      }

      case 'KeyX': {
        if (altKey) {
          e.preventDefault();
          this.engine.dispatch({ type: 'SET_TABLE_ACTION', store: this.store, tableKey: this.tableKey, action: 'cut' });
        }
        return;
      }

      case 'KeyV': {
        if (altKey) {
          e.preventDefault();
          this.engine.dispatch({ type: 'SET_TABLE_ACTION', store: this.store, tableKey: this.tableKey, action: 'paste' });
        }
        return;
      }

      case 'KeyB': {
        if (altKey) {
          e.preventDefault();
          this.engine.dispatch({ type: 'SET_TABLE_ACTION', store: this.store, tableKey: this.tableKey, action: 'pasteInsert' });
        }
        return;
      }

      case 'Escape': {
        e.preventDefault();
        this.engine.dispatch({ type: 'SET_TABLE_ACTION', store: this.store, tableKey: this.tableKey, action: null });
        return;
      }

      default:
        return;
    }
  }
}