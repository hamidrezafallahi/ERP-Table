// adapters/ui/UITableController.ts

import { AuditLogger } from '../../application/ports/AuditLogger';
import { Row } from '../../domain/entities/Row';
import {
  CollectionScope,
  Table,
} from '../../domain/entities/Table';
import { TableActions } from '../../domain/value-objects';
import { TableEngine } from '../../engine/tableEngine';
import { MOBILE_PAGE_SIZE } from '../../engine/type';
import type {
  GridSearchState,
  MobileEditorState,
  MobileTableViewState,
  ValidationCallbackResult,
  ValidCell,
} from '../../engine/type';
import type {
  ChangelogEntry,
  ChangelogQuery,
} from '../projections/ChangelogProjection';
import type { ChangelogProjection } from '../projections/ChangelogProjection';
import type {
  HistoryItem,
  HistoryPanelViewModel,
  HistoryQuery,
} from '../history/HistoryPanelViewModel';
import type { CellUndoStack } from '../../application/undo/CellUndoStack';
import type { GridSession } from '../../application/session/GridSession';
import { UIRow } from '../../ui/type';
import { UITableCommand } from './uiEvents';

export class UITableController {
  private disposed = false;
  constructor(
    private readonly engine: TableEngine,
    private readonly store: string,
    private readonly tableKey: string,
    private readonly audit: AuditLogger,
    private readonly changelogProjection?: ChangelogProjection,
    private readonly historyPanelViewModel?: HistoryPanelViewModel,
    private readonly cellUndoStack?: CellUndoStack,
    private readonly session?: GridSession,
  ) {}

  // ─── private dispatch helpers ───────────────────────────────────────

  private safe<T>(fn: () => T, context: string): T | null {
    try {
      return fn();
    } catch (error) {
      this.audit.log({
        type: 'ERROR',
        message: `UITableController error in ${context}`,
        payload: { error, tableKey: this.tableKey },
      });
      return null;
    }
  }

  private changePageSize(pageSize: number): void {
    this.engine.dispatch({ type: 'CHANGE_PAGE_SIZE', store: this.store, tableKey: this.tableKey, pageSize });
  }

  private changePage(page: number): void {
    this.engine.dispatch({ type: 'CHANGE_PAGE', store: this.store, tableKey: this.tableKey, page });
  }

  private onCellChange(rowId: number, columnId: string, value: unknown): void {
    this.engine.dispatch({ type: 'CHANGE_CELL_VALUE', store: this.store, tableKey: this.tableKey, rowId, columnId, newValue: value });
  }

  private onDescriptionSave(rowId: number, flag: boolean): void {
    this.engine.dispatch({ type: 'SAVE_DESCRIPTION', store: this.store, tableKey: this.tableKey, rowId, flag });
  }

  private onCellDisplayChange(rowId: number, columnId: string, value: string): void {
    this.engine.dispatch({ type: 'CHANGE_CELL_DISPLAY_VALUE', store: this.store, tableKey: this.tableKey, rowId, columnId, newValue: value });
  }

  private setActiveCell(rowId: number, columnId: string): void {
    const prev = this.engine.getActiveCell();
    if (prev?.rowId === rowId && prev?.columnId === columnId) return;
    this.engine.dispatch({ type: 'ACTIVE_CELL', tableKey: this.tableKey, rowId, columnId });
  }

  private setActiveRow(rowId: number): void {
    this.engine.dispatch({ type: 'ACTIVE_ROW', store: this.store, tableKey: this.tableKey, rowId });
  }

  private moveActiveCellVertical(rowId: number, columnId: string, direction: 'up' | 'down'): void {
    this.engine.dispatch({ type: 'MOVE_ACTIVE_CELL_VERTICAL', store: this.store, tableKey: this.tableKey, rowId, columnId, direction });
  }

