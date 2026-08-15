// engine/managers/SelectionManager.ts

import { RowId } from '../../domain/value-objects';
import { EngineErrorHandler } from '../EngineErrorHandler';
import { TableStore } from '../tableStore';
import { TableState } from '../type';

export class SelectionManager {
  constructor(
    private readonly readStore: () => TableStore<TableState> | undefined,
    private readonly err: EngineErrorHandler,
  ) {}

  private getStore(tableKey: string) {
    const store = this.readStore();
    if (!store) {
      this.err.notFound('TableStore', tableKey, 'SelectionManager');
    }
    return store;
  }

  setSelectRow(cmd: { tableKey: string; rowId: number }): void {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

    store.setState(prev => {
      const isSelected = !!prev.selectedRows[cmd.rowId];

      return {
        ...prev,
        selectedRows: isSelected ? {} : { [cmd.rowId]: true },
         rangeAnchorRowId: isSelected ? undefined : cmd.rowId,
      };
    });
  }

  toggleRowSelection(cmd: { tableKey: string; rowId: number }): void {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

    store.setState(prev => {
      const isSelected = !!prev.selectedRows[cmd.rowId];

      const nextSelected = { ...prev.selectedRows };

      if (isSelected) {
        delete nextSelected[cmd.rowId];
      } else {
        nextSelected[cmd.rowId] = true;
      }

      return { ...prev, selectedRows: nextSelected };
    });
  }

  toggleSelectAllRows(cmd: { tableKey: string }): void {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

    const state = store.getState();
    const allRows = state.table.getRows();

    const allSelected =
      Object.keys(state.selectedRows).length === allRows.length;

    store.setState(prev => {
      if (allSelected) {
        return { ...prev, selectedRows: {} };
      }

      const nextSelected: Record<number, true> = {};

      allRows.forEach(row => {
        nextSelected[row.id.value] = true;
      });

      return { ...prev, selectedRows: nextSelected };
    });
  }

  toggleSelectPageRows(cmd: { tableKey: string }): void {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

    const state = store.getState();

    const pageRows = state.table.getVisibleRows();
    const selectedRows = state.selectedRows;

    const allPageRowsSelected = pageRows.every(row =>
      Object.prototype.hasOwnProperty.call(selectedRows, row.id.value),
    );

    store.setState(prev => {
      if (allPageRowsSelected) {
        return { ...prev, selectedRows: {} };
      }

      const nextSelected: Record<number, true> = {};

      pageRows.forEach(row => {
        nextSelected[row.id.value] = true;
      });

      return { ...prev, selectedRows: nextSelected };
    });
  }

  selectRange(cmd: { tableKey: string; rowId: number }): void {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

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

  selectFromActiveToLast(cmd: {
    tableKey: string;
    anchorRowId: number;
  }): void {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

    store.setState(prev => {
      const rows = prev.table.getVisibleRows();

      const startIdx = rows.findIndex(
        r => r.id.value === cmd.anchorRowId,
      );

      if (startIdx === -1) return prev;

      const nextSelected: Record<number, true> = {
        ...prev.selectedRows,
      };

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

  deleteAll(tableKey: string): void {
    const store = this.getStore(tableKey);
    if (!store) return;

    const { table, selectedRows } = store.getState();

    try {
      Object.entries(selectedRows).forEach(([key]) => {
        table.deleteRow(new RowId(Number(key)));
      });
    } catch (e) {
      this.err.handle(e, 'SelectionManager.deleteAll');
    }

    store.setState(prev => ({
      ...prev,
      selectedRows: {},
      table,
    }));
  }
}