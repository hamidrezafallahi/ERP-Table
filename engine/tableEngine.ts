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
import { NavigationManager } from './managers/NavigationManager';
import { RowManager } from './managers/RowManager';
import { SelectionManager } from './managers/SelectionManager';
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
import { ViewStateBuilder } from './ViewStateBuilder';

export class TableEngine {
  // ─── internal state ────────────────────────────────────────────────────────
  private tableStore?: TableStore<TableState>;
  private tableKey?: string;
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
  private readonly rowMgr: RowManager;
  private readonly nav: NavigationManager;
  private readonly viewBuilder: ViewStateBuilder;

  constructor(
    private readonly app: TableAppService,
    private readonly repo: TableRepository,
    private readonly actor: Actor,
    audit: ConsoleAuditLogger,
  ) {
    this.errHandler = new EngineErrorHandler(audit);
    this.selection = new SelectionManager(() => this.tableStore, this.errHandler);
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
    );
  }

  // ─── private table lifecycle ────────────────────────────────────────────────

  private async registerTable(cmd: {
    store: string;
    table: Table;
  }): Promise<void> {
    const { store, table } = cmd;
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
      }));
    } catch (e) {
      this.errHandler.handle(e, 'TableEngine.resetTable');
    }
  }

  // ─── private helper ─────────────────────────────────────────────────────────

  private shouldInvalidateUiRowIndex(command: ApplicationTableCommand): boolean {
    switch (command.type) {
      case 'ADD_EMPTY_ROW':
      case 'ADD_NEW_ROWS':
      case 'DUPLICATE_ROW':
      case 'PASTE_ROW':
      case 'ROW_DELETED':
      case 'RESTORE_ADDED_ROW':
      case 'TABLE_DELETED':
      case 'TABLE_RESET':
      case 'ROW_REORDERED':
      case 'SET_ACTIVE_COLLECTION':
        return true;
      case 'CHANGE_CELL_VALUE':
        return command.columnId === 'index';
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

    try {
      result = await this.app.execute(command, this.actor);
    } catch (e) {
      this.errHandler.handle(e, `TableEngine.dispatch[${command.type}]`);
      return;
    }

    try {
      const updated = await this.repo.getById(
        (command as any).store,
        (command as any).tableKey,
      );
      const store = this.getStore((command as any).tableKey);
      if (!store || !updated) return;
      if (this.shouldInvalidateUiRowIndex(command)) {
        this.viewBuilder.invalidateUiRowIndex();
      }
      const prev = store.getState();
      store.setState(() => ({ ...prev, table: updated }));

      if (command.type === 'ADD_EMPTY_ROW') {
        const addCommand = command as AddEmptyRowCommand;
        const rowAdded = result as RowAdded | null;
        const rowId = rowAdded?.rowId?.value;

        if (addCommand.autoActivate && rowId != null) {
          await this.nav.setActiveRow({
            store: addCommand.store,
            tableKey: addCommand.tableKey,
            rowId,
          });
        }
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
        this.nav.setActiveCell(command);
        return;
      case 'ACTIVE_ROW':
        await this.nav.setActiveRow(command);
        return;
      case 'MOVE_ACTIVE_CELL':
        await this.nav.moveActiveCell(command);
        return;
      case 'MOVE_ACTIVE_CELL_VERTICAL':
        await this.nav.moveActiveCellVertical(command);
        return;
      case 'ACTIVATE_FIRST_CELL':
        this.nav.activateFirstCell(command);
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

  // ─── public read API ────────────────────────────────────────────────────────

  getViewState(): TableViewState | undefined {
    return this.viewBuilder.getViewState();
  }

  getAllRows(): Row[] | null {
    return this.viewBuilder.getAllRows();
  }

  getAllUIRows(): UIRow[] | null {
    return this.viewBuilder.getAllUIRows();
  }

  getUiRowIndex(): SparseRowIndex<number> {
    return this.viewBuilder.getUiRowIndex();
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

  private validateCell(value: any, schema: ColumnSchema, caption: string, rowId: number): CellError | undefined {
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
            new URL(v);
          } catch {
            return { caption, rowId, message: rule.message ?? `${schema.fieldCaption || caption} باید URL معتبر باشد` };
          }
          break;
        }
        case "date": {
          const d = new Date(v);
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
      const error = this.validateCell(cell.getValue() as any, schema, caption, rowId);
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