  private reorderRow(draggedRowId: number, droppedRowId: number, position: 'before' | 'after'): void {
    this.engine.dispatch({ type: 'ROW_REORDERED', store: this.store, tableKey: this.tableKey, draggedRowId, droppedRowId, position });
  }

  private async addEmptyRow(): Promise<void> {
    await this.engine.dispatch({
      type: 'ADD_EMPTY_ROW',
      store: this.store,
      tableKey: this.tableKey,
      autoActivate: true,
    });
  }

  private async openMobileAddEditor(): Promise<void> {
    await this.addEmptyRow();
    const rowId = this.engine.getActiveRow();
    if (rowId != null) {
      this.setMobileEditor({ mode: 'add', rowId });
    }
  }

  private addNewRows(cmd: { rows: { key: string; value: unknown; display: unknown }[][]; detailFieldKey: string }): void {
    this.engine.dispatch({ type: 'ADD_NEW_ROWS', store: this.store, tableKey: this.tableKey, rows: cmd.rows, detailFieldKey: cmd.detailFieldKey });
  }

  private duplicateRow(rowId: number): void {
    this.engine.dispatch({ type: 'DUPLICATE_ROW', store: this.store, tableKey: this.tableKey, rowId });
  }

  private deleteRow(rowId: number): void {
    this.engine.dispatch({ type: 'ROW_DELETED', store: this.store, tableKey: this.tableKey, rowId });
  }

  private deleteRows(): void {
    this.engine.dispatch({ type: 'ROWS_DELETED', store: this.store, tableKey: this.tableKey });
  }

  private deleteTable(): void {
    this.engine.dispatch({ type: 'TABLE_DELETED', store: this.store, tableKey: this.tableKey });
  }

  private async registerTable(table: Table): Promise<void> {
    await this.engine.dispatch({
      type: 'TABLE_REGISTERED',
      store: this.store,
      tableKey: this.tableKey,
      table,
    });
  }

  private async toggleRowExpanded(rowId: number): Promise<void> {
    await this.engine.dispatch({ type: 'ROW_EXPAND_TOGGLED', tableKey: this.tableKey, rowId });
  }

  private async toggleRowSelect(): Promise<void> {
    await this.engine.dispatch({ type: 'TOGGLE_SELECT_ALL_ROWS', tableKey: this.tableKey });
  }

  private async togglePageRowSelect(): Promise<void> {
    await this.engine.dispatch({ type: 'TOGGLE_SELECT_PAGE_ROWS', tableKey: this.tableKey });
  }

  private selectFromActiveToLast(activeRowId: number): void {
    if (activeRowId == null) return;
    this.engine.dispatch({ type: 'SELECT_FROM_ACTIVE_TO_LAST', tableKey: this.tableKey, anchorRowId: activeRowId });
  }

  private activateFirstEditableCell(rowId: number): void {
    this.engine.dispatch({ type: 'ACTIVATE_FIRST_CELL', tableKey: this.tableKey, rowId });
  }

  private moveToNextCell(rowId: number, columnId: string, direction: 'next' | 'prev' = 'next'): void {
    this.engine.dispatch({ type: 'MOVE_ACTIVE_CELL', store: this.store, tableKey: this.tableKey, rowId, columnId, direction });
  }

  private async setTableAction(action: TableActions): Promise<void> {
    await this.engine.dispatch({ type: 'SET_TABLE_ACTION', store: this.store, tableKey: this.tableKey, action });
  }

  private async setActiveCollection(activeCollection: string): Promise<void> {
    await this.engine.dispatch({ type: 'SET_ACTIVE_COLLECTION', store: this.store, tableKey: this.tableKey, activeCollection });
  }

  private setGridSearch(search: GridSearchState): void {
    this.engine.dispatch({ type: 'SET_GRID_SEARCH', tableKey: this.tableKey, search });
  }

  private setMobileEditor(editor: MobileEditorState): void {
    this.engine.dispatch({ type: 'SET_MOBILE_EDITOR', tableKey: this.tableKey, editor });
  }

