import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createGrid } from '../../bootstrap';
import {
  copyGridSelectionToClipboard,
  writeSystemClipboard,
} from '../ui/gridClipboard';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-106 grid clipboard', () => {
  it('wires Ctrl+C in keyboard handler and bootstrap attachCopyCells', () => {
    expect(load('infrastructure/ui/UITableKeyboardHandler.ts')).toContain(
      'ctrlKey && !altKey',
    );
    expect(load('bootstrap/index.ts')).toContain('attachCopyCells');
    expect(load('bootstrap/index.ts')).toContain('copyGridSelectionToClipboard');
    expect(load('ui/index.tsx')).toContain('onClipboardCopy');
  });

  describe('writeSystemClipboard', () => {
    const write = vi.fn();

    beforeEach(() => {
      write.mockReset();
      vi.stubGlobal('navigator', {
        clipboard: { write },
      });
      vi.stubGlobal(
        'ClipboardItem',
        class ClipboardItem {
          types: Record<string, Blob>;
          constructor(types: Record<string, Blob>) {
            this.types = types;
          }
        },
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('writes text/plain and text/html blobs', async () => {
      await writeSystemClipboard({
        plainText: 'a\tb',
        html: '<table></table>',
      });
      expect(write).toHaveBeenCalledTimes(1);
      const items = write.mock.calls[0]?.[0] as Array<{ types: Record<string, Blob> }>;
      expect(items[0]?.types['text/plain']).toBeDefined();
      expect(items[0]?.types['text/html']).toBeDefined();
    });
  });

  describe('copyGridSelectionToClipboard', () => {
    const write = vi.fn();

    beforeEach(() => {
      write.mockReset();
      vi.stubGlobal('navigator', {
        clipboard: { write },
      });
      vi.stubGlobal(
        'ClipboardItem',
        class ClipboardItem {
          constructor(public types: Record<string, Blob>) {}
        },
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('copies active cell as TSV when no range is selected', async () => {
      const grid = createGrid({
        columnDefs: [
          { field: 'name', headerName: 'Name' },
          { field: 'amount', headerName: 'Amount' },
        ],
        rowData: [
          { name: 'علی', amount: 123456 },
          { name: 'Reza', amount: 789 },
        ],
      });
      const { engine, controller } = await grid.ready;

      const firstRowId = engine.getAllRows()?.[0]?.id.value;
      expect(firstRowId).toBeDefined();
      engine.dispatch({
        type: 'ACTIVE_CELL',
        tableKey: grid.tableKey,
        rowId: firstRowId!,
        columnId: 'amount',
      });
      engine.syncCellRangeToActiveCell();

      const ok = await copyGridSelectionToClipboard(
        engine,
        controller.getClipboardOptions(),
      );
      expect(ok).toBe(true);
      expect(write).toHaveBeenCalledTimes(1);
      const item = write.mock.calls[0]?.[0]?.[0] as { types: Record<string, Blob> };
      const plain = await item.types['text/plain'].text();
      expect(plain).toBe('123456');
    });

    it('onClipboardCopy can cancel the write', async () => {
      const grid = createGrid({
        columnDefs: [{ field: 'name', headerName: 'Name' }],
        rowData: [{ name: 'test' }],
      });
      const { engine } = await grid.ready;
      const rowId = engine.getAllRows()?.[0]?.id.value;
      engine.dispatch({
        type: 'ACTIVE_CELL',
        tableKey: grid.tableKey,
        rowId: rowId!,
        columnId: 'name',
      });
      engine.syncCellRangeToActiveCell();

      const ok = await copyGridSelectionToClipboard(engine, {
        onClipboardCopy: () => false,
      });
      expect(ok).toBe(false);
      expect(write).not.toHaveBeenCalled();
    });
  });
});
