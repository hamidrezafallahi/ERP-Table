// engine/TableEngine.ts

import {
  Actor,
  TableCommand,
} from '../application/commands';
import { TableRepository } from '../application/ports/TableRepository';
import { TableAppService } from '../application/TableAppService';
import { Table } from '../domain/entities/Table';
import { TableStore } from './tableStore';
import {
  TableSnapShot,
  TableState,
  TableViewState,
  TCell,
} from './type';

export class TableEngine {
  private tables = new Map<string, TableStore<TableState>>();
  constructor(
    private readonly app: TableAppService,
    private readonly repo: TableRepository,
    private readonly actor: Actor,
  ) { }
private columnListeners = new Map<string, Set<(values: unknown[]) => void>>();

subscribeColumn<T = unknown>(
  tableKey: string,
  columnId: string,
  cb: (values: T[]) => void
) {
  const key = `${tableKey}_${columnId}`;
  if (!this.columnListeners.has(key)) {
    this.columnListeners.set(key, new Set());
  }
  this.columnListeners.get(key)!.add(cb);

  // unsubscribe function
  return () => {
    const listeners = this.columnListeners.get(key);
    if (listeners) {
      listeners.delete(cb);
      if (listeners.size === 0) {
        this.columnListeners.delete(key); // پاک کردن Set خالی برای بهینه‌سازی حافظه
      }
    }
  };
}

private notifyColumnChange(tableKey: string, columnId: string, table: Table) {
  const key = `${tableKey}_${columnId}`;
  const listeners = this.columnListeners.get(key);
  if (!listeners || listeners.size === 0) return;

  const values = table.getColumnValues(columnId); // برگرداندن تمام مقادیر ستون

  for (const cb of listeners) {
    try {
      cb(values);
    } catch (err) {
      console.error(`Error in column subscriber for ${columnId}:`, err);
    }
  }
}

  private async registerTable(cmd: {
    store: string, table: Table
  }) {
    const { store, table } = cmd
    if (this.tables.has(table.id)) {
      return;
    }
    this.tables.set(
      table.id,
      new TableStore({
        table,
        expandedRows: {},
        selectedRows: {},
        activeRowId: null,
        activeCell: null,
        rangeAnchorRowId: null
      })
    );
    await this.repo.save(store, table);
  }

  private selectFromActiveToLast(cmd: {
    tableKey: string;
    anchorRowId: number;
  }) {
    const store = this.getStore(cmd.tableKey);
    store.setState(prev => {
      const rows = prev.table.getVisibleRows(); // فقط ردیف‌های صفحه فعلی

      const startIdx = rows.findIndex(r => r.id.value === cmd.anchorRowId);
      if (startIdx === -1) return prev;

      // از سطر فعال تا **آخرین ردیف صفحه فعلی**
      const nextSelected: Record<number, true> = { ...prev.selectedRows };

      for (let i = startIdx; i < rows.length; i++) {
        nextSelected[rows[i].id.value] = true;
      }

      return {
        ...prev,
        selectedRows: nextSelected,
        rangeAnchorRowId: cmd.anchorRowId, // برای سازگاری با range selection معمولی
      };
    });
  }
  private async deleteTable(cmd: {
    store: string, tableKey: string
  }) {
    const { store, tableKey } = cmd

    await this.repo.delete(store, tableKey);
    this.tables.delete(tableKey);
  }
  private disposeTable(cmd: { store: string, tableKey: string }) {
    const { store, tableKey } = cmd
    this.repo.delete(store, tableKey)
    this.tables.delete(tableKey);

  }
  private async resetTable(cmd: {
    store: string;
    tableKey: string;
  }) {
    const { store, tableKey } = cmd;

    const tableStore = this.tables.get(tableKey);
    if (!tableStore) {
      throw new Error(`Table ${tableKey} is not registered`);
    }

    // گرفتن نسخه‌ی اولیه از persistence
    const freshTable = await this.repo.getById(store, tableKey);

    if (!freshTable) {
      throw new Error(`Table ${tableKey} could not be reloaded`);
    }

    // reset کامل state (domain + ui state)
    tableStore.setState(prev => ({
      ...prev,
      table: freshTable,
      expandedRows: {},
      selectedRows: {},
      activeRowId: null,
      activeCell: null,
      rangeAnchorRowId: null,
    }));
  }