  // ─── public read API ────────────────────────────────────────────────

  getViewState() {
    return this.safe(() => this.engine.getViewState(), 'getViewState');
  }

  getMobileViewState(): MobileTableViewState | null | undefined {
    return this.safe(
      () => this.engine.getMobileViewState(),
      'getMobileViewState',
    );
  }

  getRowView(rowId: number): UIRow | null {
    return this.safe(() => this.engine.getRowView(rowId), 'getRowView');
  }

  getAllRows(): Row[] | null {
    return this.safe(() => this.engine.getAllRows(), 'getAllRows');
  }

  getAllUIRows() {
    return this.safe(() => this.engine.getAllUIRows(), 'getAllUIRows');
  }

  getSnapShot(collectionScope?: CollectionScope) {
    return this.safe(() => this.engine.getSnapShot(collectionScope ?? "active"), 'getSnapShot');
  }

  getCell(rowId: number, columnId: string) {
    return this.safe(() => this.engine.getCell(rowId, columnId), 'getCell');
  }

  getChangelog(filter: Omit<ChangelogQuery, 'tableId'> = {}): ChangelogEntry[] {
    if (!this.changelogProjection) return [];
    return this.safe(
      () => this.changelogProjection!.query({ tableId: this.tableKey, ...filter }),
      'getChangelog',
    ) ?? [];
  }

  getChangelogCount(filter: Omit<ChangelogQuery, 'tableId'> = {}): number {
    if (!this.changelogProjection) return 0;
    return this.safe(
      () => this.changelogProjection!.count({ tableId: this.tableKey, ...filter }),
      'getChangelogCount',
    ) ?? 0;
  }

  subscribeChangelog(
    cb: (entries: ChangelogEntry[]) => void,
    filter: Omit<ChangelogQuery, 'tableId'> = {},
  ): () => void {
    if (!this.changelogProjection) return () => {};
    return this.safe(
      () => this.changelogProjection!.subscribe(cb, { tableId: this.tableKey, ...filter }),
      'subscribeChangelog',
    ) ?? (() => {});
  }

  getHistoryItems(filter: Omit<HistoryQuery, 'tableId'> = {}): HistoryItem[] {
    if (!this.historyPanelViewModel) return [];
    return this.safe(
      () => this.historyPanelViewModel!.query({ tableId: this.tableKey, ...filter }),
      'getHistoryItems',
    ) ?? [];
  }

  getHistoryItemCount(filter: Omit<HistoryQuery, 'tableId'> = {}): number {
    if (!this.historyPanelViewModel) return 0;
    return this.safe(
      () => this.historyPanelViewModel!.count({ tableId: this.tableKey, ...filter }),
      'getHistoryItemCount',
    ) ?? 0;
  }

  subscribeHistoryItems(
    cb: (items: HistoryItem[]) => void,
    filter: Omit<HistoryQuery, 'tableId'> = {},
  ): () => void {
    if (!this.historyPanelViewModel) return () => {};
    return this.safe(
      () => this.historyPanelViewModel!.subscribe(cb, { tableId: this.tableKey, ...filter }),
      'subscribeHistoryItems',
    ) ?? (() => {});
  }

  canUndo(): boolean {
    return this.cellUndoStack?.canUndo() ?? false;
  }

  canRedo(): boolean {
    return this.cellUndoStack?.canRedo() ?? false;
  }

  async undo(): Promise<boolean> {
    if (!this.cellUndoStack) return false;
    try {
      return await this.cellUndoStack.undo(this.store, (command) =>
        this.engine.dispatch(command),
      );
    } catch (error) {
      this.audit.log({
        type: 'ERROR',
        message: 'UITableController.undo failed',
        payload: { error, tableKey: this.tableKey },
      });
      return false;
    }
  }

