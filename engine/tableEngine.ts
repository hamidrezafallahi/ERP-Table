import {
  Actor,
  AddEmptyRowCommand,
  ApplicationTableCommand,
  isApplicationTableCommand,
  TableCommand,
} from '../application/commands';
import { TableRepository } from '../application/ports/TableRepository';
import { TableAppService } from '../application/TableAppService';
import { ColumnSchema } from '../bootstrap/type';
import { Cell } from '../domain/entities/Cell';
import { Row } from '../domain/entities/Row';
import {
  CollectionScope,
  Table,
} from '../domain/entities/Table';
import { RowAdded } from '../domain/events';
import {
  ColumnId,
  RowStateEnum,
} from '../domain/value-objects';
import {
  ConsoleAuditLogger,
} from '../infrastructure/Repositories/consoleAuditLogger';
import { UIRow } from '../ui/type';
import { EngineErrorHandler } from './EngineErrorHandler';
import { CellRangeManager } from './managers/CellRangeManager';
import { NavigationManager } from './managers/NavigationManager';
import { RowManager } from './managers/RowManager';
import { SelectionManager } from './managers/SelectionManager';
import {
  canSetColumnVisible,
} from './dataOps/columnVisibility';
import { canSetColumnPinned } from './dataOps/columnPinPolicy';
import {
  createEmptyCellRangeSelection,
  extendCellRangeToEdge,
  type ArrowDirection,
  type CellRange,
  type CellRangeSelection,
} from './selection/cellRange';
import { SparseRowIndex } from './SparseRowIndex';
import { TableStore } from './tableStore';
import {
  CellError,
  MobileTableViewState,
  TableSnapShot,
  TableState,
  TableViewState,
  ValidationCallback,
  ValidCell,
} from './type';
import { clampColumnWidth } from './columnWidth';
import {
  createCellEditSession,
  dirtyDraftColumns,
  isEditingCell,
  leavesEditSession,
  patchDraft,
  readDraft,
  DEFAULT_CELL_EDIT_OPTIONS,
  type CellEditOptions,
  type CellEditSession,
  type CellEditValue,
} from './dataOps/cellEditSession';
import type { FilterModel } from './dataOps/filterModel';
import type { RowModelType } from './dataOps/rowModel';
import { ViewStateBuilder } from './ViewStateBuilder';
import type { ColumnDef } from '../domain/types/ColumnDef';
import { mapColumnSchemasToDefs } from '../infrastructure/columns/mapColumnDef';
import {
  applyHostRowDataToTable,
  defaultGetRowId,
  ensureIndexColumnDef,
  type GetRowId,
} from '../infrastructure/rows/mapRowData';

export class TableEngine {
  // ─── internal state ────────────────────────────────────────────────────────
  private tableStore?: TableStore<TableState>;
  private tableKey?: string;
  /** Durable command store id (for CHANGE_CELL_* on edit commit). */
  private commandStore?: string;
  private cellEditOptions: CellEditOptions = { ...DEFAULT_CELL_EDIT_OPTIONS };
  public readonly errors = new Map<string, CellError>();
  public readonly searchResult = new Map<string, CellError>();
  private readonly asyncCellCache = new Map<
    string,
    { valueKey: string; error?: CellError }
  >();
  private readonly asyncCellSeq = new Map<string, number>();


  // ─── collaborators ─────────────────────────────────────────────────────────
  private readonly errHandler: EngineErrorHandler;
  private readonly selection: SelectionManager;
  private readonly cellRange: CellRangeManager;
  private readonly rowMgr: RowManager;
  private readonly nav: NavigationManager;
  private readonly viewBuilder: ViewStateBuilder;
  /** Notifies host server/infinite row model after sort/filter/page (PR-96). */
  private viewQueryListener?: () => void;

  constructor(
    private readonly app: TableAppService,
    private readonly repo: TableRepository,
    private readonly actor: Actor,
    audit: ConsoleAuditLogger,
  ) {
    this.errHandler = new EngineErrorHandler(audit);
    this.selection = new SelectionManager(
      () => this.tableStore,
      this.errHandler,
      (rowId) => this.viewBuilder.getGroupNode(rowId)?.childRowIds,
    );
    this.cellRange = new CellRangeManager(
      () => this.tableStore,
      () => this.getCellRangeBounds(),
      this.errHandler,
    );
    this.rowMgr = new RowManager(() => this.tableStore, this.errHandler);
    this.viewBuilder = new ViewStateBuilder(() => this.tableStore, this.errHandler);
    this.nav = new NavigationManager(
      () => this.tableStore,
      this.app,
      this.repo,
      this.actor,
      this.errHandler,
      () => this.getViewState(),
      (cmd) => this.dispatch(cmd),
      () => this.getUiRowIndex(),
    );
  }

  // ─── private table lifecycle ────────────────────────────────────────────────

  private async registerTable(cmd: {
    store: string;
    table: Table;
  }): Promise<void> {
    const { store, table } = cmd;
    this.commandStore = store;
    if (this.tableStore && this.tableKey === table.id) {
      const existsInRepo = await this.repo.exists(store, table.id);
      if (existsInRepo) return;
      await this.repo.save(store, table);
      return;
    }
    const tableStore = new TableStore<TableState>({
      table,
      expandedRows: {},
      selectedRows: {},
      activeRowId: undefined,
      activeCell: undefined,
      rangeAnchorRowId: undefined,
      gridSearch: null,
      mobileEditor: null,
      columnWidths: {},
      sortModel: [],
      quickFilterText: '',
      filterModel: {},
      rowModelType: 'clientSide',
      serverRowCount: null,
      cellRangeSelection: createEmptyCellRangeSelection(),
      collapsedColumnGroups: {},
      rowGroupColumns: [],
      groupDefaultExpanded: true,
      rowGroupExpanded: {},
      cellEdit: null,
    });
    this.tableKey = table.id;
    this.tableStore = tableStore;
    this.viewBuilder.invalidateUiRowIndex();
    try {
      await this.repo.save(store, table);
    } catch (e) {
      this.errHandler.handle(e, 'TableEngine.registerTable');
    }
  }

  private async deleteTable(cmd: {
    store: string;
    tableKey: string;
  }): Promise<void> {
    try {
      await this.repo.delete(cmd.store, cmd.tableKey);
    } catch (e) {
      this.errHandler.handle(e, 'TableEngine.deleteTable');
    }
    if (this.tableKey === cmd.tableKey) {
      this.tableStore = undefined;
      this.tableKey = undefined;
      this.viewBuilder.invalidateUiRowIndex();
    }
  }

  private disposeTable(cmd: { store: string; tableKey: string }): void {
    this.repo.delete(cmd.store, cmd.tableKey);
    if (this.tableKey === cmd.tableKey) {
      this.tableStore = undefined;
      this.tableKey = undefined;
      this.viewBuilder.invalidateUiRowIndex();
    }
  }

