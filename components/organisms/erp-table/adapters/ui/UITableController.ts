// adapters/ui/UITableController.ts

import { Table } from '../../domain/entities/Table';
import { TableEngine } from '../../engine/tableEngine';
import { UITableCommand } from './uiEvents';

type KeydownCtx = {
  tableKey: string;
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
      tableKey: this.tableKey,
      rowId,
      columnId,
      direction,
    });
  }
  private reorderRows(draggedRowId: number, droppedRowId: number, position: 'before' | 'after') {
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
  private selectFromActiveToLast(activeRowId: number) {

    if (activeRowId == null) return;

    this.engine.dispatch({
      type: "SELECT_FROM_ACTIVE_TO_LAST",
      tableKey: this.tableKey,
      anchorRowId: activeRowId,     // نقطه شروع
    });
  }
  private async onKeyDown(e: KeyboardEvent, ctx: KeydownCtx) {
    const { canPrev, canNext, page } = this.engine.getViewState(this.tableKey).pagination;
    console.log(e, ctx, canPrev, canNext, page)
    const { key, altKey, shiftKey, ctrlKey } = e;
    console.log( key, altKey, shiftKey, ctrlKey)
    const { tableKey, activeRowId, activeColumnId } = ctx;
    console.log( tableKey, activeRowId, activeColumnId)
    const selectedRows = this.engine.getSelectedRows(this.tableKey)
    switch (key) {
      case 'n':
        case 'N': {
          if (altKey) {
            e.preventDefault();
            this.addEmptyRow();
          }
        return;
      }
      case 'd':
        case 'D': {
          if (altKey && activeRowId != null) {
          console.log(e,ctx)
          console.log(canPrev, canNext, page,activeRowId)
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
      case 'Enter': {
        if (shiftKey) {
          e.preventDefault();
          await this.collapseAll();
          return;
        } else if (altKey) {
          e.preventDefault();
          await this.toggleRowExpanded(activeRowId);
          return;
        } else if (activeRowId) {
          e.preventDefault();
          this.activateFirstEditableCell(activeRowId);
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
        } else {
        if (!activeRowId) return;
        e.preventDefault();
        this.moveActiveCellVertical(activeRowId, activeColumnId, 'up');
        return;
      }}
      case 'PageUp': {
        if (!canPrev) return;
        e.preventDefault();
        this.engine.dispatch({
          type: 'CHANGE_PAGE',
          tableKey,
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
          tableKey,
          page: page + 1,
          store: this.store,
        });
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
  private activateFirstEditableCell(rowId: number) {
    this.engine.dispatch({
      type: 'ACTIVATE_FIRST_CELL',
      tableKey: this.tableKey,
      rowId,
    });
  }
  getViewState(tableKey: string) {
    try {
      return this.engine.getViewState(tableKey);
    } catch {
      return null;
    }
  }
  getSnapShot(tableKey: string) {
    try {
      return this.engine.getSnapShot(tableKey);
    } catch {
      return null;
    }
  }
  getCell(tableKey: string, rowId: number, columnId: string) {
    try {
      return this.engine.getCell(tableKey, rowId, columnId);
    } catch {
      return null;
    }
  }
  getActiveRow(tableKey: string) {
    try {
      return this.engine.getActiveRow(tableKey);
    } catch {
      return null;
    }
  }
  getSelectedRows(tableKey: string) {
    try {
      return this.engine.getSelectedRows(tableKey);
    } catch {
      return null;
    }
  }
  getActiveCell(tableKey: string) {
    try {
      return this.engine.getActiveCell(tableKey);
    } catch {
      return null;
    }
  }
  subscribe(tableKey: string, cb: () => void) {
    try {
      return this.engine.subscribe(tableKey, cb);
    } catch {
      return null;
    }
  }
  subscribeColumn(columnId: string, cb: (values: unknown[]) => void) {
    return this.engine.subscribeColumn(this.tableKey, columnId, cb);
  }
  isActiveCell(tableKey: string, rowId: number, columnId: string) {
    try {
      return this.engine.isActiveCell(tableKey, rowId, columnId);
    } catch {
      return null;
    }
  }
  isActiveRow(tableKey: string, rowId: number) {
    try {
      return this.engine.isActiveRow(tableKey, rowId);
    } catch {
      return null;
    }
  }
  isSelectedRow(tableKey: string, rowId: number) {
    try {
      return this.engine.isSelectedRow(tableKey, rowId);
    } catch {
      return null;
    }
  }
  isExpandableRow(tableKey: string, rowId: number) {
    try {
      return this.engine.isExpandableRow(tableKey, rowId);
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
        this.reorderRows(command.draggedRowId, command.droppedRowId, command.position);
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
        console.log('KEY_DOWN')
        await this.onKeyDown(command.event, command.ctx);
        return;
      case 'TOGGLE_ROW_SELECTED':
        this.toggleRowSelect()
        return
      case 'ROW_SELECTED':
        this.toggleRowSelect()
        return
      default:
        const _exhaustive: never = command;
        return _exhaustive;
    }
  }


}