  async redo(): Promise<boolean> {
    if (!this.cellUndoStack) return false;
    try {
      return await this.cellUndoStack.redo(this.store, (command) =>
        this.engine.dispatch(command),
      );
    } catch (error) {
      this.audit.log({
        type: 'ERROR',
        message: 'UITableController.redo failed',
        payload: { error, tableKey: this.tableKey },
      });
      return false;
    }
  }

  getActiveRow() {
    return this.safe(() => this.engine.getActiveRow(), 'getActiveRow');
  }

  getSelectedRows(): Record<number, boolean> | null | undefined {
    return this.safe(() => this.engine.getSelectedRows(), 'getSelectedRows');
  }

  getActiveCell() {
    return this.safe(() => this.engine.getActiveCell(), 'getActiveCell');
  }
  getMobileEditor(){
    return this.safe(() => this.engine.getMobileEditor(), 'getMobileEditor');
  }

  resetMobileVisibleRows(size: number = MOBILE_PAGE_SIZE): void {
    this.changePageSize(size);
  }

  loadMoreMobileRows(step: number = MOBILE_PAGE_SIZE): void {
    const mobileView = this.getMobileViewState();
    if (!mobileView) return;
    const nextPageSize = Math.min(
      mobileView.totalRows,
      mobileView.pageSize + step,
    );
    if (nextPageSize !== mobileView.pageSize) {
      this.changePageSize(nextPageSize);
    }
  }

  revealAllMobileRows(minSize: number = MOBILE_PAGE_SIZE): void {
    const mobileView = this.getMobileViewState();
    if (!mobileView) return;
    const nextPageSize = Math.max(minSize, mobileView.totalRows);
    if (nextPageSize !== mobileView.pageSize) {
      this.changePageSize(nextPageSize);
    }
  }

  isActiveCell(rowId: number, columnId: string) {
    return this.safe(() => this.engine.isActiveCell(rowId, columnId), 'isActiveCell');
  }

  isActiveRow(rowId: number) {
    return this.safe(() => this.engine.isActiveRow(rowId), 'isActiveRow');
  }

  isSelectedRow(rowId: number) {
    return this.safe(() => this.engine.isSelectedRow(rowId), 'isSelectedRow');
  }

  isCutRow(rowId: number) {
    return this.safe(() => this.engine.isCutRow(rowId), 'isCutRow');
  }

  subscribe(cb: () => void) {
    return this.safe(() => this.engine.subscribe(cb), 'subscribe');
  }

  subscribeSelected<TSelected>(
    selector: () => TSelected,
    listener: (selected: TSelected) => void,
    isEqual: (a: TSelected, b: TSelected) => boolean = Object.is,
  ): () => void {
    if (this.session) {
      return this.session.subscribeSelected(selector, listener, isEqual);
    }
    return (
      this.safe(
        () => this.engine.subscribeSelected(selector, listener, isEqual),
        'subscribeSelected',
      ) ?? (() => {})
    );
  }

  getSession(): GridSession | undefined {
    return this.session;
  }

  getTableKey(): string {
    return this.tableKey;
  }

  subscribeColumn<T>(columnId: string, collections: CollectionScope, cb: (values: T[]) => void) {
    return this.engine.subscribeColumn(columnId, collections, cb as (values: unknown[]) => void);
  }
  validation: () => (callback: (result: ValidationCallbackResult) => void) => void = () => (callback) => {
    this.engine.validation((result) => {
      callback(result);
    });
  }
  isValidCell(rowId: number, columnId: string): ValidCell | null {
    try {
      return this.engine.isValidCell(rowId, columnId);
    } catch {
      return null;
    }
  }

  // ─── row interactions ────────────────────────────────────────────────

  onRowClick(rowId: number, modifiers: { ctrlKey: boolean; shiftKey: boolean }): void {
    if (modifiers.shiftKey) {
      this.engine.dispatch({ type: 'ROW_RANGE_SELECTED', tableKey: this.tableKey, rowId });
    } else if (modifiers.ctrlKey) {
      this.engine.dispatch({ type: 'ROW_SELECTION_TOGGLED', tableKey: this.tableKey, rowId });
    } else {
      this.engine.dispatch({ type: 'ACTIVE_ROW', store: this.store, tableKey: this.tableKey, rowId });
    }
  }