  private getStore(tableKey: string): TableStore<TableState> {
    const store = this.tables.get(tableKey);
    if (!store) {
      throw new Error(`Table ${tableKey} is not registered`);
    }
    return store;
  }

  private moveActiveCell(cmd: {
    tableKey: string;
    rowId: number;
    columnId: string;
    direction: 'next' | 'prev';
  }) {
    const store = this.getStore(cmd.tableKey);
    const state = store.getState();
    const table = state.table;

    const columns = table
      .getColumns()
      .filter(c => !c.hidden && c.editable && c.id !== 'index');

    const colIndex = columns.findIndex(c => c.id === cmd.columnId);
    if (colIndex === -1) return;

    const nextIndex =
      cmd.direction === 'next' ? colIndex + 1 : colIndex - 1;

    const nextCol = columns[nextIndex];
    if (!nextCol) return;

    store.setState(() => ({
      ...state,
      activeCell: {
        rowId: cmd.rowId,
        columnId: nextCol.id,
      },
    }));
  }
  private moveActiveCellVertical(cmd: {
    tableKey: string;
    rowId: number;
    columnId: string;
    direction: 'up' | 'down';
  }) {
    const store = this.getStore(cmd.tableKey);
    store.setState(prev => {
      const view = this.getViewState(cmd.tableKey);   // ← مهم
      const { pagination } = view;
      const visibleRows = view.rows;                  // ردیف‌های صفحه فعلی
      const currentIndex = visibleRows.findIndex(r => r.id === cmd.rowId);

      if (currentIndex === -1) return prev;

      let nextIndex = cmd.direction === 'down' ? currentIndex + 1 : currentIndex - 1;

      // داخل صفحه فعلی هستیم؟
      if (nextIndex >= 0 && nextIndex < visibleRows.length) {
        const nextRow = visibleRows[nextIndex];
        return {
          ...prev,
          activeRowId: nextRow.id,
          activeCell: { rowId: nextRow.id, columnId: cmd.columnId },
        };
      }

      // ------------------------------
      // حالا مرز صفحه
      // ------------------------------
      const shouldGoNextPage = cmd.direction === 'down' && currentIndex === visibleRows.length - 1;
      const shouldGoPrevPage = cmd.direction === 'up' && currentIndex === 0;

      if (shouldGoNextPage && pagination.canNext) {
        // به صفحه بعدی → ردیف اول همان ستون
        return {
          ...prev,
          activeCell: null,   // موقتاً پاک می‌کنیم تا بعد از تغییر صفحه ست کنیم
        };
      }

      if (shouldGoPrevPage && pagination.canPrev) {
        // به صفحه قبلی → ردیف آخر همان ستون
        return {
          ...prev,
          activeCell: null,
        };
      }

      // هیچ جا نمی‌تونیم بریم → بدون تغییر
      return prev;
    });

    // بعد از تغییر state، اگر نیاز به تغییر صفحه بود، اینجا انجام بده
    const currentView = this.getViewState(cmd.tableKey);
    const active = currentView.activeCell;

    if (!active && cmd.direction === 'down' && currentView.pagination.canNext) {
      this.dispatch({
        type: 'CHANGE_PAGE',
        tableKey: cmd.tableKey,
        page: currentView.pagination.page + 1,
        store: 'your-store-name', // یا از cmd بگیری
      }).then(() => {
        // بعد از لود صفحه جدید، اولین ردیف + همان ستون را فعال کن
        const newView = this.getViewState(cmd.tableKey);
        if (newView.rows.length > 0) {
          const firstRowId = newView.rows[0].id;
          this.setActiveCell({
            tableKey: cmd.tableKey,
            rowId: firstRowId,
            columnId: cmd.columnId,
          });
        }
      });
    }

    if (!active && cmd.direction === 'up' && currentView.pagination.canPrev) {
      this.dispatch({
        type: 'CHANGE_PAGE',
        tableKey: cmd.tableKey,
        page: currentView.pagination.page - 1,
        store: cmd.tableKey
,
      }).then(() => {
        const newView = this.getViewState(cmd.tableKey);
        if (newView.rows.length > 0) {
          const lastRowId = newView.rows[newView.rows.length - 1].id;
          this.setActiveCell({
            tableKey: cmd.tableKey,
            rowId: lastRowId,
            columnId: cmd.columnId,
          });
        }
      });
    }
  }

