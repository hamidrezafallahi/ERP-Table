// engine/TableEngine.ts

import { ConsoleAuditLogger } from '../adapters/infra/consoleAuditLogger';
import {
  Actor,
  TableCommand,
} from '../application/commands';
import { TableRepository } from '../application/ports/TableRepository';
import { TableAppService } from '../application/TableAppService';
import { Table } from '../domain/entities/Table';
import {
  CellValue,
  ColumnId,
} from '../domain/value-objects';
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
    private readonly audit: ConsoleAuditLogger,
  ) { }

  private async registerTable(cmd: { store: string, table: Table }) {
    const { store, table } = cmd;
    if (this.tables.has(table.id)) return;
    const tableStore = new TableStore({
      table,
      expandedRows: {},
      selectedRows: {},
      activeRowId: null,
      activeCell: null,
      rangeAnchorRowId: null
    });
    this.tables.set(table.id, tableStore);
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
        rangeAnchorRowId: cmd.anchorRowId,
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

    const tableStore = this.getStore(tableKey);
    if (!tableStore) {
      this.audit.log({
        type: 'ERROR',
        message: "Table  is not registered",
        payload: tableKey
      });
      return null
    }

    // گرفتن نسخه‌ی اولیه از persistence
    const freshTable = await this.repo.getById(store, tableKey);

    if (!freshTable) {
      this.audit.log({
        type: 'ERROR',
        message: `Table ${tableKey} could not be reloaded`,
        payload: tableKey
      });
      return null
    }
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
      this.audit.log({
        type: 'ERROR',
        message: `Table ${tableKey} could not be found`,
        payload: tableKey
      });
      return null
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
      const view = this.getViewState(cmd.tableKey);
      if (!view) return prev;

      const { pagination } = view;

      // ✅ این rows الان از قبل بر اساس index مرتب شده‌اند
      const visibleRows = view.rows;

      const currentIndex = visibleRows.findIndex(r => r.id === cmd.rowId);
      if (currentIndex === -1) return prev;

      const nextIndex =
        cmd.direction === 'down'
          ? currentIndex + 1
          : currentIndex - 1;

      // ------------------------------
      // حرکت داخل همان صفحه
      // ------------------------------
      if (nextIndex >= 0 && nextIndex < visibleRows.length) {
        const nextRow = visibleRows[nextIndex];

        return {
          ...prev,
          activeRowId: nextRow.id,
          activeCell: {
            rowId: nextRow.id,
            columnId: cmd.columnId,
          },
        };
      }

      // ------------------------------
      // رسیدن به مرز صفحه
      // ------------------------------
      const isAtLastRow =
        cmd.direction === 'down' &&
        currentIndex === visibleRows.length - 1;

      const isAtFirstRow =
        cmd.direction === 'up' &&
        currentIndex === 0;

      if (isAtLastRow && pagination.canNext) {
        return {
          ...prev,
          activeCell: null, // بعد از تغییر صفحه ست می‌شود
        };
      }

      if (isAtFirstRow && pagination.canPrev) {
        return {
          ...prev,
          activeCell: null,
        };
      }

      // هیچ حرکتی ممکن نیست
      return prev;
    });

    // ---------------------------------------
    // بعد از setState → بررسی تغییر صفحه
    // ---------------------------------------
    const currentView = this.getViewState(cmd.tableKey);
    if (!currentView) return;

    const active = currentView.activeCell;

    // ------------------------------
    // رفتن به صفحه بعد
    // ------------------------------
    if (
      !active &&
      cmd.direction === 'down' &&
      currentView.pagination.canNext
    ) {
      this.dispatch({
        type: 'CHANGE_PAGE',
        tableKey: cmd.tableKey,
        page: currentView.pagination.page + 1,
        store: cmd.tableKey,
      }).then(() => {
        const newView = this.getViewState(cmd.tableKey);
        if (!newView || newView.rows.length === 0) return;
        const firstRowId = newView.rows[0].id;

        this.setActiveCell({
          tableKey: cmd.tableKey,
          rowId: firstRowId,
          columnId: cmd.columnId,
        });
      });
    }

    // ------------------------------
    // رفتن به صفحه قبل
    // ------------------------------
    if (
      !active &&
      cmd.direction === 'up' &&
      currentView.pagination.canPrev
    ) {
      this.dispatch({
        type: 'CHANGE_PAGE',
        tableKey: cmd.tableKey,
        page: currentView.pagination.page - 1,
        store: cmd.tableKey,
      }).then(() => {
        const newView = this.getViewState(cmd.tableKey);
        if (!newView || newView.rows.length === 0) return;

        const lastRowId =
          newView.rows[newView.rows.length - 1].id;

        this.setActiveCell({
          tableKey: cmd.tableKey,
          rowId: lastRowId,
          columnId: cmd.columnId,
        });
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
  private moveVerticalSelectedRows(cmd: {
    tableKey: string;
    direction: 'down' | 'up';
  }) {
    const store = this.getStore(cmd.tableKey);

    store.setState(prev => {
      const table = prev.table;
      const selectedMap = prev.selectedRows;

      const allRows = table.getRows();

      // مرتب بر اساس index
      const sortedRows = [...allRows].sort((a, b) =>
        (a.getCell("index")?.getValue()?.value as number) -
        (b.getCell("index")?.getValue()?.value as number)
      );

      const selectedRows = sortedRows.filter(r => selectedMap[r.id.value]);
      if (selectedRows.length === 0) return prev;

      if (cmd.direction === 'up') {
        // از اولین سطر شروع می‌کنیم
        for (const row of selectedRows) {
          const idx = sortedRows.findIndex(r => r.id.value === row.id.value);
          if (idx === 0) continue; // بالاترین ردیف

          const upperRow = sortedRows[idx - 1];

          // swap index
          const rowIndex = row.getCell("index")?.getValue()?.value as number;
          const upperIndex = upperRow.getCell("index")?.getValue()?.value as number;

          row.changeCell(new ColumnId("index"), new CellValue(upperIndex));
          upperRow.changeCell(new ColumnId("index"), new CellValue(rowIndex));

          // swap position in array to prevent double-swapping
          sortedRows[idx - 1] = row;
          sortedRows[idx] = upperRow;
        }
      }

      if (cmd.direction === 'down') {
        // از آخرین سطر شروع می‌کنیم تا تداخل نداشته باشیم
        for (let i = selectedRows.length - 1; i >= 0; i--) {
          const row = selectedRows[i];
          const idx = sortedRows.findIndex(r => r.id.value === row.id.value);
          if (idx === sortedRows.length - 1) continue; // پایین‌ترین ردیف

          const lowerRow = sortedRows[idx + 1];

          const rowIndex = row.getCell("index")?.getValue()?.value as number;
          const lowerIndex = lowerRow.getCell("index")?.getValue()?.value as number;

          row.changeCell(new ColumnId("index"), new CellValue(lowerIndex));
          lowerRow.changeCell(new ColumnId("index"), new CellValue(rowIndex));

          sortedRows[idx] = lowerRow;
          sortedRows[idx + 1] = row;
        }
      }

      return {
        ...prev,
        table,
      };
    });
  }
  private setRowExpanded(cmd: {
    tableKey: string, rowId: number, value: boolean
  }) {
    const { rowId, tableKey, value } = cmd
    const store = this.getStore(tableKey);
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `setRowExpanded store is not found`,
        payload: tableKey
      });
      return null
    }
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
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `toggleRowExpanded store is not found`,
        payload: tableKey
      });
      return null
    }
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
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `collapseAll store is not found`,
        payload: tableKey
      });
      return null
    }
    const state = store.getState();
    if (!state.expandedRows || Object.keys(state.expandedRows).length === 0) return;

    store.setState(() => ({
      ...state,
      expandedRows: {},
    }));
  }
  private toggleRowSelection(cmd: {
    tableKey: string;
    rowId: number;
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
      case 'MOVE_VERTICAL_SELECTED_ROWS':
        this.moveVerticalSelectedRows(command);
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
  getViewState(tableKey: string): TableViewState {
    const store = this.getStore(tableKey)?.getState();
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `Table ${tableKey} could not be founded at getViewState`,
        payload: tableKey
      });
      return null
    }
    const { table, expandedRows, activeCell, selectedRows } = store
    const pagination = table.getPagination();
    const totalRows = table.getPagination().totalRows;
    const totalPages = table.getPagination().totalPages
    return {
      table,
      activeCell,
      selectedRows,
      rows: table.getVisibleRows()
        .sort((a, b) => {
          const aIndex = Number(a.getCells().get("index")?.getValue()?.value ?? 0);
          const bIndex = Number(b.getCells().get("index")?.getValue()?.value ?? 0);
          return aIndex - bIndex;
        }).map((row) => {
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
            cells,
            isExpanded: !!expandedRows[row.id.value],
            moreDetails: row.moreDetails
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
      pagination:table.getPagination(),
    }
  }
  getSnapShot(tableKey: string): TableSnapShot {
    const store = this.getStore(tableKey)?.getState();
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `Table ${tableKey} could not be founded at getViewState`,
        payload: tableKey
      });
      return null
    }
    const { table } = store
    return {
      table,
      rows: table.getRows().map(row => ({
        id: row.id.value,
        changeFields: row.getChangeFields(),
        cells: Object.fromEntries(
          [...row.getCells()].map(([k, c]) => [k, c.getValue()?.value])
        ),
        rowState: row.rowState.value,
        moreDetails: row.moreDetails
      })),
    };

  }
  getExpandedRowData(tableKey: string, rowId: number) {
    const store = this.getStore(tableKey)?.getState();
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `Table ${tableKey} could not be founded at getViewState`,
        payload: tableKey
      });
      return null
    }
    const { table } = store
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
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `Active cell is not found`,
        payload: tableKey
      });
      return null
    }

    return store.activeCell;
  }
  getActiveRow(tableKey: string) {
    const store = this.getStore(tableKey)?.getState();
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `store could not be founded at getActiveRow`,
        payload: tableKey
      });
      return null
    }
    return store.activeRowId;
  }
  getSelectedRows(tableKey: string): Record<number, boolean> {
    const store = this.getStore(tableKey)?.getState();
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `store could not be founded at getSelectedRows`,
        payload: tableKey
      });
      return null
    }
    return store.selectedRows;
  }
  getCell(tableKey: string, rowId: number, columnId: string) {
    const store = this.getStore(tableKey)?.getState();
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `store could not be founded at getCell`,
        payload: tableKey
      });
      return null
    }
    return store.table.getRow(rowId).getCell(columnId);
  }
  subscribeColumn<T = unknown>(
    tableKey: string,
    columnId: string,
    cb: (items: Array<{ id: number; rowNum: unknown; value: T }>) => void
  ) {
    const store = this.getStore(tableKey);
    if (!store) {
      this.audit.log({
        type: 'ERROR',
        message: `subscribeColumn store is not found`,
        payload: tableKey
      });
      return null
    }
    let prev = this.getViewState(tableKey)
      .rows.map(r => ({
        id: r.id,
        rowNum: r.cells['index']?.value,
        value: r.cells[columnId]?.value as T
      }));

    return store.subscribe(() => {
      const state = this.getViewState(tableKey);

      const next = state.rows.map(r => ({
        id: r.id,
        rowNum: r.cells['index']?.value,
        value: r.cells[columnId]?.value as T
      }));

      const changed =
        next.length !== prev.length ||
        next.some((item, i) =>
          item.id !== prev[i].id ||
          item.rowNum !== prev[i].rowNum ||
          item.value !== prev[i].value
        );

      if (changed) {
        prev = next;
        cb(next);
      }
    });
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
  isSelectedRow(tableKey: string, rowId: number): boolean {
    try {
      const { selectedRows } = this.getStore(tableKey).getState();
      return !!selectedRows && !!selectedRows[rowId];
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
  isExpandableRow(tableKey: string, rowId: number): boolean {
    const { table } = this.getStore(tableKey).getState();
    const row = table.getRow(rowId)
    const expandAble = row.getMoreDetails()
    return !!expandAble;
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