  private async resetTable(cmd: {
    store: string;
    tableKey: string;
  }): Promise<void> {
    const tableStore = this.getStore(cmd.tableKey);
    if (!tableStore) {
      this.errHandler.notFound('TableStore', cmd.tableKey, 'TableEngine.resetTable');
      return;
    }

    try {
      const freshTable = await this.repo.getById(cmd.store, cmd.tableKey);
      if (!freshTable) {
        this.errHandler.notFound('Table (from repo)', cmd.tableKey, 'TableEngine.resetTable');
        return;
      }
      this.viewBuilder.invalidateUiRowIndex();
      tableStore.setState(prev => ({
        ...prev,
        table: freshTable,
        expandedRows: {},
        selectedRows: {},
        activeRowId: undefined,
        activeCell: undefined,
        rangeAnchorRowId: undefined,
        gridSearch: null,
        mobileEditor: null,
        columnWidths: {},
        sortModel: [],
        quickFilterText: '',
        filterModel: {},
        serverRowCount: null,
        cellRangeSelection: createEmptyCellRangeSelection(),
        collapsedColumnGroups: {},
        rowGroupColumns: [],
        groupDefaultExpanded: true,
        rowGroupExpanded: {},
        cellEdit: null,
      }));
    } catch (e) {
      this.errHandler.handle(e, 'TableEngine.resetTable');
    }
  }

  // ─── private helper ─────────────────────────────────────────────────────────

  private shouldInvalidateUiRowIndex(command: ApplicationTableCommand): boolean {
    switch (command.type) {
      case 'ADD_EMPTY_ROW':
      case 'ROW_DELETED': {
        // Incremental patch skips group nodes — full rebuild when grouping (PR-120).
        const state = this.getStore(command.tableKey)?.getState();
        if ((state?.rowGroupColumns?.length ?? 0) > 0) {
          this.viewBuilder.invalidateQuickFilterIndex();
          return true;
        }
        return false;
      }
      case 'ADD_NEW_ROWS':
      case 'DUPLICATE_ROW':
      case 'PASTE_ROW':
      case 'RESTORE_ADDED_ROW':
      case 'TABLE_DELETED':
      case 'TABLE_RESET':
      case 'ROW_REORDERED':
      case 'SET_ACTIVE_COLLECTION':
        this.viewBuilder.invalidateQuickFilterIndex();
        return true;
      case 'CHANGE_CELL_VALUE': {
        if (command.columnId === 'index') return true;
        const state = this.getStore(command.tableKey)?.getState();
        const sortModel = state?.sortModel ?? [];
        if (sortModel.some((item) => item.colId === command.columnId)) {
          return true;
        }
        if (state?.filterModel?.[command.columnId]) return true;
        if ((state?.rowGroupColumns?.length ?? 0) > 0) return true;
        return Boolean(state?.quickFilterText?.trim());
      }
      case 'PASTE_CELLS':
        this.viewBuilder.invalidateQuickFilterIndex();
        return true;
      default:
        return false;
    }
  }

  private getStore(expectedTableKey?: string): TableStore<TableState> | undefined {
    const store = this.tableStore;
    if (!store || (expectedTableKey && this.tableKey && expectedTableKey !== this.tableKey)) {
      this.errHandler.notFound('TableStore', expectedTableKey ?? this.tableKey ?? 'active', 'TableEngine');
      return undefined;
    }
    return store;
  }

  /**
   * Default case در dispatch:
   * command را به AppService می‌دهد و سپس repo را reload می‌کند.
   */
  private async executeAppCommand(command: ApplicationTableCommand): Promise<void> {
    let result: unknown;

    const prevCellValue =
      command.type === 'CHANGE_CELL_VALUE'
        ? this.getStore(command.tableKey)
            ?.getState()
            .table.getRow(command.rowId)
            ?.getCells()
            .get(command.columnId)
            ?.getValue()
        : undefined;

    try {
      result = await this.app.execute(command, this.actor);
    } catch (e) {
      this.errHandler.handle(e, `TableEngine.dispatch[${command.type}]`);
      return;
    }

    try {
      const updated = await this.repo.getById(
        command.store,
        command.tableKey,
      );
      const store = this.getStore(command.tableKey);
      if (!store || !updated) return;
      if (this.shouldInvalidateUiRowIndex(command)) {
        this.viewBuilder.invalidateUiRowIndex();
      }
      const prev = store.getState();
      store.setState(() => ({ ...prev, table: updated }));

      if (command.type === 'CHANGE_CELL_VALUE') {
        this.viewBuilder.patchQuickFilterRow(command.rowId);
        this.viewBuilder.patchColumnTotal(
          command.columnId,
          prevCellValue,
          command.newValue,
        );
      }

      if (command.type === 'ADD_EMPTY_ROW') {
        const addCommand = command as AddEmptyRowCommand;
        const rowAdded = result as RowAdded | null;
        const rowId = rowAdded?.rowId?.value;
        const grouping =
          (store.getState().rowGroupColumns?.length ?? 0) > 0;

        if (rowId != null && !grouping) {
          this.viewBuilder.patchQuickFilterRow(rowId);
          this.viewBuilder.insertUiRow(rowId);
        } else if (rowId != null) {
          this.viewBuilder.patchQuickFilterRow(rowId);
        }

        if (addCommand.autoActivate && rowId != null) {
          await this.nav.setActiveRow({
            store: addCommand.store,
            tableKey: addCommand.tableKey,
            rowId,
          });
        }
      }

      if (command.type === 'ROW_DELETED') {
        const grouping =
          (store.getState().rowGroupColumns?.length ?? 0) > 0;
        if (!grouping) {
          this.viewBuilder.removeUiRow(command.rowId);
        }
      }

      if (
        command.type === 'CHANGE_PAGE' ||
        command.type === 'CHANGE_PAGE_SIZE'
      ) {
        this.notifyViewQueryChanged();
      }
    } catch (e) {
      this.errHandler.handle(e, `TableEngine.dispatch.reload[${command.type}]`);
    }
  }

