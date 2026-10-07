// engine/managers/SelectionManager.ts

import { RowId } from '../../domain/value-objects';
import { EngineErrorHandler } from '../EngineErrorHandler';
import { TableStore } from '../tableStore';
import { TableState } from '../type';

export class SelectionManager {
  constructor(
    private readonly readStore: () => TableStore<TableState> | undefined,
    private readonly err: EngineErrorHandler,
    private readonly getGroupChildren?: (
      rowId: number,
    ) => readonly number[] | undefined,
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
    const children = this.getGroupChildren?.(cmd.rowId);

    store.setState(prev => {
      const targets = children?.length
        ? [cmd.rowId, ...children]
        : [cmd.rowId];
      const allOn = targets.every((id) => prev.selectedRows[id]);

      if (allOn) {
        return {
          ...prev,
          selectedRows: {},
          rangeAnchorRowId: undefined,
        };
      }

      const nextSelected: Record<number, true> = {};
      for (const id of targets) nextSelected[id] = true;
      return {
        ...prev,
        selectedRows: nextSelected,
        rangeAnchorRowId: cmd.rowId,
      };
    });
  }

  toggleRowSelection(cmd: { tableKey: string; rowId: number }): void {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;
    const children = this.getGroupChildren?.(cmd.rowId);

    store.setState(prev => {
      const targets = children?.length
        ? [cmd.rowId, ...children]
        : [cmd.rowId];
      const allOn = targets.every((id) => prev.selectedRows[id]);
      const nextSelected = { ...prev.selectedRows };

      if (allOn) {
        for (const id of targets) delete nextSelected[id];
      } else {
        for (const id of targets) nextSelected[id] = true;
      }

      return { ...prev, selectedRows: nextSelected };
    });
  }

  /**
   * Toggle selection of every row in the dataset (ids from IndexedDB SoT).
   * Does not use the RAM page window — `rowIds` must be the full id list.
   */
  toggleSelectAllRows(cmd: { tableKey: string; rowIds: number[] }): void {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;

    const state = store.getState();
    const ids = cmd.rowIds;
    const selectedCount = Object.keys(state.selectedRows).length;
    const allSelected =
      ids.length > 0 &&
      selectedCount === ids.length &&
      ids.every(id => state.selectedRows[id]);

    store.setState(prev => {
      if (allSelected) {
        return { ...prev, selectedRows: {} };
      }

      const nextSelected: Record<number, true> = {};
      for (const id of ids) {
        nextSelected[id] = true;
      }

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

  clearRowSelection(cmd: { tableKey: string }): void {
    const store = this.getStore(cmd.tableKey);
    if (!store) return;
    store.setState((prev) => ({
      ...prev,
      selectedRows: {},
      rangeAnchorRowId: undefined,
    }));
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