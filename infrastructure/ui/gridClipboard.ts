import type { CellRange } from '../../engine/selection/cellRange';
import {
  buildClipboardPayload,
  type ClipboardCopyBuildOptions,
  type ClipboardPayload,
} from '../../engine/selection/clipboardCopy';
import { buildCutClearTargets } from '../../engine/selection/clipboardCut';
import { buildPastePlan } from '../../engine/selection/clipboardPaste';
import type { TableEngine } from '../../engine/tableEngine';

export type ClipboardCopyEvent = {
  plainText: string;
  html: string;
  ranges: readonly CellRange[];
};

export type ClipboardPasteEvent = {
  text: string;
  applied: number;
  skipped: number;
  rowsAdded: number;
};

export type GridPasteRuntimeOptions = {
  /** When true (default), paste past the last row adds empty rows. */
  pasteAddsRows?: boolean;
  onClipboardPaste?: (event: ClipboardPasteEvent) => boolean | void;
};

export type GridClipboardRuntimeOptions = ClipboardCopyBuildOptions &
  GridPasteRuntimeOptions & {
    onClipboardCopy?: (event: ClipboardCopyEvent) => boolean | void;
  };

export const DEFAULT_GRID_PASTE_OPTIONS: GridPasteRuntimeOptions = {
  pasteAddsRows: true,
};

export const DEFAULT_GRID_CLIPBOARD_OPTIONS: GridClipboardRuntimeOptions = {
  copyFormattedValue: false,
  copyHeadersToClipboard: false,
  copyDigitsAsLatin: true,
  pasteAddsRows: true,
};

export type PasteGridResult = {
  applied: number;
  skipped: number;
  rowsAdded: number;
};

export async function writeSystemClipboard(
  payload: Pick<ClipboardPayload, 'plainText' | 'html'>,
): Promise<void> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.write === 'function' &&
    typeof ClipboardItem !== 'undefined'
  ) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([payload.plainText], { type: 'text/plain' }),
        'text/html': new Blob([payload.html], { type: 'text/html' }),
      }),
    ]);
    return;
  }

  if (typeof document === 'undefined') return;

  const textarea = document.createElement('textarea');
  textarea.value = payload.plainText;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

export async function copyGridSelectionToClipboard(
  engine: TableEngine,
  options: GridClipboardRuntimeOptions = DEFAULT_GRID_CLIPBOARD_OPTIONS,
): Promise<boolean> {
  const view = engine.getViewState();
  const uiRows = engine.getAllUIRows();
  if (!view || !uiRows || uiRows.length === 0) return false;

  const active = view.activeCell;
  const activeCell =
    active?.rowId != null && active.columnId
      ? {
          rowIndex: engine.getUiRowAbsoluteIndex(active.rowId),
          colId: active.columnId,
        }
      : null;

  const payload = buildClipboardPayload({
    ranges: engine.getCellRanges(),
    rows: uiRows.map((row) => ({
      id: row.id,
      loading: row.loading,
      cells: Object.fromEntries(
        Object.entries(row.cells).map(([colId, cell]) => [
          colId,
          {
            value: cell.value,
            display: String(cell.display ?? cell.value ?? ''),
          },
        ]),
      ),
    })),
    columns: view.columns.map((col) => ({
      id: col.fieldName,
      header: col.fieldCaption,
    })),
    activeCell:
      activeCell && activeCell.rowIndex >= 0 ? activeCell : null,
    options,
  });

  if (!payload) return false;

  if (options.onClipboardCopy) {
    const allow = options.onClipboardCopy({
      plainText: payload.plainText,
      html: payload.html,
      ranges: payload.ranges,
    });
    if (allow === false) return false;
  }

  await writeSystemClipboard(payload);
  return true;
}

export async function cutGridSelectionToClipboard(
  engine: TableEngine,
  store: string,
  tableKey: string,
  options: GridClipboardRuntimeOptions = DEFAULT_GRID_CLIPBOARD_OPTIONS,
): Promise<boolean> {
  const copied = await copyGridSelectionToClipboard(engine, options);
  if (!copied) return false;

  const view = engine.getViewState();
  if (!view) return false;

  const targets = buildCutClearTargets(
    engine.getCellRanges(),
    view.columns.map((col) => ({
      id: col.fieldName,
      editable: col.editable,
      fieldType: col.fieldType,
      hidden: col.hidden,
    })),
  );
  if (targets.length === 0) return true;

  const correlationId = createPasteCorrelationId();
  await applyCellTextUpdates(engine, store, tableKey, targets, {
    correlationId,
    pasteAddsRows: false,
  });
  return true;
}

