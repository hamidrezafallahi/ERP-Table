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
        expanded: {},
        activeCell: null,
        selectedRows: {},
      })
    );
    await this.repo.save(store, table);
  }
  private async deleteTable(cmd: {
    store: string, tableKey: string
  }) {
    const { store, tableKey } = cmd

    await this.repo.delete(store, tableKey);
    this.tables.delete(tableKey);
  }
  private disposeTable(tableKey: string) {
    this.tables.delete(tableKey);
  }
  private async resetTable(cmd: {
    store: string, tableKey: string
  }) {
    const { store, tableKey } = cmd

    const table = this.tables.get(tableKey);
    if (store) {
      table.resetTable()
      await this.repo.resetTable(store, tableKey);
    }
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

    store.setState({
      ...state,
      activeCell: {
        rowId: cmd.rowId,
        columnId: nextCol.id,
      },
    });
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

    store.setState({
      ...state,
      activeCell: {
        rowId: cmd.rowId,
        columnId: firstEditable.id,
      },
    });
  }
  getViewState(tableKey: string): TableViewState {
    const { table, expanded, activeCell, selectedRows } = this.getStore(tableKey).getState();
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
          isExpanded: !!expanded[row.id.value],
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
      rows: table.getVisibleRows().map(row => ({
        id: row.id.value,
        changeFields: row.getChangeFields(),
        cells: Object.fromEntries(
          [...row.getCells()].map(([k, c]) => [k, c.getValue()?.value])
        ),
        rowState: row.rowState.value
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

    return store.activeRow;
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
      const { activeRow } = this.getStore(tableKey).getState();
      return !!activeRow &&
        activeRow.rowId === rowId
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

  private activeCell(cmd: {
    tableKey: string,
    rowId: number,
    columnId: string
  }) {
    const { tableKey, rowId, columnId } = cmd
    const table = this.getStore(tableKey).getState();
    table.activeCell = { rowId, columnId }

  }
  private activeRow(cmd: {
    tableKey: string,
    rowId: number,

  }) {
    const { tableKey, rowId } = cmd
    const table = this.getStore(tableKey).getState();
    table.activeRow = { rowId }
  }


  private setRowExpanded(cmd: {
    tableKey: string, rowId: number, value: boolean
  }) {
    const { rowId, tableKey, value } = cmd
    const store = this.getStore(tableKey);
    const state = store.getState();
    const key = String(rowId);
    if (!!state.expanded[rowId] === value) return;

    store.setState({
      ...state,
      expanded: {
        ...state.expanded,
        [key]: value,
      },
    });
  }

  private toggleRowExpanded(cmd: {
    tableKey: string, rowId: number
  }) {
    const { rowId, tableKey } = cmd

    const key = String(rowId);

    const store = this.getStore(tableKey);
    const state = store.getState();
    const next = !state.expanded[key];

    store.setState({
      ...state,
      expanded: {
        ...state.expanded,
        [key]: next,
      },
    });
  }

  private collapseAll(tableKey: string) {
    const store = this.getStore(tableKey);
    const state = store.getState();
    if (!state.expanded || Object.keys(state.expanded).length === 0) return;

    store.setState({
      ...state,
      expanded: {},
    });
  }
  private toggleRowSelection(cmd: {
    tableKey: string;
    rowId: number;
  }) {
    const store = this.getStore(cmd.tableKey);
    const state = store.getState();

    const selected = { ...state.selectedRows };

    if (selected[cmd.rowId]) {
      delete selected[cmd.rowId];
    } else {
      selected[cmd.rowId] = true;
    }

    store.setState({
      ...state,
      selectedRows: selected,
    });
  }
  private selectAllVisibleRows(cmd: {
    tableKey: string;
  }) {
    const store = this.getStore(cmd.tableKey);
    const state = store.getState();

    const rows = state.table.getVisibleRows();

    const selected: Record<number, true> = {};
    for (const row of rows) {
      selected[row.id.value] = true;
    }

    store.setState({
      ...state,
      selectedRows: selected,
    });
  }
  private clearRowSelection(cmd: {
    tableKey: string;
  }) {
    const store = this.getStore(cmd.tableKey);
    const state = store.getState();

    store.setState({
      ...state,
      selectedRows: {},
    });
  }
  private moveActiveCellVertical(cmd: {
    tableKey: string;
    rowId: number;
    columnId: string;
    direction: 'up' | 'down';
  }) {
    const store = this.getStore(cmd.tableKey);
    const state = store.getState();
    const rows = state.table.getVisibleRows();

    const rowIndex = rows.findIndex(r => r.id.value === cmd.rowId);
    if (rowIndex === -1) return;

    const nextIndex =
      cmd.direction === 'down' ? rowIndex + 1 : rowIndex - 1;

    const nextRow = rows[nextIndex];
    if (!nextRow) return;

    store.setState({
      ...state,

      activeRow: {
        rowId: nextRow.id.value,
      },
    });
    // آیا این ستون در سطر مقصد وجود دارد؟
    const cell = nextRow.getCells().get(cmd.columnId);
    if (!cell) return;
    store.setState({
      ...state,
      activeCell: {
        rowId: nextRow.id.value,
        columnId: cmd.columnId,
      },
    });
  }


  async dispatch(command: TableCommand) {

    switch (command.type) {
      case 'ACTIVE_CELL':
        this.activeCell(command);
        return;
      case 'ACTIVE_ROW':
        this.activeRow(command);
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
      case 'ROW_SELECTION_TOGGLED':
        this.toggleRowSelection(command);
        return;
      case 'SELECT_ALL_ROWS':
        this.selectAllVisibleRows(command);
        return;
      case 'CLEAR_ROW_SELECTION':
        this.clearRowSelection(command);
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
        this.disposeTable(command.tableKey);
        return;
      case 'COLLAPSE_ALL_ROWS':
        this.collapseAll(command.tableKey);
        return;
      case 'ROW_TOGGLED':
        this.toggleRowExpanded(command);
        return;
      case 'TABLE_RESET':
        this.resetTable(command);
        return;
      default:
        await this.app.execute(command, this.actor);
        const updated = await this.repo.getById(command.store, command.tableKey);
        const store = this.getStore(command.tableKey);
        const prev = store.getState();

        store.setState({
          ...prev,
          table: updated,
        });

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
