// adapters/ui/UITableController.ts

import { Table } from '../../domain/entities/Table';
import { TableActions } from '../../domain/value-objects';
import { TableEngine } from '../../engine/tableEngine';
import {
  ValidationCallbackResult,
  ValidCell,
} from '../../engine/type';
import { UITableCommand } from './uiEvents';

type KeydownCtx = {
  activeRowId: number | null;
  activeColumnId: string | null;
};
 

export class UITableController {
  constructor(
    private readonly engine: TableEngine,
    private readonly store: string,
    private readonly tableKey: string,
  ) { }
  private disposed = false;
  private changePageSize(pageSize: number) {
    this.engine.dispatch({
      type: 'CHANGE_PAGE_SIZE',
      store: this.store,
      tableKey: this.tableKey,
      pageSize,
    });
  }
  private changePage(page: number) {
    this.engine.dispatch({
      type: 'CHANGE_PAGE',
      store: this.store,
      tableKey: this.tableKey,
      page,
    });
  }
  private onCellChange(rowId: number, columnId: string, value: unknown) {
    this.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      store: this.store,
      tableKey: this.tableKey,
      rowId,
      columnId,
      newValue: value,
    });
  }
  private onCellDisplayChange(rowId: number, columnId: string, value: string) {
    this.engine.dispatch({
      type: 'CHANGE_CELL_DISPLAY_VALUE',
      store: this.store,
      tableKey: this.tableKey,
      rowId,
      columnId,
      newValue: value,
    });
  }
  private setActiveCell(rowId: number, columnId: string) {
    const prevActiveCell = this.engine.getActiveCell(this.tableKey);
    if (prevActiveCell?.rowId === rowId && prevActiveCell.columnId === columnId) {
      return;
    }
    this.engine.dispatch({
      type: 'ACTIVE_CELL',
      tableKey: this.tableKey,
      rowId,
      columnId,
    });
  }


  private setActiveRow(rowId: number) {
    this.engine.dispatch({
      type: 'ACTIVE_ROW',
      store: this.store,
      tableKey: this.tableKey,
      rowId,
    });
  }
  private moveActiveCellVertical(
    rowId: number,
    columnId: string,
    direction: 'up' | 'down'
  ) {
    this.engine.dispatch({
      type: 'MOVE_ACTIVE_CELL_VERTICAL',
      store: this.store,
      tableKey: this.tableKey,
      rowId,
      columnId,
      direction,
    });
  }
  private reorderRow(draggedRowId: number, droppedRowId: number, position: 'before' | 'after') {
    this.engine.dispatch({
      type: 'ROW_REORDERED',
      store: this.store,
      tableKey: this.tableKey,
      draggedRowId,
      droppedRowId,
      position
    });
  }
  private addEmptyRow() {
    this.engine.dispatch({
      type: 'ADD_EMPTY_ROW',
      store: this.store,
      tableKey: this.tableKey,
      autoActivate: true,
    });
  }
  private duplicateRow(rowId: number) {
    this.engine.dispatch({
      type: 'DUPLICATE_ROW',
      store: this.store,
      tableKey: this.tableKey,
      rowId,
    });
  }
  private deleteRow(rowId: number) {
    this.engine.dispatch({
      type: 'ROW_DELETED',
      store: this.store,
      tableKey: this.tableKey,
      rowId,
    });
  }
  private deleteTable() {
    this.engine.dispatch({
      type: 'TABLE_DELETED',
      store: this.store,
      tableKey: this.tableKey,
    });
  }
  private registerTable(table: Table) {
    this.engine.dispatch({
      type: 'TABLE_REGISTERED',
      store: this.store,
      tableKey: this.tableKey,
      table
    });
  }
  private async toggleRowExpanded(rowId: number) {
    await this.engine.dispatch({
      type: 'ROW_EXPAND_TOGGLED',
      tableKey: this.tableKey,
      rowId
    });

  }
  private async collapseAll() {
    await this.engine.dispatch({
      type: 'COLLAPSE_ALL_ROWS',
      tableKey: this.tableKey,

    });
  }
  private async toggleRowSelect() {
    await this.engine.dispatch({
      type: 'TOGGLE_SELECT_ALL_ROWS',
      tableKey: this.tableKey,
    });
  }
  private async togglePageRowSelect() {
    await this.engine.dispatch({
      type: 'TOGGLE_SELECT_PAGE_ROWS',
      tableKey: this.tableKey,
    });
  }
  private selectFromActiveToLast(activeRowId: number) {

    if (activeRowId == null) return;

    this.engine.dispatch({
      type: "SELECT_FROM_ACTIVE_TO_LAST",
      tableKey: this.tableKey,
      anchorRowId: activeRowId,
    });
  }

  private async onKeyDown(e: KeyboardEvent, ctx: KeydownCtx) {
    const { canPrev, canNext, page } = this.engine.getViewState(this.tableKey).pagination;
    const { altKey, shiftKey, ctrlKey, code } = e;
    const { activeRowId, activeColumnId } = ctx;
    const selectedRows = this.engine.getSelectedRows(this.tableKey)
     switch (code) {
      case 'KeyN': {
        if (altKey) {
          e.preventDefault();
          this.addEmptyRow();
        }
        return;
      }
      case 'KeyD': {
        if (altKey && activeRowId != null) {
          e.preventDefault();
          this.duplicateRow(activeRowId);
        }
        return;
      }
      case 'Delete': {
        if (activeRowId) {
          e.preventDefault();
          this.deleteRow(activeRowId);
        }
        return;
      }
      case 'End': {
        if (shiftKey && ctrlKey && activeRowId != null) {
          e.preventDefault();
          this.selectFromActiveToLast(activeRowId);
          return;
        }
        if (shiftKey && activeRowId != null) {
          e.preventDefault();
          this.onRowSelect(activeRowId);
        }
        return;
      }
      case ' ': {
        if (activeRowId != null) {
          e.preventDefault();
          this.onRowSelect(activeRowId);
        }
        return;
      }
      case 'NumpadEnter':
      case 'Enter': {
        e.preventDefault();
        if (shiftKey) {
          await this.collapseAll();
          return;
        } else if (altKey) {
          await this.toggleRowExpanded(activeRowId);
          return;
        } else if (activeRowId) {
          if (!activeColumnId) {
            this.activateFirstEditableCell(activeRowId);
          } else {
            this.moveActiveCellVertical(activeRowId, activeColumnId, 'down')
          }
        }
        return;
      }
      case 'Tab': {
        if (activeRowId && activeColumnId) {
          e.preventDefault();
          this.moveToNextCell(
            activeRowId,
            activeColumnId,
            shiftKey ? 'prev' : 'next'
          );
        }
        return;
      }
      case 'ArrowLeft': {
        if (altKey) {
          e.preventDefault();
          await this.collapseAll();
          return;
        }
        if (!activeRowId || !activeColumnId) return;
        e.preventDefault();
        this.moveToNextCell(activeRowId, activeColumnId, 'next');
        return;
      }
      case 'ArrowRight': {
        if (!activeRowId || !activeColumnId) return;

        e.preventDefault();
        this.moveToNextCell(activeRowId, activeColumnId, 'prev');
        return;
      }
      case 'ArrowDown': {
        if (altKey && selectedRows) {
          e.preventDefault();
          await this.moveVerticalSelectedRows('down');
          return;
        }else if (ctrlKey && activeRowId) {
          e.preventDefault();
          await this.moveVerticalActiveRow('down');
          return;
        } else {
          if (!activeRowId) return;
          e.preventDefault();
          this.moveActiveCellVertical(activeRowId, activeColumnId, 'down');
          return;
        }
      }
      case 'ArrowUp': {
        if (altKey && selectedRows) {
          e.preventDefault();
          await this.moveVerticalSelectedRows('up');
          return;
        } else if (ctrlKey && activeRowId) {
          e.preventDefault();
          await this.moveVerticalActiveRow('up');
          return;
        } {
          if (!activeRowId) return;
          e.preventDefault();
          this.moveActiveCellVertical(activeRowId, activeColumnId, 'up');
          return;
        }
      }
      case 'PageUp': {
        if (!canPrev) return;
        e.preventDefault();
        this.engine.dispatch({
          type: 'CHANGE_PAGE',
          tableKey: this.tableKey,
          page: page - 1,
          store: this.store,
        });
        return;
      }
      case 'PageDown': {
        if (!canNext) return;
        e.preventDefault();
        this.engine.dispatch({
          type: 'CHANGE_PAGE',
          tableKey: this.tableKey,
          page: page + 1,
          store: this.store,
        });
        return;
      }
      case 'KeyC': {
        if (altKey) {
          e.preventDefault();
          this.setTableAction('copy');
        }
        return;
      }
      case 'KeyX': {
        if (altKey) {
          e.preventDefault();
          this.setTableAction('cut');
        }
        return;
      }
      case 'KeyV': {
        if (altKey) {
          e.preventDefault();
          this.setTableAction('paste');
        }
        return;
      }
      case 'KeyB': {
        if (altKey) {
          e.preventDefault();
          this.setTableAction('pasteInsert');
        }
        return;
      }
      case 'Escape': {
        e.preventDefault();
        this.setTableAction(null);
        return;
      }
      default:
        return;
    }
  }
  private moveToNextCell(
    rowId: number,
    columnId: string,
    direction: 'next' | 'prev' = 'next'
  ) {
    this.engine.dispatch({
      type: 'MOVE_ACTIVE_CELL',
      store: this.store,
      tableKey: this.tableKey,
      rowId,
      columnId,
      direction,
    });
  }
  private moveVerticalSelectedRows(
    direction: 'down' | 'up' = 'down'
  ) {
    this.engine.dispatch({
      type: 'MOVE_VERTICAL_SELECTED_ROWS',
      tableKey: this.tableKey,
      direction,
    });
  }
  private moveVerticalActiveRow(
    direction: 'down' | 'up' = 'down'
  ) {
    this.engine.dispatch({
      type: 'MOVE_VERTICAL_ACTIVE_ROW',
      tableKey: this.tableKey,
      direction,
    });
  }
  private activateFirstEditableCell(rowId: number) {
    this.engine.dispatch({
      type: 'ACTIVATE_FIRST_CELL',
      tableKey: this.tableKey,
      rowId,
    });
  }
  private async setTableAction(action: TableActions) {
    await this.engine.dispatch({
      type: 'SET_TABLE_ACTION',
      store: this.store,
      tableKey: this.tableKey,
      action
    });

  }
  getViewState() {
    try {
      return this.engine.getViewState(this.tableKey);
    } catch {
      return null;
    }
  }
  getAllRows() {
    try {
      return this.engine.getAllRows(this.tableKey);
    } catch {
      return null;
    }
  }
  getSnapShot() {
    try {
      return this.engine.getSnapShot(this.tableKey);
    } catch {
      return null;
    }
  }
  getCell(rowId: number, columnId: string) {
    try {
      return this.engine.getCell(this.tableKey, rowId, columnId);
    } catch {
      return null;
    }
  }
  getActiveRow() {
    try {
      return this.engine.getActiveRow(this.tableKey);
    } catch {
      return null;
    }
  }
  getSelectedRows(): Record<number, boolean> {
    try {
      return this.engine.getSelectedRows(this.tableKey);
    } catch {
      return null;
    }
  }
  getActiveCell() {
    try {
      return this.engine.getActiveCell(this.tableKey);
    } catch {
      return null;
    }
  }
  subscribe(cb: () => void) {
    try {
      return this.engine.subscribe(this.tableKey, cb);
    } catch {
      return null;
    }
  }
  subscribeColumn(columnId: string, cb: (values: unknown[]) => void) {
    return this.engine.subscribeColumn(this.tableKey, columnId, cb);
  }
 validation: () => (callback: (result: ValidationCallbackResult) => void) => void = () => (callback) => {
  this.engine.validation(this.tableKey, (result) => {
    callback(result);   
  });
}
  isActiveCell(rowId: number, columnId: string) {
    try {
      return this.engine.isActiveCell(this.tableKey, rowId, columnId);
    } catch {
      return null;
    }
  }
  isValidCell(rowId: number, columnId: string):ValidCell {
    try {
      return this.engine.isValidCell(this.tableKey, rowId, columnId);
    } catch {
      return null;
    }
  }
  isActiveRow(rowId: number) {
    try {
      return this.engine.isActiveRow(this.tableKey, rowId);
    } catch {
      return null;
    }
  }
  isSelectedRow(rowId: number) {
    try {
      return this.engine.isSelectedRow(this.tableKey, rowId);
    } catch {
      return null;
    }
  }
  isCutRow(rowId: number) {
    try {
      return this.engine.isCutRow(this.tableKey, rowId);
    } catch {
      return null;
    }
  }
  isExpandableRow(rowId: number) {
    try {
      return this.engine.isExpandableRow(this.tableKey, rowId);
    } catch {
      return null;
    }
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.engine.dispatch({
      type: 'TABLE_DISPOSED',
      store: this.store,
      tableKey: this.tableKey,
    });
  }
  onRowClick(rowId: number, modifiers: { ctrlKey: boolean; shiftKey: boolean }) {
    if (modifiers.shiftKey) {
      this.engine.dispatch({
        type: "ROW_RANGE_SELECTED",
        tableKey: this.tableKey,
        rowId,
      });
    } else if (modifiers.ctrlKey) {
      this.engine.dispatch({
        type: 'ROW_SELECTION_TOGGLED',
        tableKey: this.tableKey,
        rowId,
      });
    } else {
      this.engine.dispatch({
        type: "ACTIVE_ROW",
        store: this.store,
        tableKey: this.tableKey,
        rowId,
      });
    }
  }
  onRowSelect(rowId: number) {
    this.engine.dispatch({
      type: 'ROW_SELECTION_TOGGLED',
      tableKey: this.tableKey,
      rowId
    });
  }
  async dispatch(command: UITableCommand): Promise<void> {
    switch (command.type) {
      case 'CHANGE_PAGE_SIZE':
        this.changePageSize(command.pageSize);
        return;
      case 'CHANGE_PAGE':
        this.changePage(command.page);
        return;

      case 'UI_CELL_CHANGE':
        this.onCellChange(command.rowId, command.columnId, command.value);
        return;
      case 'UI_CELL_CHANGE_DISPLAY':
        this.onCellDisplayChange(command.rowId, command.columnId, command.value);
        return;

      case 'ADD_EMPTY_ROW':
        this.addEmptyRow();
        return;

      case 'DUPLICATE_ROW':
        this.duplicateRow(command.rowId);
        return;

      case 'ROW_DELETED':
        this.deleteRow(command.rowId);
        return;
      case 'TABLE_DELETED':
        this.deleteTable();
        return;
      case 'TOGGLE_ROW_EXPANDED':
        await this.toggleRowExpanded(command.rowId);
        return;
      case 'ROW_REORDERED':
        this.reorderRow(command.draggedRowId, command.droppedRowId, command.position);
        return;
      case 'TABLE_REGISTERED':
        this.registerTable(command.table);
        return;
      case 'UI_ACTIVE_FIRST_CELL':
        this.activateFirstEditableCell(command.rowId)

        return
      case 'UI_ACTIVE_CELL':
        this.setActiveCell(command.rowId, command.columnId)
        return
      case 'UI_MOVE_ACTIVE_CELL':
        this.moveToNextCell(command.rowId, command.columnId, command.direction)
        return
      case 'UI_MOVE_ACTIVE_CELL_VERTICAL':
        this.moveActiveCellVertical(
          command.rowId,
          command.columnId,
          command.direction
        );
        return;
      case 'UI_ACTIVE_ROW':
        this.setActiveRow(command.rowId)
        return
      case 'KEY_DOWN':
        await this.onKeyDown(command.event, command.ctx);
        return;
      case 'TOGGLE_ROW_SELECTED':
        this.toggleRowSelect()
        return
      case 'ROW_SELECTED':
        this.toggleRowSelect()
        return
      case 'TOGGLE_PAGE_ROW_SELECTED':
        this.togglePageRowSelect()
        return
      case 'UI_ACTION_TABLE':
        this.setTableAction(command.action)
        return
      default:
        const _exhaustive: never = command;
        return _exhaustive;
    }
  }


}
