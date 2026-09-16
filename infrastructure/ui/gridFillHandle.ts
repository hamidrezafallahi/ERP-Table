import { buildFillUpdates } from '../../engine/selection/fillHandle';
import type { CellRange } from '../../engine/selection/cellRange';
import type { TableEngine } from '../../engine/tableEngine';
import {
  applyCellTextUpdates,
  type GridClipboardRuntimeOptions,
  type PasteGridResult,
} from './gridClipboard';

export async function applyFillHandleDrag(
  engine: TableEngine,
  store: string,
  tableKey: string,
  extendTo: { rowIndex: number; colIndex: number },
  copyOnly: boolean,
  options: GridClipboardRuntimeOptions = {},
): Promise<PasteGridResult> {
  const empty: PasteGridResult = { applied: 0, skipped: 0, rowsAdded: 0 };
  const view = engine.getViewState();
  const uiRows = engine.getAllUIRows();
  if (!view || !uiRows) return empty;

  const ranges = engine.getCellRanges();
  const sourceRange = ranges[0];
  if (!sourceRange) return empty;

  const columnOrder = view.columns
    .filter((col) => !col.hidden)
    .map((col) => col.fieldName);

  const editableCols = new Set(
    view.columns
      .filter(
        (col) =>
          col.editable !== false &&
          col.fieldType !== 'index' &&
          !col.hidden,
      )
      .map((col) => col.fieldName),
  );

  const getSourceText = (rowIndex: number, colId: string): string => {
    const row = uiRows[rowIndex];
    if (!row) return '';
    const cell = row.cells[colId];
    if (cell?.value != null && cell.value !== '') {
      return String(cell.value);
    }
    return String(cell?.display ?? '');
  };

  const targets = buildFillUpdates({
    sourceRange,
    extendToRowIndex: extendTo.rowIndex,
    extendToColIndex: extendTo.colIndex,
    columnOrder,
    getSourceText,
    copyOnly,
  }).filter((t) => editableCols.has(t.colId));

  if (targets.length === 0) return empty;

  const maxRow = targets.reduce((m, t) => Math.max(m, t.rowIndex), -1);
  const rowsToAdd =
    options.pasteAddsRows !== false && maxRow >= engine.getUiRowCount()
      ? maxRow - engine.getUiRowCount() + 1
      : 0;

  return applyCellTextUpdates(engine, store, tableKey, targets, {
    pasteAddsRows: options.pasteAddsRows,
    rowsToAdd,
  });
}

export function resolveCellAddressFromPoint(
  clientX: number,
  clientY: number,
): { rowIndex: number; colId: string; colIndex: number } | null {
  if (typeof document === 'undefined') return null;
  const el = document
    .elementFromPoint(clientX, clientY)
    ?.closest('[data-columnid][data-pdg-row-index]') as HTMLElement | null;
  if (!el) return null;
  const rowIndex = Number(el.dataset.pdgRowIndex);
  const colId = el.dataset.columnid;
  const colIndex = Number(el.dataset.pdgColIndex);
  if (!Number.isFinite(rowIndex) || !colId) return null;
  return {
    rowIndex,
    colId,
    colIndex: Number.isFinite(colIndex) ? colIndex : 0,
  };
}

export type { CellRange };
