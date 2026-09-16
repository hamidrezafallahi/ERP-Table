import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createGrid } from '../../bootstrap';
import { CellUndoStack } from '../../application/undo/CellUndoStack';
import { pasteGridFromClipboard } from '../ui/gridClipboard';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-107 grid clipboard paste', () => {
  it('wires Ctrl+V and batch PASTE_CELLS command', () => {
    expect(load('infrastructure/ui/UITableKeyboardHandler.ts')).toContain(
      "case 'KeyV'",
    );
    expect(load('infrastructure/ui/UITableKeyboardHandler.ts')).toMatch(
      /ctrlKey && !altKey[\s\S]*pasteCells/,
    );
    expect(load('application/commands/index.ts')).toContain('PASTE_CELLS');
    expect(load('bootstrap/index.ts')).toContain('attachPasteCells');
  });

  describe('pasteGridFromClipboard', () => {
    const readText = vi.fn();

    beforeEach(() => {
      readText.mockReset();
      vi.stubGlobal('navigator', {
        clipboard: { readText },
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('pastes TSV into the active cell with Persian number parsing', async () => {
      readText.mockResolvedValue('۱۲۳٫۴۵۶');
      const grid = createGrid({
        columnDefs: [
          { field: 'name', headerName: 'Name' },
          { field: 'amount', headerName: 'Amount', type: 'number' },
        ],
        rowData: [{ name: 'Row', amount: 0 }],
      });
      const { engine, controller, session, cellUndoStack } = await grid.ready;

      const rowId = engine.getAllRows()?.[0]?.id.value;
      engine.dispatch({
        type: 'ACTIVE_CELL',
        tableKey: grid.tableKey,
        rowId: rowId!,
        columnId: 'amount',
      });
      engine.syncCellRangeToActiveCell();

      const beforeUndo = cellUndoStack.canUndo();
      const result = await pasteGridFromClipboard(
        engine,
        grid.store,
        grid.tableKey,
        controller.getClipboardOptions(),
      );
      expect(result.applied).toBe(1);

      const uiRow = engine.getAllUIRows()?.[0];
      expect(uiRow?.cells.amount?.value).toBe(123.456);

      expect(cellUndoStack.canUndo()).toBe(true);
      if (!beforeUndo) {
        expect(cellUndoStack.undoDepth()).toBe(1);
      }

      await session.undo();
      expect(engine.getAllUIRows()?.[0]?.cells.amount?.value).toBe(0);
    });

    it('adds rows when paste extends past the grid', async () => {
      readText.mockResolvedValue('a\nb\nc');
      const grid = createGrid({
        columnDefs: [{ field: 'name', headerName: 'Name' }],
        rowData: [{ name: 'only' }],
      });
      const { engine, controller } = await grid.ready;

      const rowId = engine.getAllRows()?.[0]?.id.value;
      engine.dispatch({
        type: 'ACTIVE_CELL',
        tableKey: grid.tableKey,
        rowId: rowId!,
        columnId: 'name',
      });
      engine.syncCellRangeToActiveCell();

      const result = await pasteGridFromClipboard(
        engine,
        grid.store,
        grid.tableKey,
        { ...controller.getClipboardOptions(), pasteAddsRows: true },
      );
      expect(result.rowsAdded).toBe(2);
      expect(engine.getUiRowCount()).toBe(3);
    });

    it('500×10 paste produces one undo unit', async () => {
      const rows = Array.from({ length: 500 }, () => ({ v: 0 }));
      const matrix = Array.from({ length: 500 }, (_, row) =>
        Array.from({ length: 10 }, (_, col) => `${row * 10 + col + 1}`).join(
          '\t',
        ),
      ).join('\n');
      readText.mockResolvedValue(matrix);

      const grid = createGrid({
        columnDefs: Array.from({ length: 10 }, (_, i) => ({
          field: `c${i}`,
          headerName: `C${i}`,
          type: 'number' as const,
        })),
        rowData: rows.map((row) => ({
          ...row,
          ...Object.fromEntries(
            Array.from({ length: 10 }, (_, i) => [`c${i}`, 0]),
          ),
        })),
      });
      const { engine, controller, cellUndoStack } = await grid.ready;

      const rowId = engine.getAllRows()?.[0]?.id.value;
      engine.dispatch({
        type: 'ACTIVE_CELL',
        tableKey: grid.tableKey,
        rowId: rowId!,
        columnId: 'c0',
      });
      engine.syncCellRangeToActiveCell();

      const depthBefore = cellUndoStack.undoDepth();
      await pasteGridFromClipboard(
        engine,
        grid.store,
        grid.tableKey,
        controller.getClipboardOptions(),
      );
      expect(cellUndoStack.undoDepth()).toBe(depthBefore + 1);
    });
  });

  it('CellUndoStack merges batch paste correlationId', () => {
    const stack = new CellUndoStack();
    const correlationId = 'paste-batch';
    for (let i = 0; i < 50; i += 1) {
      stack.record(
        {
          type: 'CELL_CHANGED',
          tableId: 't1',
          rowId: i,
          columnId: 'v',
          newValue: i,
          previousValue: 0,
        },
        correlationId,
      );
    }
    expect(stack.undoDepth()).toBe(1);
  });
});