  private activateFirstCell(cmd: {
    tableKey: string;
    rowId: number;
  }) {
    const store = this.getStore(cmd.tableKey);
    const state = store.getState();
    const table = state.table;

    const firstEditable = table
      .getColumns()
      .find(c => c.editable && c.id !== 'index' && !c.hidden);

    if (!firstEditable) return;

    store.setState(() => ({
      ...state,
      activeCell: {
        rowId: cmd.rowId,
        columnId: firstEditable.id,
      },
    }));
  }
  getViewState(tableKey: string): TableViewState {
    const { table, expandedRows, activeCell, selectedRows } = this.getStore(tableKey).getState();
    const pagination = table.getPagination();
    const totalRows = table.getRows().length;
    const totalPages = Math.max(
      1,
      Math.ceil(totalRows / pagination.pageSize)
    );
    return {
      table,

      activeCell,
      selectedRows,
      rows: table.getVisibleRows().sort((a, b) => a.id.value - b.id.value).map((row) => {
        const cells: Record<string, TCell> = {};
        const columns = table.getColumns();
        for (const col of columns) {
          const cell = row.getCells().get(col.id);

          cells[col.id] = {
            value: cell?.getValue()?.value ?? null,
            originalValue: cell?.getOriginalValue()?.value ?? null,
            display: cell?.getDisplay()?.value ?? null,
          };
        }
        return {
          id: row.id.value,
          rowState: row.rowState.value,
          changeFields: row.getChangeFields(),
          cells,//: Object.fromEntries([...row.getCells()].map(([k, c]) => [k, { value: c.getValue()?.value, originalValue: c.getOriginalValue()?.value }])),
          isExpanded: !!expandedRows[row.id.value],
          moreDetails:row.moreDetails
        }
      }),
      deletedRows: [],
      columns: table.getColumns().map((col) => ({
        id: col.id,
        title: col.title,
        hidden: col.hidden,
        renderType: col.renderType,
        editable: col.editable,
        options: col.selectOptions,
        indexOptions: col.indexOptions,
        dynamicValue: col.dynamicValue,
      })),
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalRows,
        totalPages,
        canPrev: pagination.page > 1,
        canNext: pagination.page < totalPages,
      },
    }
  }
  getSnapShot(tableKey: string): TableSnapShot {
    const { table } = this.getStore(tableKey).getState();
    return {
      table,
      rows: table.getRows().map(row => ({
        id: row.id.value,
        changeFields: row.getChangeFields(),
        cells: Object.fromEntries(
          [...row.getCells()].map(([k, c]) => [k, c.getValue()?.value])
        ),
        rowState: row.rowState.value,
        moreDetails:row.moreDetails

      })),
      deletedRows: [],

    };

  }
  getExpandedRowData(tableKey: string, rowId: number) {
    const { table } = this.getStore(tableKey).getState();
    if (!table) return null;
    const row = table.getRows().find(r => r.id.value === rowId);
    if (!row) return null;
    const rowValues: Record<string, unknown> = {};
    for (const [colId, cell] of row.getCells().entries()) {
      rowValues[colId] = cell.getValue().value;
    }
    return rowValues;
  }
  getActiveCell(tableKey: string) {
    const store = this.getStore(tableKey).getState();
    if (!store) return null;

    return store.activeCell;
  }
  getActiveRow(tableKey: string) {
    const store = this.getStore(tableKey).getState();
    if (!store) return null;

    return store.activeRowId;
  }
  isActiveCell(
    tableKey: string,
    rowId: number,
    columnId: string
  ): boolean {
    try {
      const { activeCell } = this.getStore(tableKey).getState();
      return !!activeCell &&
        activeCell.rowId === rowId &&
        activeCell.columnId === columnId;
    } catch {
      return false;
    }
  }
  isActiveRow(
    tableKey: string,
    rowId: number,
  ): boolean {

    try {
      const { activeRowId } = this.getStore(tableKey).getState();
      return !!activeRowId &&
        activeRowId === rowId
    } catch {
      return false;
    }
  }
  isSelectedRow(tableKey: string, rowId: number): boolean {
    try {
      const { selectedRows } = this.getStore(tableKey).getState();
      return !!selectedRows && !!selectedRows[rowId];
    } catch {
      return false;
    }
  }
  isExpandableRow(tableKey: string, rowId: number): boolean {
      const { table } = this.getStore(tableKey).getState();
      const row = table.getRow(rowId)
      const expandAble = row.getMoreDetails()
      return  !!expandAble;
  }
  getSelectedRows(tableKey: string): Record<number,boolean> {
      return this.getStore(tableKey).getState().selectedRows;
  }

  private setActiveCell(cmd: {
    tableKey: string
    rowId: number
    columnId: string
  }) {
    const store = this.getStore(cmd.tableKey);

    store.setState(prev => {
      const current = prev.activeCell;

      if (
        current &&
        current.rowId === cmd.rowId &&
        current.columnId === cmd.columnId
      ) {
        return prev;
      }

      return {
        ...prev,
        activeRowId: cmd.rowId,
        activeCell: {
          rowId: cmd.rowId,
          columnId: cmd.columnId,
        },
      };
    });
  }

  private setActiveRow(cmd: {
    tableKey: string
    rowId: number
  }) {
    const store = this.getStore(cmd.tableKey);
    store.setState(prev => {
      if (prev.activeRowId === cmd.rowId) {
        return prev;
      }

      return {
        ...prev,
        activeRowId: cmd.rowId,
        activeCell: null,
        rangeAnchorRowId: cmd.rowId,
        // selectedRows: { [cmd.rowId]: true },
      };
    });
  }
  private setSelectRow(cmd: {
    tableKey: string
    rowId: number
  }) {
    const store = this.getStore(cmd.tableKey);
    store.setState(prev => {
      const isSelected = !!prev.selectedRows[cmd.rowId];
      return {
        ...prev,
        selectedRows: isSelected ? {} : { [cmd.rowId]: true },
        rangeAnchorRowId: isSelected ? null : cmd.rowId,

      };
    });
  }
  private setRowExpanded(cmd: {
    tableKey: string, rowId: number, value: boolean
  }) {
    const { rowId, tableKey, value } = cmd
    const store = this.getStore(tableKey);
    const state = store.getState();
    const key = String(rowId);
    if (!!state.expandedRows[rowId] === value) return;

    store.setState(() => ({
      ...state,
      expandedRows: {
        ...state.expandedRows,
        [key]: value,
      },
    }));
  }

  private toggleRowExpanded(cmd: {
    tableKey: string, rowId: number
  }) {
    const { rowId, tableKey } = cmd

    const key = String(rowId);

    const store = this.getStore(tableKey);
    const state = store.getState();
    const next = !state.expandedRows[key];

    store.setState(() => ({
      ...state,
      expandedRows: {
        ...state.expandedRows,
        [key]: next,
      },
    }));
  }

  private collapseAll(tableKey: string) {
    const store = this.getStore(tableKey);
    const state = store.getState();
    if (!state.expandedRows || Object.keys(state.expandedRows).length === 0) return;

    store.setState(() => ({
      ...state,
      expandedRows: {},
    }));
  }
  private toggleRowSelection(cmd: {
    tableKey: string
    rowId: number
  }) {
    const store = this.getStore(cmd.tableKey);

    store.setState(prev => {
      const isSelected = !!prev.selectedRows[cmd.rowId];

      const nextSelected = { ...prev.selectedRows };

      if (isSelected) {
        delete nextSelected[cmd.rowId];
      } else {
        nextSelected[cmd.rowId] = true;
      }

      return {
        ...prev,
        selectedRows: nextSelected,
      };
    });
  }
  private toggleSelectAllRows(cmd: { tableKey: string }) {
    const store = this.getStore(cmd.tableKey);
    const allRows = store.getState().table.getRows()
    const allSelected = Object.keys(store.getState().selectedRows).length === allRows.length;
    store.setState(prev => {
      if (allSelected) {
        return {
          ...prev,
          selectedRows: {},
        };
      } else {
        const nextSelected: Record<number, true> = {};
        allRows.forEach(row => {
          nextSelected[row.id.value] = true;
        });
        return {
          ...prev,
          selectedRows: nextSelected,
        };
      }
    });
  }

  private goToPreviousPage(tableKey: string) {
    const store = this.getStore(tableKey);
    const pagination = store.getState().table.getPagination();
    if (pagination.page > 1) {
      this.dispatch({
        type: 'CHANGE_PAGE',
        store: '', // مقدار store رو باید از جایی بگیری
        tableKey,
        page: pagination.page - 1,
      });
    }
  }

  private goToNextPage(tableKey: string) {
    const store = this.getStore(tableKey);
    const pagination = store.getState().table.getPagination();
    const totalRows = store.getState().table.getRows().length;
    const totalPages = Math.ceil(totalRows / pagination.pageSize);

    if (pagination.page < totalPages) {
      this.dispatch({
        type: 'CHANGE_PAGE',
        store: '', // مقدار store رو باید از جایی بگیری
        tableKey,
        page: pagination.page + 1,
      });
    }
  }

  private activateFirstCellOfColumn(tableKey: string, columnId: string) {
    const store = this.getStore(tableKey);
    const firstRow = store.getState().table.getVisibleRows()[0];
    if (firstRow) {
      this.setActiveCell({
        tableKey,
        rowId: firstRow.id.value,
        columnId,
      });
    }
  }

  private activateLastCellOfColumn(tableKey: string, columnId: string) {
    const store = this.getStore(tableKey);
    const rows = store.getState().table.getVisibleRows();
    const lastRow = rows[rows.length - 1];
    if (lastRow) {
      this.setActiveCell({
        tableKey,
        rowId: lastRow.id.value,
        columnId,
      });
    }
  }
  private selectRange(cmd: {
    tableKey: string
    rowId: number
  }) {
    const store = this.getStore(cmd.tableKey);
    store.setState(prev => {
      const anchor = prev.rangeAnchorRowId ?? prev.activeRowId;
      if (!anchor) return prev;

      const rows = prev.table.getVisibleRows();
      const startIndex = rows.findIndex(r => r.id.value === anchor);
      const endIndex = rows.findIndex(r => r.id.value === cmd.rowId);

      if (startIndex === -1 || endIndex === -1) return prev;

      const [from, to] =
        startIndex < endIndex
          ? [startIndex, endIndex]
          : [endIndex, startIndex];

      const nextSelected: Record<number, true> = {};

      for (let i = from; i <= to; i++) {
        nextSelected[rows[i].id.value] = true;
      }

      return {
        ...prev,
        selectedRows: nextSelected,
        rangeAnchorRowId: anchor,
      };
    });
  }
  async dispatch(command: TableCommand) {
    switch (command.type) {
      case 'ACTIVE_CELL':
        this.setActiveCell(command);
        return;
      case 'ACTIVE_ROW':
        this.setActiveRow(command);
        return;
      case 'MOVE_ACTIVE_CELL':
        this.moveActiveCell(command);
        return;
      case 'MOVE_ACTIVE_CELL_VERTICAL':
        this.moveActiveCellVertical(command);
        return;
      case 'ACTIVATE_FIRST_CELL':
        this.activateFirstCell(command);
        return;
      case 'TABLE_REGISTERED':
        await this.registerTable(command);
        return;

      case 'TABLE_DELETED':
        await this.deleteTable(command);
        return;

      case 'ROW_EXPANDED':
        this.setRowExpanded(command);
        return;
      case 'TABLE_DISPOSED':
        this.disposeTable(command);
        return;
      case 'COLLAPSE_ALL_ROWS':
        this.collapseAll(command.tableKey);
        return;
      case 'ROW_EXPAND_TOGGLED':
        this.toggleRowExpanded(command);
        return;
      case 'TABLE_RESET':
        this.resetTable(command);
        return;
      case 'TOGGLE_SELECT_ALL_ROWS':
        this.toggleSelectAllRows(command);
        return;
      case 'ROW_SELECTION_TOGGLED':
        this.toggleRowSelection(command);
        return;
      case 'ROW_RANGE_SELECTED':
        this.selectRange(command);
        return;
      case 'ROW_SELECTED':
        this.setSelectRow(command);
        return;
      case 'SELECT_FROM_ACTIVE_TO_LAST':
        this.selectFromActiveToLast(command);
        return;
      default:
        await this.app.execute(command, this.actor);
        const updated = await this.repo.getById(command.store, command.tableKey);
        const store = this.getStore(command.tableKey);
        const prev = store.getState();
        store.setState(() => ({
          ...prev,
          table: updated,
        }));

    }
  }
  subscribe(tableKey: string, cb: () => void) {
    const table = this.getStore(tableKey).subscribe(cb);
    try {
      return table
    } catch {
      return null;
    }
  }
}
