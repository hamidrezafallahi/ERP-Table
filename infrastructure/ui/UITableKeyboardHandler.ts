// adapters/ui/UITableKeyboardHandler.ts



import { AuditLogger } from '../../application/ports/AuditLogger';

import type { ViewIntentDispatcher } from '../../application/session/ViewIntent';

import { TableEngine } from '../../engine/tableEngine';

import {
  closestGridRoot,
  isCellEditorTarget,
} from './focusTrap';



type KeydownCtx = {

  activeRowId: number | null;

  activeColumnId: string | null;

};



/**

 * Keyboard shortcuts emit ViewIntent through the session dispatcher.

 * Reads (pagination / selection) still come from Engine view state.

 */

export class UITableKeyboardHandler {

  private copyCells?: () => Promise<boolean>;

  private cutCells?: () => Promise<boolean>;

  private pasteCells?: () => Promise<boolean>;



  constructor(

    private readonly engine: TableEngine,

    private readonly audit: AuditLogger,

    private readonly dispatchIntent: ViewIntentDispatcher,

  ) {}



  setCopyCells(handler: () => Promise<boolean>): void {

    this.copyCells = handler;

  }



  setCutCells(handler: () => Promise<boolean>): void {

    this.cutCells = handler;

  }



  setPasteCells(handler: () => Promise<boolean>): void {

    this.pasteCells = handler;

  }



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