  onRowSelect(rowId: number): void {
    this.engine.dispatch({ type: 'ROW_SELECTION_TOGGLED', tableKey: this.tableKey, rowId });
  }

  // ─── lifecycle ───────────────────────────────────────────────────────

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.engine.dispatch({ type: 'TABLE_DISPOSED', store: this.store, tableKey: this.tableKey });
  }

  // ─── main dispatch ───────────────────────────────────────────────────

  async dispatch(command: UITableCommand): Promise<void> {
    try {
      await this.dispatchInternal(command);
    } catch (error) {
      this.audit.log({
        type: 'ERROR',
        message: `UITableController.dispatch failed for command "${command.type}"`,
        payload: { error, tableKey: this.tableKey, command },
      });
    }
  }

  private async dispatchInternal(command: UITableCommand): Promise<void> {
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
      case 'UI_DESCRIPTION_SAVE':
        this.onDescriptionSave(command.rowId, command.flag);
        return;
      case 'UI_CELL_CHANGE_DISPLAY':
        this.onCellDisplayChange(command.rowId, command.columnId, command.value);
        return;
      case 'ADD_EMPTY_ROW':
        await this.addEmptyRow();
        return;
      case 'ADD_NEW_ROWS':
        this.addNewRows(command);
        return;
      case 'DUPLICATE_ROW':
        this.duplicateRow(command.rowId);
        return;
      case 'ROW_DELETED':
        this.deleteRow(command.rowId);
        return;
      case 'UI_DELETE_SELECTED_ROW':
        this.deleteRows();
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
        await this.registerTable(command.table);
        return;
      case 'UI_ACTIVE_FIRST_CELL':
        this.activateFirstEditableCell(command.rowId);
        return;
      case 'UI_ACTIVE_CELL':
        this.setActiveCell(command.rowId, command.columnId);
        return;
      case 'UI_MOVE_ACTIVE_CELL':
        this.moveToNextCell(command.rowId, command.columnId, command.direction);
        return;
      case 'UI_MOVE_ACTIVE_CELL_VERTICAL':
        this.moveActiveCellVertical(command.rowId, command.columnId, command.direction);
        return;
      case 'UI_ACTIVE_ROW':
        this.setActiveRow(command.rowId);
        return;
      case 'KEY_DOWN':
        if (this.session) {
          await this.session.handleKeydown(command.event, command.ctx);
        }
        return;
      case 'TOGGLE_ROW_SELECTED':
        await this.toggleRowSelect();
        return;
      case 'ROW_SELECTED':
        await this.toggleRowSelect();
        return;
      case 'TOGGLE_PAGE_ROW_SELECTED':
        await this.togglePageRowSelect();
        return;
      case 'UI_ACTION_TABLE':
        await this.setTableAction(command.action);
        return;
      case 'UI_CHANGE_ACTIVE_COLLECTION':
        await this.setActiveCollection(command.activeCollection);
        return;
      case 'UI_SET_GRID_SEARCH':
        this.setGridSearch(command.search);
        return;
      case 'UI_CLEAR_GRID_SEARCH':
        this.setGridSearch(null);
        return;
      case 'UI_OPEN_MOBILE_ADD':
        await this.openMobileAddEditor();
        return;
      case 'UI_OPEN_MOBILE_EDIT':
        this.setActiveRow(command.rowId);
        this.setMobileEditor({ mode: 'edit', rowId: command.rowId });
        return;
      case 'UI_CLOSE_MOBILE_EDITOR':
        this.setMobileEditor(null);
        return;
      default: {
        const _exhaustive: never = command;
        return _exhaustive;
      }
    }
  }
}