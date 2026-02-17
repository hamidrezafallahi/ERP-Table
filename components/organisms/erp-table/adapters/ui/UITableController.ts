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
  private cellListeners = new Map<string, Set<() => void>>();
  private rowListeners = new Map<number, Set<() => void>>();
  subscribeCell(rowId: number, columnId: string, cb: () => void) {
    const key = `${rowId}_${columnId}`;
    if (!this.cellListeners.has(key)) {
      this.cellListeners.set(key, new Set());
    }
    this.cellListeners.get(key)!.add(cb);
    return () => {
      this.cellListeners.get(key)?.delete(cb);
    };
  }
  subscribeRow(rowId: number, cb: () => void) {
    const key = rowId;
    if (!this.rowListeners.has(key)) {
      this.rowListeners.set(key, new Set());
    }
    this.rowListeners.get(key)!.add(cb);
    return () => {
      this.rowListeners.get(key)?.delete(cb);
    };
  }
  private notifyCellChange(rowId: number, columnId: string) {
    const key = `${rowId}_${columnId}`;
    this.cellListeners.get(key)?.forEach((cb) => cb());
  }
  private notifyRowChange(rowId: number) {
    const key = rowId;
    this.rowListeners.get(key)?.forEach((cb) => cb());
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
  subscribeColumn<T = unknown>(
    columnId: string,
    cb: (values: T[]) => void
  ) {
    return this.engine.subscribeColumn(
      this.tableKey,
      columnId,
      cb
    );
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
  isExpandableRow(tableKey: string, rowId: number) {
    try {
      return this.engine.isExpandableRow(tableKey, rowId);
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
  subscribe(tableKey: string, cb: () => void) {
    try {
      return this.engine.subscribe(tableKey, cb);
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
    this.notifyCellChange(rowId, columnId);
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
    this.notifyCellChange(rowId, columnId);
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
    this.notifyCellChange(rowId, columnId);
    this.notifyCellChange(prevActiveCell?.rowId, prevActiveCell?.columnId);

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
    console.log(direction)
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
  private isTextInputTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (el.isContentEditable) return true;
    return false;
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
        rowId
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
  private selectFromActiveToLast(activeRowId: number) {

    if (activeRowId == null) return;

    this.engine.dispatch({
      type: "SELECT_FROM_ACTIVE_TO_LAST",
      tableKey: this.tableKey,
      anchorRowId: activeRowId,     // نقطه شروع
    });
  }
  private async onKeyDown(e: KeyboardEvent, ctx: KeydownCtx) {
    const inTextInput = this.isTextInputTarget(e.target);
    const { canPrev, canNext, page } = this.engine.getViewState(this.tableKey).pagination
    const { key, altKey, shiftKey, ctrlKey } = e;
    const { tableKey, activeRowId, activeColumnId } = ctx;

    // if (e.altKey === true) {
    //   //   if (e.key === "s") handleSubmit();
    //   //   if (e.key === "r") handleReset();
    //   //   if (e.key === "n") handleAdd();
    //   //   if (e.key === "c") handleSubmitAndClean();
    //   if (e.key === "b") containerRef.current.focus();
    //   if (e.key === "y") {
    //     toggleFullScreen();






    // Alt+N => Add row
    if (altKey && (key === 'n' || key === 'N')) {
      e.preventDefault();
      this.addEmptyRow();
      return;
    }
    // Ctrl+Shift+End => Select rest rows
    if (shiftKey && ctrlKey && key === 'End') {
      e.preventDefault();
      this.selectFromActiveToLast(activeRowId);
      return;
    }
    // Shift+End => Select active row
    if (shiftKey && (key === 'End')) {
      if (activeRowId == null) return;
      e.preventDefault();
      this.onRowSelect(activeRowId);
      return;
    }

    // Alt+D => Duplicate active row
    if (altKey && (key === 'd' || key === 'D')) {
      if (activeRowId == null) return;
      e.preventDefault();
      this.duplicateRow(activeRowId);
      return;
    }

    // Delete row
    if (!inTextInput && key === 'Delete' && activeRowId) {
      e.preventDefault();
      this.deleteRow(activeRowId);
      return;
    }

    // Enter → edit next row same column
    if (!inTextInput && key === 'Enter' && activeRowId) {
      e.preventDefault();
      this.activateFirstEditableCell(activeRowId);
      return;
    }
    // Tab → move cell
    if (key === 'Tab' && activeRowId && activeColumnId) {
      e.preventDefault();
      this.moveToNextCell(
        activeRowId,
        activeColumnId,
        shiftKey ? 'prev' : 'next'
      );
      return;
    }

    // Shift+Enter => collapse all
    if (key === 'Enter' && shiftKey) {
      e.preventDefault();
      await this.collapseAll();
      return;
    }
    if (key === 'ArrowLeft') {

      e.preventDefault();
      if (!activeRowId || !activeColumnId) return;
      console.log("active next cell")
      this.moveToNextCell(activeRowId, activeColumnId, 'next');
      return

    }
    if (key === 'ArrowRight') {

      e.preventDefault();
      console.log(activeRowId, activeColumnId)
      if (!activeRowId || !activeColumnId) return;
      console.log("active previous cell")
      this.moveToNextCell(activeRowId, activeColumnId, 'prev');
      return;
    }



    if (key === 'ArrowDown') {
      e.preventDefault();
      if (!activeRowId ) return;
       this.moveActiveCellVertical(activeRowId, activeColumnId, 'down');

      return;
    }

    if (key === 'ArrowUp') {
      e.preventDefault();
      if (!activeRowId  ) return;
       this.moveActiveCellVertical(activeRowId, activeColumnId, 'up');
      return;
    }
    if (altKey && key === 'ArrowLeft') {
      e.preventDefault();
      await this.collapseAll();
      return;
    }

    // PageUp / PageDown => pagination
    if (!inTextInput && key === 'PageUp') {
      if (!canPrev) return;
      e.preventDefault();
      this.engine.dispatch({
        type: 'CHANGE_PAGE',

        tableKey: tableKey,
        page: page - 1,
        store: this.store
      });
      return;
    }

    if (!inTextInput && key === 'PageDown') {
      if (!canNext) return;
      e.preventDefault();
      this.engine.dispatch({
        type: 'CHANGE_PAGE',
        tableKey,
        store: this.store,
        page: page + 1,
      });
      return;
    }
  }
  private moveToNextCell(
    rowId: number,
    columnId: string,
    direction: 'next' | 'prev' = 'next'
  ) {
    console.log(direction)
    this.engine.dispatch({
      type: 'MOVE_ACTIVE_CELL',
      tableKey: this.tableKey,
      rowId,
      columnId,
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
