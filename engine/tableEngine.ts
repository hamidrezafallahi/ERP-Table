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
import { ViewStateBuilder } from './ViewStateBuilder';

export class TableEngine {
  // ─── internal state ────────────────────────────────────────────────────────
  private tableStore?: TableStore<TableState>;
  private tableKey?: string;
  public readonly errors = new Map<string, CellError>();
  public readonly searchResult = new Map<string, CellError>();


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
    });
    this.tableKey = table.id;
    this.tableStore = tableStore;
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
    }
  }

  private disposeTable(cmd: { store: string; tableKey: string }): void {
    this.repo.delete(cmd.store, cmd.tableKey);
    if (this.tableKey === cmd.tableKey) {
      this.tableStore = undefined;
      this.tableKey = undefined;
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
      }));
    } catch (e) {
      this.errHandler.handle(e, 'TableEngine.resetTable');
    }
  }

  // ─── private helper ─────────────────────────────────────────────────────────

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
        this.rowMgr.moveVerticalSelectedRows(command);
        return;
      case 'MOVE_VERTICAL_ACTIVE_ROW':
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

      // ── Delegate to AppService ───────────────────────────────────────────────
      default:
        if (!isApplicationTableCommand(command)) {
          this.errHandler.handle(
            new Error(`Unhandled engine command: ${command.type}`),
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

  // ─── public read API ────────────────────────────────────────────────────────

  getViewState(): TableViewState | undefined {
    return this.viewBuilder.getViewState();
  }

  getAllRows(): Row[] | null {
    return this.viewBuilder.getAllRows();
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
  getMobileEditor():TableState['mobileEditor']{
     const store = this.getStore();
    if (!store) return;
    return store.getState().mobileEditor
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
      if (rule.asyncValidator) {
        // async validator‌ها رو اینجا فقط ignore می‌کنیم (درصورت نیاز async handle کن)
      }
    }
    return undefined;
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
      const nextErrors = new Map<string, CellError>();
      this.getAllRows()
        ?.filter((row) => row.rowState.value !== RowStateEnum.Deleted)
        .forEach((row: Row, rowIndex: number) => {
          for (const [columnId, cell] of row.getCells().entries()) {
            const schema = table.getColumnSchema(new ColumnId(columnId));
            if (!schema || schema.hidden) continue;
            const cellId = `row-${rowIndex}-${columnId}`;
            const error = this.validateCell(
              cell.getValue() as any,
              schema,
              schema.fieldCaption,
              row.id.value,
            );
            if (error) {
              nextErrors.set(cellId, error);
            }
          }
        });
      this.errors.clear();
      nextErrors.forEach((error, cellId) => {
        this.errors.set(cellId, error);
      });
      cb(
        {
          valid: this.errors.size === 0,
          errors: this.errors,
          data: this.getAllRows()
        }
      );
      store.setState(prev => {
        return {
          ...prev,
          // activeRowId: null,
          // activeCell: null,
          expandedRows: {}
        };
      });
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
      if (error) {
        return { isValid: false, cellError: error }
      } else {
        const cellId = `row-${rowIndex}-${caption}`;
        this.errors.delete(cellId);
        return { isValid: true, cellError: { caption: "", rowId: NaN, message: '' } }
      }
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