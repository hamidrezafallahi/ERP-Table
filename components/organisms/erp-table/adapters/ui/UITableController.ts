// adapters/ui/UITableController.ts

import { TableEngine } from '../../engine/tableEngine';
import { UITableCommand } from './uiEvents';

type KeydownCtx = {
  tableId: string;
  activeRowId: number | null;
};

export class UITableController {
  constructor(
    private readonly engine: TableEngine,
    private readonly tableId: string,
  ) { }

  getViewState(tableId: string) {
    return this.engine.getViewState(tableId);
  }
  getSnapShot(tableId: string) {
    return this.engine.getSnapShot(tableId);
  }
  subscribe(tableId: string, cb: () => void) {
 
    return this.engine.subscribe(tableId,cb);
  }

  private changePageSize(pageSize: number) {
    this.engine.dispatch({
      type: 'CHANGE_PAGE_SIZE',
      tableId: this.tableId,
      pageSize,
    });
  }

  private changePage(page: number) {
    this.engine.dispatch({
      type: 'CHANGE_PAGE',
      tableId: this.tableId,
      page,
    });
  }

  private onCellChange(rowId: number, columnId: string, value: unknown) {
    this.engine.dispatch({
      type: 'CHANGE_CELL_VALUE',
      tableId: this.tableId,
      rowId,
      columnId,
      newValue: value,
    });
  }

  private reorderRows(draggedRowId: number, droppedRowId: number) {
    this.engine.dispatch({
      type: 'ROW_REORDERED',
      tableId: this.tableId,
      draggedRowId,
      droppedRowId,
    });
  }

  private addEmptyRow() {
    this.engine.dispatch({
      type: 'ADD_EMPTY_ROW',
      tableId: this.tableId,
    });
  }

  private duplicateRow(rowId: number) {
    this.engine.dispatch({
      type: 'DUPLICATE_ROW',
      tableId: this.tableId,
      rowId,
    });
  }

  private deleteRow(rowId: number) {
    this.engine.dispatch({
      type: 'ROW_DELETED',
      tableId: this.tableId,
      rowId,
    });
  }
  private deleteTable() {
    this.engine.dispatch({
      type: 'TABLE_DELETED',
      tableId: this.tableId,
    });
  }

  private async toggleRowExpanded(rowId: number) {
    await this.engine.toggleRowExpanded(this.tableId, rowId);
  }

  private async collapseAll() {
    await this.engine.collapseAll(this.tableId);
  }

  private isTextInputTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (el.isContentEditable) return true;
    return false;
  }

  private async onKeyDown(e: KeyboardEvent, ctx: KeydownCtx) {
    const inTextInput = this.isTextInputTarget(e.target);
    const key = e.key;
    const alt = e.altKey;
    const shift = e.shiftKey;

        // if (e.altKey === true) {
        //   //   if (e.key === "s") handleSubmit();
        //   //   if (e.key === "r") handleReset();
        //   //   if (e.key === "n") handleAdd();
        //   //   if (e.key === "c") handleSubmitAndClean();
        //   if (e.key === "b") containerRef.current.focus();
        //   if (e.key === "y") {
        //     toggleFullScreen();






    // Alt+N => Add row
    if (alt && (key === 'n' || key === 'N')) {
      e.preventDefault();
      this.addEmptyRow();
      return;
    }

    // Alt+D => Duplicate active row
    if (alt && (key === 'd' || key === 'D')) {
      if (ctx.activeRowId == null) return;
      e.preventDefault();
      this.duplicateRow(ctx.activeRowId);
      return;
    }

    // Delete => delete active row
    if (!inTextInput && key === 'Delete') {
      if (ctx.activeRowId == null) return;
      e.preventDefault();
      this.deleteRow(ctx.activeRowId);
      return;
    }

    // Enter => toggle expand active row
    if (!inTextInput && key === 'Enter' && !shift) {
      if (ctx.activeRowId == null) return;
      e.preventDefault();
      await this.toggleRowExpanded(ctx.activeRowId);
      return;
    }

    // Shift+Enter => collapse all
    if (!inTextInput && key === 'Enter' && shift) {
      e.preventDefault();
      await this.collapseAll();
      return;
    }

    // Alt+ArrowLeft => collapse all
    if (alt && key === 'ArrowLeft') {
      e.preventDefault();
      await this.collapseAll();
      return;
    }

    // PageUp / PageDown => pagination
    // if (!inTextInput && key === 'PageUp') {
    //   if (!ctx.pagination.canPrev) return;
    //   e.preventDefault();
    //   this.engine.dispatch({
    //     type: 'CHANGE_PAGE',
    //     tableId: ctx.tableId,
    //     page: ctx.pagination.page - 1,
    //   });
    //   return;
    // }

    // if (!inTextInput && key === 'PageDown') {
    //   if (!ctx.pagination.canNext) return;
    //   e.preventDefault();
    //   this.engine.dispatch({
    //     type: 'CHANGE_PAGE',
    //     tableId: ctx.tableId,
    //     page: ctx.pagination.page + 1,
    //   });
    //   return;
    // }
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
        this.reorderRows(command.draggedRowId, command.droppedRowId);
        return;

      case 'KEY_DOWN':
        await this.onKeyDown(command.event,command.ctx);
        return;

      default:
        const _exhaustive: never = command;
        return _exhaustive;
    }
  }
}