export async function readSystemClipboardText(): Promise<string> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.readText === 'function'
  ) {
    return navigator.clipboard.readText();
  }
  return '';
}

export function createPasteCorrelationId(): string {
  return `paste-cells-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function applyCellTextUpdates(
  engine: TableEngine,
  store: string,
  tableKey: string,
  targets: readonly { rowIndex: number; colId: string; rawText: string }[],
  options: {
    pasteAddsRows?: boolean;
    rowsToAdd?: number;
    correlationId?: string;
  } = {},
): Promise<PasteGridResult> {
  const empty: PasteGridResult = { applied: 0, skipped: 0, rowsAdded: 0 };
  if (targets.length === 0) return empty;

  const correlationId = options.correlationId ?? createPasteCorrelationId();
  const rowCount = engine.getUiRowCount();
  const maxRow = targets.reduce((m, t) => Math.max(m, t.rowIndex), -1);
  const rowsToAdd =
    options.rowsToAdd ??
    (options.pasteAddsRows !== false && maxRow >= rowCount
      ? maxRow - rowCount + 1
      : 0);

  let rowsAdded = 0;
  for (let i = 0; i < rowsToAdd; i += 1) {
    await engine.dispatch({
      type: 'ADD_EMPTY_ROW',
      store,
      tableKey,
      autoActivate: false,
      correlationId,
    });
    rowsAdded += 1;
  }

  const rowIds = engine.getUiRowIndex().getOrderedIds();
  const updates = targets
    .map((target) => {
      const rowId = rowIds[target.rowIndex];
      if (rowId === undefined) return null;
      return {
        rowId,
        columnId: target.colId,
        rawText: target.rawText,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item != null);

  if (updates.length === 0) {
    return { applied: 0, skipped: 0, rowsAdded };
  }

  await engine.dispatch({
    type: 'PASTE_CELLS',
    store,
    tableKey,
    updates,
    correlationId,
  });

  return { applied: updates.length, skipped: 0, rowsAdded };
}

export async function pasteGridFromClipboard(
  engine: TableEngine,
  store: string,
  tableKey: string,
  options: GridClipboardRuntimeOptions = DEFAULT_GRID_CLIPBOARD_OPTIONS,
): Promise<PasteGridResult> {
  const empty: PasteGridResult = { applied: 0, skipped: 0, rowsAdded: 0 };
  const view = engine.getViewState();
  if (!view) return empty;

  const text = await readSystemClipboardText();
  if (!text.trim()) return empty;

  const columnOrder = view.columns
    .filter((col) => !col.hidden)
    .map((col) => col.fieldName);

  const active = view.activeCell;
  const activeCell =
    active?.rowId != null && active.columnId
      ? {
          rowIndex: engine.getUiRowAbsoluteIndex(active.rowId),
          colId: active.columnId,
        }
      : null;

  const plan = buildPastePlan({
    text,
    ranges: engine.getCellRanges(),
    activeCell:
      activeCell && activeCell.rowIndex >= 0 ? activeCell : null,
    columnOrder,
    columns: view.columns.map((col) => ({
      id: col.fieldName,
      editable: col.editable,
      fieldType: col.fieldType,
    })),
    pasteAddsRows: options.pasteAddsRows,
    rowCount: engine.getUiRowCount(),
  });

  if (!plan || plan.targets.length === 0) {
    return { ...empty, skipped: plan?.skipped.length ?? 0 };
  }

  const preview: PasteGridResult = {
    applied: plan.targets.length,
    skipped: plan.skipped.length,
    rowsAdded: plan.rowsToAdd,
  };

  if (options.onClipboardPaste) {
    const allow = options.onClipboardPaste({
      text,
      applied: preview.applied,
      skipped: preview.skipped,
      rowsAdded: preview.rowsAdded,
    });
    if (allow === false) return empty;
  }

  const result = await applyCellTextUpdates(
    engine,
    store,
    tableKey,
    plan.targets,
    { rowsToAdd: plan.rowsToAdd, pasteAddsRows: options.pasteAddsRows },
  );

  return {
    applied: result.applied,
    skipped: plan.skipped.length,
    rowsAdded: result.rowsAdded,
  };
}