      case 'Home': {

        if (ctrlKey && !shiftKey && !altKey) {

          e.preventDefault();

          await this.dispatchIntent({

            type: 'JUMP_ACTIVE_CELL_GRID',

            corner: 'first',

          });

          return;

        }

        if (!ctrlKey && !shiftKey && !altKey && activeRowId && activeColumnId) {

          e.preventDefault();

          await this.dispatchIntent({

            type: 'JUMP_ACTIVE_CELL_ROW_EDGE',

            edge: 'start',

          });

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

          return;

        }

        if (ctrlKey && !shiftKey && !altKey) {

          e.preventDefault();

          await this.dispatchIntent({

            type: 'JUMP_ACTIVE_CELL_GRID',

            corner: 'last',

          });

          return;

        }

        if (!ctrlKey && !shiftKey && !altKey && activeRowId && activeColumnId) {

          e.preventDefault();

          await this.dispatchIntent({

            type: 'JUMP_ACTIVE_CELL_ROW_EDGE',

            edge: 'end',

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

          } else if (this.engine.getCellEdit()) {

            // PR-126: confirm (commit via MOVE) + move vertically.
            await this.dispatchIntent({

              type: 'MOVE_ACTIVE_CELL_VERTICAL',

              rowId: activeRowId,

              columnId: activeColumnId,

              direction: shiftKey ? 'up' : 'down',

            });

          } else if (!this.engine.getCellEditOptions().singleClickEdit) {

            this.engine.startCellEdit(activeRowId, activeColumnId);

          } else {

            await this.dispatchIntent({

              type: 'MOVE_ACTIVE_CELL_VERTICAL',

              rowId: activeRowId,

              columnId: activeColumnId,

              direction: shiftKey ? 'up' : 'down',

            });

          }

        }

        return;

      }



      case 'Tab': {

        // PR-124 APG: Tab exits the grid unless a cell editor is focused.
        // PR-126: while editing, Tab confirms + moves sideways.
        if (!isCellEditorTarget(e.target)) {
          return;
        }

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

        if (
          !ctrlKey &&
          !shiftKey &&
          !altKey &&
          activeRowId != null &&
          this.engine.getGroupNode(activeRowId)
        ) {
          const expanded =
            this.engine.getRowView(activeRowId)?.groupExpanded !== false;
          if (expanded) {
            e.preventDefault();
            this.engine.toggleRowGroupById(activeRowId);
            return;
          }
        }

        if (ctrlKey && shiftKey && !altKey && activeRowId && activeColumnId) {

          e.preventDefault();

          await this.dispatchIntent({

            type: 'EXTEND_CELL_RANGE_TO_EDGE',

            direction: 'left',

          });

          return;

        }

        if (altKey) {

          e.preventDefault();

          await this.dispatchIntent({ type: 'COLLAPSE_ALL_ROWS' });

          return;

        }

        if (shiftKey && !ctrlKey && activeRowId && activeColumnId) {

          e.preventDefault();

          await this.dispatchIntent({

            type: 'EXTEND_CELL_RANGE',

            direction: 'left',

          });

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

        if (
          !ctrlKey &&
          !shiftKey &&
          !altKey &&
          activeRowId != null &&
          this.engine.getGroupNode(activeRowId)
        ) {
          const expanded =
            this.engine.getRowView(activeRowId)?.groupExpanded !== false;
          if (!expanded) {
            e.preventDefault();
            this.engine.toggleRowGroupById(activeRowId);
            return;
          }
        }

        if (ctrlKey && shiftKey && !altKey && activeRowId && activeColumnId) {

          e.preventDefault();

          await this.dispatchIntent({

            type: 'EXTEND_CELL_RANGE_TO_EDGE',

            direction: 'right',

          });

          return;

        }

        if (shiftKey && !ctrlKey && activeRowId && activeColumnId) {

          e.preventDefault();

          await this.dispatchIntent({

            type: 'EXTEND_CELL_RANGE',

            direction: 'right',

          });

          return;

        }

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

        if (ctrlKey && shiftKey && !altKey && activeRowId && activeColumnId) {

          e.preventDefault();

          await this.dispatchIntent({

            type: 'EXTEND_CELL_RANGE_TO_EDGE',

            direction: 'down',

          });

          return;

        }

        if (shiftKey && !altKey && !ctrlKey && activeRowId && activeColumnId) {

          e.preventDefault();

          await this.dispatchIntent({

            type: 'EXTEND_CELL_RANGE',

            direction: 'down',

          });

          return;

        }

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

        if (ctrlKey && shiftKey && !altKey && activeRowId && activeColumnId) {

          e.preventDefault();

          await this.dispatchIntent({

            type: 'EXTEND_CELL_RANGE_TO_EDGE',

            direction: 'up',

          });

          return;

        }

        if (shiftKey && !altKey && !ctrlKey && activeRowId && activeColumnId) {

          e.preventDefault();

          await this.dispatchIntent({

            type: 'EXTEND_CELL_RANGE',

            direction: 'up',

          });

          return;

        }

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



      case 'KeyA': {

        if (ctrlKey) {

          e.preventDefault();

          await this.dispatchIntent({ type: 'SELECT_ALL_CELLS' });

        }

        return;

      }



      case 'KeyC': {

        if (ctrlKey && !altKey) {

          e.preventDefault();

          if (this.copyCells) {

            await this.copyCells();

          }

          return;

        }

        /** @deprecated D18 — use Ctrl+C (system clipboard). Alt+C keeps row-clone mode until 1.0.0. */

        if (altKey) {

          e.preventDefault();

          await this.dispatchIntent({ type: 'SET_TABLE_ACTION', action: 'copy' });

        }

        return;

      }



      case 'KeyX': {

        if (ctrlKey && !altKey) {

          e.preventDefault();

          if (this.cutCells) {

            await this.cutCells();

          }

          return;

        }

        /** @deprecated D18 — use Ctrl+X (system clipboard cut). Alt+X keeps row-clone mode until 1.0.0. */

        if (altKey) {

          e.preventDefault();

          await this.dispatchIntent({ type: 'SET_TABLE_ACTION', action: 'cut' });

        }

        return;

      }



      case 'KeyV': {

        if (ctrlKey && !altKey) {

          e.preventDefault();

          if (this.pasteCells) {

            await this.pasteCells();

          }

          return;

        }

        /** @deprecated D18 — use Ctrl+V (system clipboard). Alt+V keeps row-clone mode until 1.0.0. */

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



      case 'F2': {

        if (activeRowId && activeColumnId && !this.engine.getCellEdit()) {
          e.preventDefault();
          this.engine.startCellEdit(activeRowId, activeColumnId);
        }

        return;

      }



      case 'Escape': {

        e.preventDefault();

        await this.dispatchIntent({ type: 'SET_TABLE_ACTION', action: null });

        // PR-126: Esc cancels the draft (no EventStore write).
        if (this.engine.getCellEdit()) {
          this.engine.cancelCellEdit();
        }

        // PR-124: Esc ladder — editor → grid, cell chrome → grid, grid → blur.
        const target = e.target as HTMLElement | null;
        const grid = closestGridRoot(target);
        if (target && grid) {
          if (isCellEditorTarget(target)) {
            target.blur();
            grid.focus();
          } else if (target === grid) {
            grid.blur();
          } else {
            grid.focus();
          }
        }

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



