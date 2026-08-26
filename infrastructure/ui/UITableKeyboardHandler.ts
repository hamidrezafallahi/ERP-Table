// adapters/ui/UITableKeyboardHandler.ts

import { AuditLogger } from '../../application/ports/AuditLogger';
import type { ViewIntentDispatcher } from '../../application/session/ViewIntent';
import { TableEngine } from '../../engine/tableEngine';

type KeydownCtx = {
  activeRowId: number | null;
  activeColumnId: string | null;
};

/**
 * Keyboard shortcuts emit ViewIntent through the session dispatcher.
 * Reads (pagination / selection) still come from Engine view state.
 */
export class UITableKeyboardHandler {
  constructor(
    private readonly engine: TableEngine,
    private readonly audit: AuditLogger,
    private readonly dispatchIntent: ViewIntentDispatcher,
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
          await this.dispatchIntent({ type: 'ADD_EMPTY_ROW', autoActivate: true });
        }
        return;
      }

      case 'KeyD': {
        if (altKey && activeRowId != null) {
          e.preventDefault();
          await this.dispatchIntent({ type: 'DUPLICATE_ROW', rowId: activeRowId });
        }
        return;
      }

      case 'Delete': {
        if (altKey && activeRowId) {
          e.preventDefault();
          await this.dispatchIntent({ type: 'DELETE_ROW', rowId: activeRowId });
        }
        return;
      }

      case 'End': {
        if (shiftKey && ctrlKey && activeRowId != null) {
          e.preventDefault();
          await this.dispatchIntent({
            type: 'SELECT_FROM_ACTIVE_TO_LAST',
            anchorRowId: activeRowId,
          });
          return;
        }
        if (shiftKey && activeRowId != null) {
          e.preventDefault();
          await this.dispatchIntent({
            type: 'TOGGLE_ROW_SELECTION',
            rowId: activeRowId,
          });
        }
        return;
      }

      case 'Space': {
        if (activeRowId != null && ctrlKey) {
          e.preventDefault();
          await this.dispatchIntent({
            type: 'TOGGLE_ROW_SELECTION',
            rowId: activeRowId,
          });
        }
        return;
      }

      case 'NumpadEnter':
      case 'Enter': {
        e.preventDefault();
        if (activeRowId) {
          if (!activeColumnId) {
            await this.dispatchIntent({
              type: 'ACTIVATE_FIRST_CELL',
              rowId: activeRowId,
            });
          } else {
            await this.dispatchIntent({
              type: 'MOVE_ACTIVE_CELL',
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
          await this.dispatchIntent({
            type: 'MOVE_ACTIVE_CELL',
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
          await this.dispatchIntent({ type: 'COLLAPSE_ALL_ROWS' });
          return;
        }
        if (!activeRowId || !activeColumnId) return;
        e.preventDefault();
        await this.dispatchIntent({
          type: 'MOVE_ACTIVE_CELL',
          rowId: activeRowId,
          columnId: activeColumnId,
          direction: 'next',
        });
        return;
      }

      case 'ArrowRight': {
        if (!activeRowId || !activeColumnId) return;
        e.preventDefault();
        await this.dispatchIntent({
          type: 'MOVE_ACTIVE_CELL',
          rowId: activeRowId,
          columnId: activeColumnId,
          direction: 'prev',
        });
        return;
      }

      case 'ArrowDown': {
        if (altKey && selectedRows) {
          e.preventDefault();
          await this.dispatchIntent({
            type: 'MOVE_VERTICAL_SELECTED_ROWS',
            direction: 'down',
          });
          return;
        }
        if (ctrlKey && activeRowId) {
          e.preventDefault();
          await this.dispatchIntent({
            type: 'MOVE_VERTICAL_ACTIVE_ROW',
            direction: 'down',
          });
          return;
        }
        if (!activeRowId) return;
        if (!activeColumnId) return;
        e.preventDefault();
        await this.dispatchIntent({
          type: 'MOVE_ACTIVE_CELL_VERTICAL',
          rowId: activeRowId,
          columnId: activeColumnId,
          direction: 'down',
        });
        return;
      }

      case 'ArrowUp': {
        if (altKey && selectedRows) {
          e.preventDefault();
          await this.dispatchIntent({
            type: 'MOVE_VERTICAL_SELECTED_ROWS',
            direction: 'up',
          });
          return;
        }
        if (ctrlKey && activeRowId) {
          e.preventDefault();
          await this.dispatchIntent({
            type: 'MOVE_VERTICAL_ACTIVE_ROW',
            direction: 'up',
          });
          return;
        }
        if (!activeRowId) return;
        if (!activeColumnId) return;
        e.preventDefault();
        await this.dispatchIntent({
          type: 'MOVE_ACTIVE_CELL_VERTICAL',
          rowId: activeRowId,
          columnId: activeColumnId,
          direction: 'up',
        });
        return;
      }

      case 'PageUp': {
        if (!canPrev) return;
        e.preventDefault();
        await this.dispatchIntent({ type: 'CHANGE_PAGE', page: page - 1 });
        return;
      }

      case 'PageDown': {
        if (!canNext) return;
        e.preventDefault();
        await this.dispatchIntent({ type: 'CHANGE_PAGE', page: page + 1 });
        return;
      }

      case 'KeyC': {
        if (altKey) {
          e.preventDefault();
          await this.dispatchIntent({ type: 'SET_TABLE_ACTION', action: 'copy' });
        }
        return;
      }

      case 'KeyX': {
        if (altKey) {
          e.preventDefault();
          await this.dispatchIntent({ type: 'SET_TABLE_ACTION', action: 'cut' });
        }
        return;
      }

      case 'KeyV': {
        if (altKey) {
          e.preventDefault();
          await this.dispatchIntent({ type: 'SET_TABLE_ACTION', action: 'paste' });
        }
        return;
      }

      case 'KeyB': {
        if (altKey) {
          e.preventDefault();
          await this.dispatchIntent({
            type: 'SET_TABLE_ACTION',
            action: 'pasteInsert',
          });
        }
        return;
      }

      case 'Escape': {
        e.preventDefault();
        await this.dispatchIntent({ type: 'SET_TABLE_ACTION', action: null });
        return;
      }

      case 'KeyZ': {
        if (ctrlKey && !shiftKey) {
          e.preventDefault();
          await this.dispatchIntent({ type: 'UNDO' });
          return;
        }
        if (ctrlKey && shiftKey) {
          e.preventDefault();
          await this.dispatchIntent({ type: 'REDO' });
        }
        return;
      }

      case 'KeyY': {
        if (ctrlKey) {
          e.preventDefault();
          await this.dispatchIntent({ type: 'REDO' });
        }
        return;
      }

      default:
        return;
    }
  }
}
