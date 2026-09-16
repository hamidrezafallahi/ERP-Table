import { EngineErrorHandler } from '../EngineErrorHandler';
import {
  clickCell,
  ctrlClickCell,
  createEmptyCellRangeSelection,
  normalizeCellRange,
  selectAllCellRanges,
  shiftArrowCell,
  shiftClickCell,
  type ArrowDirection,
  type CellAddress,
  type CellRange,
  type CellRangeBounds,
  type CellRangeSelection,
} from '../selection/cellRange';
import { TableStore } from '../tableStore';
import type { TableState } from '../type';

export class CellRangeManager {
  constructor(
    private readonly readStore: () => TableStore<TableState> | undefined,
    private readonly getBounds: () => CellRangeBounds,
    private readonly err: EngineErrorHandler,
  ) {}

  private getStore(tableKey: string) {
    const store = this.readStore();
    if (!store) {
      this.err.notFound('TableStore', tableKey, 'CellRangeManager');
    }
    return store;
  }

  getSelection(tableKey: string): CellRangeSelection {
    const store = this.getStore(tableKey);
    if (!store) return createEmptyCellRangeSelection();
    return store.getState().cellRangeSelection ?? createEmptyCellRangeSelection();
  }

  setSelection(tableKey: string, selection: CellRangeSelection): void {
    const store = this.getStore(tableKey);
    if (!store) return;
    store.setState((prev) => ({
      ...prev,
      cellRangeSelection: selection,
    }));
  }

  handlePointer(cmd: {
    tableKey: string;
    rowIndex: number;
    colId: string;
    shiftKey: boolean;
    ctrlKey: boolean;
  }): CellRangeSelection {
    const bounds = this.getBounds();
    const cell: CellAddress = { rowIndex: cmd.rowIndex, colId: cmd.colId };
    const prev = this.getSelection(cmd.tableKey);
    let next: CellRangeSelection;
    if (cmd.shiftKey) {
      next = shiftClickCell(prev, cell, bounds);
    } else if (cmd.ctrlKey) {
      next = ctrlClickCell(prev, cell, bounds);
    } else {
      next = clickCell(prev, cell, bounds);
    }
    this.setSelection(cmd.tableKey, next);
    return next;
  }

  extendWithArrow(
    tableKey: string,
    direction: ArrowDirection,
  ): CellRangeSelection {
    const bounds = this.getBounds();
    const prev = this.getSelection(tableKey);
    const next = shiftArrowCell(prev, direction, bounds);
    this.setSelection(tableKey, next);
    return next;
  }

  selectAll(tableKey: string): CellRangeSelection {
    const bounds = this.getBounds();
    const next = selectAllCellRanges(bounds);
    this.setSelection(tableKey, next);
    return next;
  }

  addRange(tableKey: string, range: CellRange): CellRangeSelection {
    const bounds = this.getBounds();
    const normalized = normalizeCellRange(range, bounds);
    const prev = this.getSelection(tableKey);
    const next: CellRangeSelection = {
      ranges: [...prev.ranges, normalized],
      anchor: prev.anchor,
      focus: prev.focus,
    };
    this.setSelection(tableKey, next);
    return next;
  }

  clear(tableKey: string): void {
    this.setSelection(tableKey, createEmptyCellRangeSelection());
  }
}