  /**
   * Paste goes through AppService (PASTE_ROW + optional ROW_DELETED for cut)
   * with one correlationId so undo reverses the whole unit.
   */
  private async executePasteAction(command: {
    store: string;
    tableKey: string;
    action: 'paste' | 'pasteInsert';
    correlationId?: string;
  }): Promise<void> {
    const store = this.getStore(command.tableKey);
    if (!store) return;

    const { table, selectedRows, activeRowId } = store.getState();
    const wasCut = table.getTableAction() === 'cut';
    const correlationId =
      command.correlationId ??
      `paste-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const sources = table
      .getRows()
      .filter((r) => r.rowState.value !== RowStateEnum.Deleted)
      .filter((row) => selectedRows[row.id.value] === true)
      .sort((a, b) => {
        const aIndex = Number(a.getCells().get('index')?.getValue() ?? 0);
        const bIndex = Number(b.getCells().get('index')?.getValue() ?? 0);
        return bIndex - aIndex;
      });

    if (sources.length === 0) {
      table.setTableAction(null);
      store.setState((prev) => ({ ...prev, table }));
      return;
    }

    const placeAtRowId =
      command.action === 'pasteInsert' ? activeRowId : undefined;

    for (const row of sources) {
      await this.executeAppCommand({
        type: 'PASTE_ROW',
        store: command.store,
        tableKey: command.tableKey,
        sourceRowId: row.id.value,
        placeAtRowId,
        correlationId,
      });
    }

    if (wasCut) {
      for (const row of sources) {
        await this.executeAppCommand({
          type: 'ROW_DELETED',
          store: command.store,
          tableKey: command.tableKey,
          rowId: row.id.value,
          correlationId,
        });
      }
      const afterCut = this.getStore(command.tableKey);
      afterCut?.setState((prev) => ({ ...prev, selectedRows: {} }));
    }

    try {
      const updated = await this.repo.getById(command.store, command.tableKey);
      updated.setTableAction(null);
      await this.repo.save(command.store, updated);
      const live = this.getStore(command.tableKey);
      if (live) {
        const prev = live.getState();
        live.setState(() => ({ ...prev, table: updated }));
      }
    } catch (e) {
      this.errHandler.handle(e, 'TableEngine.executePasteAction.clearAction');
    }
  }

  // ─── public dispatch ────────────────────────────────────────────────────────

  async dispatch(command: TableCommand): Promise<void> {
    switch (command.type) {
      // ── Navigation ──────────────────────────────────────────────────────────
      case 'ACTIVE_CELL':
        await this.transitionActiveCell(command.rowId, command.columnId);
        return;
      case 'ACTIVE_ROW':
        await this.nav.setActiveRow(command);
        return;
      case 'MOVE_ACTIVE_CELL':
        await this.commitCellEdit();
        await this.nav.moveActiveCell(command);
        this.maybeStartEditForActiveCell();
        return;
      case 'MOVE_ACTIVE_CELL_VERTICAL':
        await this.commitCellEdit();
        await this.nav.moveActiveCellVertical(command);
        this.maybeStartEditForActiveCell();
        return;
      case 'ACTIVATE_FIRST_CELL':
        await this.commitCellEdit();
        this.nav.activateFirstCell(command);
        this.maybeStartEditForActiveCell();
        return;

      // ── Table lifecycle ──────────────────────────────────────────────────────
      case 'TABLE_REGISTERED':
        await this.registerTable(command);
        return;
      case 'TABLE_DELETED':
        await this.deleteTable(command);
        return;
      case 'TABLE_DISPOSED':
        this.disposeTable(command);
        return;
      case 'TABLE_RESET':
        await this.resetTable(command);
        return;

      // ── Row expand / collapse ────────────────────────────────────────────────
      case 'ROW_EXPANDED':
        this.rowMgr.setRowExpanded(command);
        return;
      case 'ROW_EXPAND_TOGGLED':
        this.rowMgr.toggleRowExpanded(command);
        return;
      case 'COLLAPSE_ALL_ROWS':
        this.rowMgr.collapseAll(command.tableKey);
        return;

      // ── Row movement ─────────────────────────────────────────────────────────
      case 'MOVE_VERTICAL_SELECTED_ROWS':
        this.viewBuilder.invalidateUiRowIndex();
        this.rowMgr.moveVerticalSelectedRows(command);
        return;
      case 'MOVE_VERTICAL_ACTIVE_ROW':
        this.viewBuilder.invalidateUiRowIndex();
        this.rowMgr.moveVerticalActiveRow(command);
        return;

      // ── Row selection ────────────────────────────────────────────────────────
      case 'ROWS_DELETED':
        this.selection.deleteAll(command.tableKey);
        return;
      case 'TOGGLE_SELECT_ALL_ROWS':
        this.selection.toggleSelectAllRows(command);
        return;
      case 'TOGGLE_SELECT_PAGE_ROWS':
        this.selection.toggleSelectPageRows(command);
        return;
      case 'CLEAR_ROW_SELECTION':
        this.selection.clearRowSelection(command);
        return;
      case 'ROW_SELECTION_TOGGLED':
        this.selection.toggleRowSelection(command);
        return;
      case 'ROW_RANGE_SELECTED':
        this.selection.selectRange(command);
        return;
      case 'ROW_SELECTED':
        this.selection.setSelectRow(command);
        return;
      case 'SELECT_FROM_ACTIVE_TO_LAST':
        this.selection.selectFromActiveToLast(command);
        return;

      // ── Table action (copy/cut/paste) ────────────────────────────────────────
      case 'SET_TABLE_ACTION': {
        const pasteAction = command.action;
        if (pasteAction === 'paste' || pasteAction === 'pasteInsert') {
          await this.executePasteAction({
            store: command.store,
            tableKey: command.tableKey,
            action: pasteAction,
            correlationId: command.correlationId,
          });
          return;
        }
        const activeRowId = this.getStore(command.tableKey)?.getState().activeRowId;
        this.rowMgr.setTableAction(command, activeRowId);
        return;
      }

      // ── UI overlay state ─────────────────────────────────────────────────────
      case 'SET_GRID_SEARCH':
        this.setGridSearch(command);
        return;
      case 'SET_MOBILE_EDITOR':
        this.setMobileEditor(command);
        return;
      case 'RESIZE_COLUMN':
        this.resizeColumn(command);
        return;
      case 'SET_COLUMN_VISIBLE':
        this.setColumnVisible(command);
        return;
      case 'TOGGLE_COLUMN_GROUP':
        this.toggleColumnGroup(command);
        return;
      case 'SET_COLUMN_PIN':
        this.setColumnPinned(command);
        return;
      case 'SET_SORT_MODEL':
        this.setSortModel(command);
        return;
      case 'SET_QUICK_FILTER_TEXT':
        this.setQuickFilterText(command);
        return;
      case 'SET_FILTER_MODEL':
        this.setFilterModel(command);
        return;
      case 'SET_ROW_GROUP_COLUMNS':
        this.setRowGroupColumns(command);
        return;
      case 'SET_GROUP_DEFAULT_EXPANDED':
        this.setGroupDefaultExpanded(command);
        return;
      case 'TOGGLE_ROW_GROUP':
        this.toggleRowGroup(command);
        return;

      // ── Delegate to AppService ───────────────────────────────────────────────
      default:
        if (!isApplicationTableCommand(command)) {
          this.errHandler.handle(
            new Error(
              `Unhandled engine command: ${(command as { type: string }).type}`,
            ),
            'TableEngine.dispatch'
          );
          return;
        }
        await this.executeAppCommand(command);
    }
  }

  private setGridSearch(command: {
    tableKey: string;
    search: TableState['gridSearch'];
  }): void {
    const store = this.getStore(command.tableKey);
    if (!store) return;
    store.setState(prev => ({
      ...prev,
      gridSearch: command.search,
    }));
  }

  private setMobileEditor(command: {
    tableKey: string;
    editor: TableState['mobileEditor'];
  }): void {
    const store = this.getStore(command.tableKey);
    if (!store) return;
    store.setState(prev => ({
      ...prev,
      mobileEditor: command.editor,
    }));
  }

  private resizeColumn(command: {
    tableKey: string;
    columnId: string;
    width: number;
  }): void {
    const store = this.getStore(command.tableKey);
    if (!store) return;
    const col = store
      .getState()
      .table.getActiveCollectionColumns()
      .find((c) => c.fieldName === command.columnId);
    const next = clampColumnWidth(command.width, col ?? { fieldName: command.columnId });
    store.setState(prev => ({
      ...prev,
      columnWidths: {
        ...(prev.columnWidths ?? {}),
        [command.columnId]: next,
      },
    }));
  }

  private setColumnPinned(command: {
    tableKey: string;
    columnId: string;
    pinned: 'start' | 'end' | null;
  }): void {
    const store = this.getStore(command.tableKey);
    if (!store) return;
    const { table } = store.getState();
    const schema = table
      .getActiveCollectionColumns()
      .find((c) => c.fieldName === command.columnId);
    const check = canSetColumnPinned(schema, command.pinned);
    if (!check.ok) return;
    const changed = table.setColumnPinned(command.columnId, check.pinned);
    if (!changed) return;
    store.setState((prev) => ({ ...prev, table }));
  }

  private toggleColumnGroup(command: {
    tableKey: string;
    groupId: string;
  }): void {
    const store = this.getStore(command.tableKey);
    if (!store) return;
    store.setState((prev) => {
      const collapsed = { ...(prev.collapsedColumnGroups ?? {}) };
      if (collapsed[command.groupId]) delete collapsed[command.groupId];
      else collapsed[command.groupId] = true;
      return { ...prev, collapsedColumnGroups: collapsed };
    });
  }

  private setColumnVisible(command: {
    tableKey: string;
    columnId: string;
    visible: boolean;
  }): void {
    const store = this.getStore(command.tableKey);
    if (!store) return;
    const { table } = store.getState();
    const schema = table
      .getActiveCollectionColumns()
      .find((c) => c.fieldName === command.columnId);
    const check = canSetColumnVisible(schema, command.visible);
    if (!check.ok) return;
    const changed = table.setColumnHidden(command.columnId, check.hidden);
    if (!changed) return;
    store.setState((prev) => ({ ...prev, table }));
  }

  private setSortModel(command: {
    tableKey: string;
    sortModel: readonly { colId: string; sort: 'asc' | 'desc' }[];
  }): void {
    const store = this.getStore(command.tableKey);
    if (!store) return;
    const next = command.sortModel
      .filter(
        (item) =>
          item &&
          typeof item.colId === 'string' &&
          item.colId.length > 0 &&
          (item.sort === 'asc' || item.sort === 'desc'),
      )
      .map((item) => ({ colId: item.colId, sort: item.sort }));
    store.setState((prev) => ({
      ...prev,
      sortModel: next,
    }));
    this.viewBuilder.invalidateUiRowIndex();
    this.notifyViewQueryChanged();
  }

  private setQuickFilterText(command: {
    tableKey: string;
    quickFilterText: string;
  }): void {
    const store = this.getStore(command.tableKey);
    if (!store) return;
    const next =
      typeof command.quickFilterText === 'string'
        ? command.quickFilterText
        : '';
    store.setState((prev) => ({
      ...prev,
      quickFilterText: next,
    }));
    // Blobs stay cached — only re-apply the query (PR-93).
    this.viewBuilder.invalidateUiRowIndex();
  }

  private setFilterModel(command: {
    tableKey: string;
    filterModel: FilterModel;
  }): void {
    const store = this.getStore(command.tableKey);
    if (!store) return;
    const next =
      command.filterModel && typeof command.filterModel === 'object'
        ? { ...command.filterModel }
        : {};
    store.setState((prev) => ({
      ...prev,
      filterModel: next,
    }));
    this.viewBuilder.invalidateUiRowIndex();
    this.notifyViewQueryChanged();
  }

  private setRowGroupColumns(command: {
    tableKey: string;
    columns: readonly string[];
  }): void {
    const store = this.getStore(command.tableKey);
    if (!store) return;
    const next = command.columns
      .filter((c) => typeof c === 'string' && c.trim() !== '')
      .map((c) => c.trim());
    store.setState((prev) => ({
      ...prev,
      rowGroupColumns: next,
      rowGroupExpanded: {},
    }));
    this.viewBuilder.invalidateUiRowIndex();
  }

  private setGroupDefaultExpanded(command: {
    tableKey: string;
    expanded: boolean;
  }): void {
    const store = this.getStore(command.tableKey);
    if (!store) return;
    store.setState((prev) => ({
      ...prev,
      groupDefaultExpanded: Boolean(command.expanded),
      rowGroupExpanded: {},
    }));
    this.viewBuilder.invalidateUiRowIndex();
  }

  private toggleRowGroup(command: {
    tableKey: string;
    groupKey: string;
  }): void {
    const store = this.getStore(command.tableKey);
    if (!store) return;
    const state = store.getState();
    const key = command.groupKey;
    const current = Object.prototype.hasOwnProperty.call(
      state.rowGroupExpanded,
      key,
    )
      ? state.rowGroupExpanded[key]!
      : state.groupDefaultExpanded;
    store.setState((prev) => ({
      ...prev,
      rowGroupExpanded: {
        ...prev.rowGroupExpanded,
        [key]: !current,
      },
    }));
    this.viewBuilder.invalidateUiRowIndex();
  }

  /**
   * Server/infinite row model hooks (PR-96).
   * Listener runs after sort / filter / page changes.
   */
  bindViewQueryListener(listener: (() => void) | undefined): void {
    this.viewQueryListener = listener;
  }

  setRowModelType(rowModelType: RowModelType): void {
    const store = this.getStore();
    if (!store) return;
    store.setState((prev) => ({
      ...prev,
      rowModelType,
    }));
    this.viewBuilder.invalidateUiRowIndex();
  }

  setServerRowCount(count: number | null): void {
    const store = this.getStore();
    if (!store) return;
    store.setState((prev) => ({
      ...prev,
      serverRowCount: count,
    }));
  }

  private notifyViewQueryChanged(): void {
    this.viewQueryListener?.();
  }

  // ─── public read API ────────────────────────────────────────────────────────

  getViewState(): TableViewState | undefined {
    return this.viewBuilder.getViewState();
  }

  /**
   * Diff `rowData` onto the live table without resetting it (PR-82).
   * Unchanged domain rows keep identity so UI `React.memo` can skip them.
   */
  applyHostRowData<TRow>(
    rowData: readonly TRow[],
    columnDefs?: ColumnDef<TRow>[],
    getRowId?: GetRowId<TRow>,
  ): void {
    const store = this.getStore();
    if (!store) return;
    const { table } = store.getState();
    const defs = ensureIndexColumnDef(
      columnDefs && columnDefs.length > 0
        ? columnDefs
        : mapColumnSchemasToDefs<TRow>(table.getColumns()),
    );
    const result = applyHostRowDataToTable(
      table,
      rowData,
      defs,
      getRowId ?? defaultGetRowId,
    );
    if (result.removedIds.length) {
      this.viewBuilder.forgetUiRows(result.removedIds);
    }
    if (result.added === 0 && result.updated === 0 && result.removed === 0) {
      return;
    }
    if (result.structureChanged) {
      this.viewBuilder.invalidateUiRowIndex();
    }
    store.setState((prev) => ({ ...prev, table }));
  }

  getAllRows(): Row[] | null {
    return this.viewBuilder.getAllRows();
  }

  getAllUIRows(): UIRow[] | null {
    return this.viewBuilder.getAllUIRows();
  }

  /** Flat group/leaf nodes (PR-120). */
  getFlatUiNodes() {
    return this.viewBuilder.getFlatUiNodes();
  }

  getGroupNode(rowId: number) {
    return this.viewBuilder.getGroupNode(rowId);
  }

  /** Expand/collapse group for the active synthetic row (PR-121). */
  toggleRowGroupById(rowId: number): boolean {
    const node = this.viewBuilder.getGroupNode(rowId);
    if (!node || !this.tableKey) return false;
    this.toggleRowGroup({ tableKey: this.tableKey, groupKey: node.key });
    return true;
  }

  getUiRowIndex(): SparseRowIndex<number> {
    return this.viewBuilder.getUiRowIndex();
  }

  /** Absolute 0-based position in the filter/sort UI order (PR-99). */
  getUiRowAbsoluteIndex(rowId: number): number {
    return this.viewBuilder.getUiRowIndex().indexOf(rowId);
  }

  getCellRanges(): readonly CellRange[] {
    if (!this.tableKey) return [];
    return this.cellRange.getSelection(this.tableKey).ranges;
  }

  addCellRange(range: CellRange): void {
    if (!this.tableKey) return;
    this.cellRange.addRange(this.tableKey, range);
  }

  handleCellRangePointer(
    rowId: number,
    colId: string,
    modifiers: { shiftKey: boolean; ctrlKey: boolean },
  ): void {
    if (!this.tableKey) return;
    const rowIndex = this.getUiRowAbsoluteIndex(rowId);
    if (rowIndex < 0) return;
    this.cellRange.handlePointer({
      tableKey: this.tableKey,
      rowIndex,
      colId,
      shiftKey: modifiers.shiftKey,
      ctrlKey: modifiers.ctrlKey,
    });
  }

  extendCellRangeArrow(direction: ArrowDirection): void {
    if (!this.tableKey) return;
    const selection = this.cellRange.extendWithArrow(this.tableKey, direction);
    this.syncActiveCellToRangeFocus(selection);
  }

  extendCellRangeToEdge(direction: ArrowDirection): void {
    if (!this.tableKey) return;
    const bounds = this.getCellRangeBounds();
    const prev = this.cellRange.getSelection(this.tableKey);
    const next = extendCellRangeToEdge(prev, direction, bounds);
    this.cellRange.setSelection(this.tableKey, next);
    this.syncActiveCellToRangeFocus(next);
  }

  jumpActiveCellRowEdge(edge: 'start' | 'end'): void {
    if (!this.tableKey) return;
    const store = this.tableStore;
    if (!store) return;
    const { activeCell } = store.getState();
    if (!activeCell) return;
    void this.commitCellEdit().then(() => {
      if (!this.tableKey) return;
      this.nav.jumpActiveCellRowEdge({
        tableKey: this.tableKey,
        rowId: activeCell.rowId,
        columnId: activeCell.columnId,
        edge,
      });
      this.syncCellRangeToActiveCell();
      this.maybeStartEditForActiveCell();
    });
  }

  jumpActiveCellGridCorner(corner: 'first' | 'last'): void {
    if (!this.tableKey) return;
    void this.commitCellEdit().then(() => {
      if (!this.tableKey) return;
      this.nav.jumpActiveCellGridCorner({
        tableKey: this.tableKey,
        corner,
      });
      this.syncCellRangeToActiveCell();
      this.maybeStartEditForActiveCell();
    });
  }

  private syncActiveCellToRangeFocus(selection: CellRangeSelection): void {
    if (!this.tableKey) return;
    const focus = selection.focus;
    if (!focus) return;
    const rowId = this.getUiRowIndex().getOrderedIds()[focus.rowIndex];
    if (rowId === undefined) return;
    this.nav.setActiveCell({
      tableKey: this.tableKey,
      rowId,
      columnId: focus.colId,
    });
  }

  selectAllCells(): void {
    if (!this.tableKey) return;
    const selection = this.cellRange.selectAll(this.tableKey);
    const focus = selection.focus;
    if (!focus) return;
    const rowId = this.getUiRowIndex().getOrderedIds()[focus.rowIndex];
    if (rowId === undefined) return;
    this.nav.setActiveCell({
      tableKey: this.tableKey,
      rowId,
      columnId: focus.colId,
    });
  }

  syncCellRangeToActiveCell(): void {
    if (!this.tableKey) return;
    const store = this.tableStore;
    if (!store) return;
    const { activeCell } = store.getState();
    if (!activeCell) return;
    this.handleCellRangePointer(activeCell.rowId, activeCell.columnId, {
      shiftKey: false,
      ctrlKey: false,
    });
  }

  private getCellRangeBounds() {
    const store = this.tableStore;
    if (!store) {
      return { rowCount: 0, columnOrder: [] as readonly string[] };
    }
    const { table } = store.getState();
    const columnOrder = table
      .getColumns()
      .filter((c) => !c.hidden)
      .map((c) => c.fieldName);
    return {
      rowCount: this.getUiRowCount(),
      columnOrder,
    };
  }

  findColumnSearchMatches(
    columnId: string,
    query: string,
  ): Array<{ rowId: number; columnId: string }> {
    return this.viewBuilder.findColumnSearchMatches(columnId, query);
  }

  getColumnTotals(): Record<string, number> {
    return this.viewBuilder.getColumnTotals();
  }

  getColumnAggs(): Record<string, unknown> {
    return this.viewBuilder.getColumnAggs();
  }

  getColumnAggValue(
    columnId: string,
    overrideAgg?: import('../domain/types/ColumnDef').AggFunc,
  ): unknown {
    return this.viewBuilder.getColumnAggValue(columnId, overrideAgg);
  }

  subscribeColumnTotals(
    cb: (totals: Record<string, number>) => void,
  ): (() => void) | null {
    const store = this.getStore();
    if (!store) return null;
    let prev = this.viewBuilder.getColumnTotals();
    cb(prev);
    return store.subscribe(() => {
      const next = this.viewBuilder.getColumnTotals();
      const keys = Object.keys(next);
      const changed =
        keys.length !== Object.keys(prev).length ||
        keys.some((k) => next[k] !== prev[k]);
      if (changed) {
        prev = next;
        cb(next);
      }
    });
  }

  subscribeColumnAggs(
    cb: (aggs: Record<string, unknown>) => void,
  ): (() => void) | null {
    const store = this.getStore();
    if (!store) return null;
    let prev = this.viewBuilder.getColumnAggs();
    cb(prev);
    return store.subscribe(() => {
      const next = this.viewBuilder.getColumnAggs();
      const keys = new Set([...Object.keys(next), ...Object.keys(prev)]);
      let changed = false;
      for (const k of keys) {
        if (next[k] !== prev[k]) {
          changed = true;
          break;
        }
      }
      if (changed) {
        prev = next;
        cb(next);
      }
    });
  }

  getUiRowCount(): number {
    return this.viewBuilder.getUiRowCount();
  }

  projectVisibleUiRows(range: { startIndex: number; endIndex: number }): UIRow[] {
    return this.viewBuilder.projectVisibleUiRows(range);
  }

  getMobileViewState(): MobileTableViewState | undefined {
    return this.viewBuilder.getMobileViewState();
  }

  getRowView(rowId: number): UIRow | null {
    return this.viewBuilder.getRowView(rowId);
  }

  getSnapShot(collectionScope: CollectionScope): TableSnapShot | null {
    return this.viewBuilder.getSnapShot(collectionScope);
  }

  getExpandedRowData(rowId: number): Record<string, unknown> | null {
    return this.viewBuilder.getExpandedRowData(rowId);
  }

  getActiveCell(): TableState['activeCell'] | null {
    return this.viewBuilder.getActiveCell();
  }

  /** Force a view-store tick so bound React rows re-read cells (PR-86). */
  refreshView(): void {
    const store = this.tableStore;
    if (!store) return;
    this.viewBuilder.invalidateUiRowIndex();
    store.setState((prev) => ({ ...prev }));
  }

  setCellEditOptions(partial: Partial<CellEditOptions>): void {
    this.cellEditOptions = {
      ...this.cellEditOptions,
      ...partial,
    };
  }

  getCellEditOptions(): CellEditOptions {
    return this.cellEditOptions;
  }

  getCellEdit(): CellEditSession | null {
    return this.tableStore?.getState().cellEdit ?? null;
  }

  getEditDraft(rowId: number, columnId: string): CellEditValue | null {
    return readDraft(this.getCellEdit(), rowId, columnId);
  }

  isEditingCell(rowId: number, columnId: string): boolean {
    return isEditingCell(this.getCellEdit(), rowId, columnId);
  }

  /**
   * Begin a session-only draft for the cell (or full row). Does not touch EventStore.
   */
  startCellEdit(rowId: number, columnId: string): void {
    const store = this.tableStore;
    if (!store || !this.tableKey) return;
    const { table, cellEdit } = store.getState();
    if (
      cellEdit &&
      cellEdit.rowId === rowId &&
      (cellEdit.editType === 'fullRow' || cellEdit.columnId === columnId)
    ) {
      if (cellEdit.columnId !== columnId) {
        store.setState((prev) => ({
          ...prev,
          cellEdit: prev.cellEdit
            ? { ...prev.cellEdit, columnId }
            : null,
        }));
      }
      return;
    }
    const row = table.getRow(rowId);
    if (!row) return;
    const schema = table.getColumns().find((c) => c.fieldName === columnId);
    if (schema && schema.editable === false) return;

    const editType = this.cellEditOptions.editType;
    const baseline: Record<string, CellEditValue> = {};
    if (editType === 'fullRow') {
      for (const col of table.getColumns()) {
        if (col.fieldName === 'index') continue;
        if (col.editable === false) continue;
        const cell = row.getCell(col.fieldName);
        baseline[col.fieldName] = {
          value: cell?.getValue() ?? null,
          display: cell?.getDisplay() ?? null,
        };
      }
    } else {
      const cell = row.getCell(columnId);
      baseline[columnId] = {
        value: cell?.getValue() ?? null,
        display: cell?.getDisplay() ?? null,
      };
    }
    if (!baseline[columnId] && editType === 'cell') {
      baseline[columnId] = { value: null, display: null };
    }

    store.setState((prev) => ({
      ...prev,
      activeRowId: rowId,
      activeCell: { rowId, columnId },
      cellEdit: createCellEditSession({
        rowId,
        columnId,
        editType,
        baseline,
      }),
    }));
  }

  patchCellEdit(
    rowId: number,
    columnId: string,
    patch: Partial<CellEditValue>,
  ): void {
    const store = this.tableStore;
    if (!store) return;
    const session = store.getState().cellEdit;
    if (!session || session.rowId !== rowId) return;
    if (session.editType === 'cell' && !(columnId in session.baseline)) {
      // Allow late column focus within fullRow only; cell mode sticks to session cols.
    }
    if (session.editType === 'cell' && columnId !== session.columnId) {
      // Still allow patch if baseline has the column (shouldn't happen).
      if (!(columnId in session.drafts) && !(columnId in session.baseline)) {
        return;
      }
    }
    store.setState((prev) => {
      if (!prev.cellEdit || prev.cellEdit.rowId !== rowId) return prev;
      return {
        ...prev,
        cellEdit: patchDraft(prev.cellEdit, columnId, patch),
      };
    });
  }

  /** Discard drafts; restore UI to domain values. No EventStore write. */
  cancelCellEdit(): void {
    const store = this.tableStore;
    if (!store) return;
    if (!store.getState().cellEdit) return;
    store.setState((prev) => ({ ...prev, cellEdit: null }));
  }

  /**
   * Write dirty drafts via CHANGE_CELL_* then clear the session.
   * @returns number of value-change commands dispatched
   */
  async commitCellEdit(): Promise<number> {
    const store = this.tableStore;
    const commandStore = this.commandStore;
    const tableKey = this.tableKey;
    if (!store || !commandStore || !tableKey) return 0;
    const session = store.getState().cellEdit;
    if (!session) return 0;
    const dirty = dirtyDraftColumns(session);
    store.setState((prev) => ({ ...prev, cellEdit: null }));
    let writes = 0;
    for (const colId of dirty) {
      const draft = session.drafts[colId]!;
      const base = session.baseline[colId];
      if (!base || draft.value !== base.value) {
        await this.dispatch({
          type: 'CHANGE_CELL_VALUE',
          store: commandStore,
          tableKey,
          rowId: session.rowId,
          columnId: colId,
          newValue: draft.value,
        });
        writes += 1;
      }
      if (!base || draft.display !== base.display) {
        await this.dispatch({
          type: 'CHANGE_CELL_DISPLAY_VALUE',
          store: commandStore,
          tableKey,
          rowId: session.rowId,
          columnId: colId,
          newValue:
            draft.display == null ? '' : String(draft.display),
        });
      }
    }
    return writes;
  }

  private async transitionActiveCell(
    rowId: number,
    columnId: string,
  ): Promise<void> {
    const store = this.tableStore;
    if (!store || !this.tableKey) return;
    const session = store.getState().cellEdit;
    if (leavesEditSession(session, rowId, columnId)) {
      await this.commitCellEdit();
    } else if (session && session.editType === 'fullRow' && session.rowId === rowId) {
      store.setState((prev) => ({
        ...prev,
        cellEdit: prev.cellEdit
          ? { ...prev.cellEdit, columnId }
          : null,
      }));
    }
    this.nav.setActiveCell({
      tableKey: this.tableKey,
      rowId,
      columnId,
    });
    if (this.cellEditOptions.singleClickEdit) {
      this.startCellEdit(rowId, columnId);
    }
  }

  private maybeStartEditForActiveCell(): void {
    if (!this.cellEditOptions.singleClickEdit) return;
    const active = this.getActiveCell();
    if (!active) return;
    this.startCellEdit(active.rowId, active.columnId);
  }

  /** Leave cell-edit / focus. Commits when stopEditingWhenCellsLoseFocus. */
  async clearActiveCell(options?: { cancel?: boolean }): Promise<void> {
    const store = this.tableStore;
    if (!store) return;
    const cancel = options?.cancel === true;
    if (cancel) {
      this.cancelCellEdit();
    } else if (store.getState().cellEdit) {
      if (this.cellEditOptions.stopEditingWhenCellsLoseFocus) {
        await this.commitCellEdit();
      } else {
        this.cancelCellEdit();
      }
    }
    store.setState((prev) => {
      if (
        prev.activeCell == null &&
        prev.activeRowId === undefined &&
        prev.cellEdit == null
      ) {
        return prev;
      }
      return {
        ...prev,
        activeCell: undefined,
        activeRowId: undefined,
        cellEdit: null,
      };
    });
  }

  getActiveRow(): number | null {
    return this.viewBuilder.getActiveRow();
  }

  getSelectedRows(): Record<number, boolean> | undefined {
    return this.viewBuilder.getSelectedRows();
  }

  getCell(rowId: number, columnId: string): Cell | undefined {
    return this.viewBuilder.getCell(rowId, columnId);
  }
  getMobileEditor(): TableState['mobileEditor'] | undefined {
    const store = this.getStore();
    if (!store) return undefined;
    return store.getState().mobileEditor;
  }

  isActiveCell(rowId: number, columnId: string): boolean {
    return this.viewBuilder.isActiveCell(rowId, columnId);
  }

  isSelectedRow(rowId: number): boolean {
    return this.viewBuilder.isSelectedRow(rowId);
  }

  isCutRow(rowId: number): boolean {
    return this.viewBuilder.isCutRow(rowId);
  }

  isActiveRow(rowId: number): boolean {
    return this.viewBuilder.isActiveRow(rowId);
  }

  private validateCell(value: unknown, schema: ColumnSchema, caption: string, rowId: number): CellError | undefined {
    const rules = schema?.rules ?? [];
    if (!rules.length) return undefined;
    for (const rule of rules) {
      const v = rule.transform ? rule.transform(value) : value;
      const isEmpty =
        v === null ||
        v === undefined ||
        (typeof v === "string" && v.trim() === "") ||
        (Array.isArray(v) && v.length === 0);

      // Required
      if (rule.required) {
        if (isEmpty) return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} الزامی است` };
      }

      // Optional empty values should not fail type/min/max checks
      if (isEmpty) continue;

      // Pattern
      if (rule.pattern) {
        const reg = typeof rule.pattern === "string" ? new RegExp(rule.pattern) : rule.pattern;
        if (!reg.test(String(v))) return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} فرمت نامعتبر دارد` };
      }

      // Type-based
      switch (rule.type) {
        case "number":
        case "integer":
        case "float": {
          const n = Number(v);

          if (Number.isNaN(n)) return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} باید عددی باشد` };
          if (rule.min != null && n < rule.min) return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} باید ≥ ${rule.min} باشد` };
          if (rule.max != null && n > rule.max) return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} باید ≤ ${rule.max} باشد` };
          if (rule.type === "integer" && !Number.isInteger(n)) return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} باید عدد صحیح باشد` };
          break;
        }
        case "boolean":
          if (typeof v !== "boolean") return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} باید بولی باشد` };
          break;
        case "email": {
          const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!reg.test(String(v))) return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} ایمیل معتبر نیست` };
          break;
        }
        case "url": {
          try {
            new URL(String(v));
          } catch {
            return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} باید URL معتبر باشد` };
          }
          break;
        }
        case "date": {
          const d = new Date(
            typeof v === 'string' || typeof v === 'number' ? v : String(v),
          );
          if (isNaN(d.getTime())) return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} تاریخ معتبر نیست` };
          break;
        }
        case "enum":
          if (rule.enum && !rule.enum.includes(v))
            return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} مقدار نامعتبر دارد` };
          break;
        default:
          break;
      }
      if (typeof v === "string") {
        if (rule.len != null && v.length !== rule.len) return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} باید ${rule.len} کاراکتر باشد` };
        if (rule.min != null && v.length < rule.min) return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} باید حداقل ${rule.min} کاراکتر باشد` };
        if (rule.max != null && v.length > rule.max) return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} باید حداکثر ${rule.max} کاراکتر باشد` };
      }
      if (rule.validator) {
        let customError: string[] | undefined;
        rule.validator(rule, v, (err?: string[]) => (customError = err));
        if (customError && customError.length) return { caption, rowId, message: rule.message ?? customError[0] };
      }
    }
    return undefined;
  }

  private schemaHasAsyncValidator(schema: ColumnSchema | undefined): boolean {
    return !!schema?.rules?.some(
      (rule) => typeof rule.asyncValidator === 'function',
    );
  }

  private tableHasAsyncValidators(table: Table): boolean {
    return table.getColumns().some((column) =>
      this.schemaHasAsyncValidator(column),
    );
  }

  private cellValueKey(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  private errorFromAsyncFailure(
    err: unknown,
    rule: { message?: string },
    schema: ColumnSchema,
    caption: string,
    rowId: number,
  ): CellError {
    const fallback =
      err instanceof Error
        ? err.message
        : typeof err === 'string'
          ? err
          : `${schema.fieldCaption || caption} نامعتبر است`;
    return { caption, rowId, message: rule.message ?? fallback };
  }

  private async applyAsyncValidators(
    value: unknown,
    schema: ColumnSchema,
    caption: string,
    rowId: number,
  ): Promise<CellError | undefined> {
    const rules = schema.rules ?? [];
    for (const rule of rules) {
      if (typeof rule.asyncValidator !== 'function') continue;
      const v = rule.transform ? rule.transform(value) : value;
      const isEmpty =
        v === null ||
        v === undefined ||
        (typeof v === 'string' && v.trim() === '') ||
        (Array.isArray(v) && v.length === 0);
      if (isEmpty) continue;
      try {
        await rule.asyncValidator(rule, v);
      } catch (err) {
        return this.errorFromAsyncFailure(err, rule, schema, caption, rowId);
      }
    }
    return undefined;
  }

  private async validateCellFull(
    value: unknown,
    schema: ColumnSchema,
    caption: string,
    rowId: number,
  ): Promise<CellError | undefined> {
    const syncError = this.validateCell(value, schema, caption, rowId);
    if (syncError) return syncError;
    return this.applyAsyncValidators(value, schema, caption, rowId);
  }

  private finishValidation(
    cb: ValidationCallback,
    tableStore: TableStore<TableState>,
  ): void {
    cb({
      valid: this.errors.size === 0,
      errors: this.errors,
      data: this.getAllRows(),
    });
    tableStore.setState((prev) => ({
      ...prev,
      expandedRows: {},
    }));
  }

  private collectValidationJobs(table: Table): Array<{
    cellId: string;
    value: unknown;
    schema: ColumnSchema;
    caption: string;
    rowId: number;
  }> {
    const jobs: Array<{
      cellId: string;
      value: unknown;
      schema: ColumnSchema;
      caption: string;
      rowId: number;
    }> = [];
    this.getAllRows()
      ?.filter((row) => row.rowState.value !== RowStateEnum.Deleted)
      .forEach((row: Row, rowIndex: number) => {
        for (const [columnId, cell] of row.getCells().entries()) {
          const schema = table.getColumnSchema(new ColumnId(columnId));
          if (!schema || schema.hidden) continue;
          jobs.push({
            cellId: `row-${rowIndex}-${columnId}`,
            value: cell.getValue(),
            schema,
            caption: schema.fieldCaption,
            rowId: row.id.value,
          });
        }
      });
    return jobs;
  }

  private applyValidationErrors(nextErrors: Map<string, CellError>): void {
    this.errors.clear();
    nextErrors.forEach((error, cellId) => {
      this.errors.set(cellId, error);
    });
  }

  private runValidationSync(
    table: Table,
    cb: ValidationCallback,
    tableStore: TableStore<TableState>,
  ): void {
    const nextErrors = new Map<string, CellError>();
    for (const job of this.collectValidationJobs(table)) {
      const error = this.validateCell(
        job.value,
        job.schema,
        job.caption,
        job.rowId,
      );
      if (error) nextErrors.set(job.cellId, error);
    }
    this.applyValidationErrors(nextErrors);
    this.finishValidation(cb, tableStore);
  }

  private async runValidationAsync(
    table: Table,
    cb: ValidationCallback,
    tableStore: TableStore<TableState>,
  ): Promise<void> {
    const nextErrors = new Map<string, CellError>();
    for (const job of this.collectValidationJobs(table)) {
      const error = await this.validateCellFull(
        job.value,
        job.schema,
        job.caption,
        job.rowId,
      );
      if (error) nextErrors.set(job.cellId, error);
    }
    this.applyValidationErrors(nextErrors);
    this.finishValidation(cb, tableStore);
  }

  private scheduleAsyncCellCheck(
    cellId: string,
    valueKey: string,
    value: unknown,
    schema: ColumnSchema,
    caption: string,
    rowId: number,
  ): void {
    const seq = (this.asyncCellSeq.get(cellId) ?? 0) + 1;
    this.asyncCellSeq.set(cellId, seq);
    void this.applyAsyncValidators(value, schema, caption, rowId).then(
      (error) => {
        if (this.asyncCellSeq.get(cellId) !== seq) return;
        this.asyncCellCache.set(cellId, { valueKey, error });
        if (error) this.errors.set(cellId, error);
        else this.errors.delete(cellId);
        this.getStore()?.setState((prev) => ({ ...prev }));
      },
    );
  }
  validation(cb: ValidationCallback): void {
    const store = this.getStore();
    if (!store) {
      cb({
        valid: false,
        errors: new Map<string, CellError>([
          [
            "system",
            {
              caption: "",
              rowId: NaN,
              message: `TableStore not found for active table`,
            },
          ],
        ]),
        data: null,
      });
      return;
    }
    const table = store.getState().table;
    try {
      if (this.tableHasAsyncValidators(table)) {
        void this.runValidationAsync(table, cb, store).catch((error) => {
          const message =
            error instanceof Error ? error.message : String(error ?? "خطای اعتبارسنجی");
          cb({
            valid: false,
            errors: new Map<string, CellError>([
              ['system', { caption: '', rowId: NaN, message }],
            ]),
            data: null,
          });
        });
        return;
      }
      this.runValidationSync(table, cb, store);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? "خطای اعتبارسنجی");
      cb(
        {
          valid: false,
          errors: new Map<string, CellError>([['system', { caption: '', rowId: NaN, message }]]),
          data: null
        }
      );

    }
  }
  isValidCell(
    rowId: number,
    caption: string
  ): ValidCell {
    try {
      const store = this.getStore()?.getState();
      if (!store) return { isValid: false, cellError: { caption: "", rowId: NaN, message: "حافظه پیدا نشد" } };

      const table = store.table;
      const row = table.getRow(rowId);
      if (!row) {
        return { isValid: true, cellError: { caption: "", rowId: NaN, message: "" } };
      }
      if (row.rowState.value === RowStateEnum.Deleted) {
        return { isValid: true, cellError: { caption: "", rowId: NaN, message: "" } };
      }
      const rowIndex = table.getRows().sort((a, b) => {
        const aIndex = Number(a.getCells().get("index")?.getValue() ?? 0);
        const bIndex = Number(b.getCells().get("index")?.getValue() ?? 0);
        return aIndex - bIndex;
      }).findIndex(r => r.id.value == rowId)
      const schema = table.getColumnSchema(new ColumnId(caption));
      if (!schema) return { isValid: true, cellError: { caption: "", rowId: NaN, message: "" } };
      const cell = row.getCell(caption);
      if (!cell) {
        return { isValid: true, cellError: { caption: "", rowId: NaN, message: "" } };
      }
      const error = this.validateCell(cell.getValue(), schema, caption, rowId);
      const cellId = `row-${rowIndex}-${caption}`;
      if (error) {
        this.asyncCellCache.delete(cellId);
        return { isValid: false, cellError: error }
      }
      if (!this.schemaHasAsyncValidator(schema)) {
        this.errors.delete(cellId);
        return { isValid: true, cellError: { caption: "", rowId: NaN, message: '' } }
      }
      const valueKey = this.cellValueKey(cell.getValue());
      const cached = this.asyncCellCache.get(cellId);
      if (cached?.valueKey === valueKey) {
        if (cached.error) {
          this.errors.set(cellId, cached.error);
          return { isValid: false, cellError: cached.error };
        }
        this.errors.delete(cellId);
        return { isValid: true, cellError: { caption: "", rowId: NaN, message: '' } };
      }
      this.scheduleAsyncCellCheck(
        cellId,
        valueKey,
        cell.getValue(),
        schema,
        caption,
        rowId,
      );
      this.errors.delete(cellId);
      return { isValid: true, cellError: { caption: "", rowId: NaN, message: '' } };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e ?? "خطای اعتبارسنجی");
      return { isValid: false, cellError: { caption: "", rowId: NaN, message } }
    }
  }
  // ─── subscriptions ───────────────────────────────────────────────────────────

  subscribe(cb: () => void): (() => void) | null {
    const store = this.getStore();
    if (!store) return null;
    try {
      return store.subscribe(cb);
    } catch (e) {
      this.errHandler.handle(e, 'TableEngine.subscribe');
      return null;
    }
  }

  /**
   * Selector-based subscription over engine-derived view data.
   * `selector` closes over engine getters (snapshot, activeCell, …).
   */
  subscribeSelected<TSelected>(
    selector: () => TSelected,
    listener: (selected: TSelected) => void,
    isEqual: (a: TSelected, b: TSelected) => boolean = Object.is,
  ): (() => void) | null {
    const store = this.getStore();
    if (!store) return null;
    try {
      let current = selector();
      return store.subscribe(() => {
        const next = selector();
        if (!isEqual(current, next)) {
          current = next;
          listener(next);
        }
      });
    } catch (e) {
      this.errHandler.handle(e, 'TableEngine.subscribeSelected');
      return null;
    }
  }

  subscribeColumn<T = unknown>(
    columnId: string,
    collections: CollectionScope,
    cb: (items: Array<{ id: number; rowNum: unknown; value: T }>) => void,
  ): (() => void) | null {
    const store = this.getStore();
    if (!store) return null;

    const buildItems = () =>
      (this.viewBuilder.getAllRows(collections) ?? [])
        .filter(r => r.rowState.value !== RowStateEnum.Deleted)
        .map(r => ({
          id: r.id.value,
          rowNum: r.getCell('index')?.getValue(),
          value: r.getCell(columnId)?.getValue() as T,
        }));

    let prev = buildItems();

    return store.subscribe(() => {
      const next = buildItems();

      const changed =
        next.length !== prev.length ||
        next.some(
          (item, i) =>
            item.id !== prev[i].id ||
            item.rowNum !== prev[i].rowNum ||
            item.value !== prev[i].value,
        );

      if (changed) {
        prev = next;
        cb(next);
      }
    });
  }
}