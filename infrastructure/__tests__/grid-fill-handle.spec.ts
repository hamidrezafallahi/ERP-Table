import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { createGrid } from '../../bootstrap';
import { applyFillHandleDrag } from '../ui/gridFillHandle';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-108 grid fill handle', () => {
  it('wires fill handle UI and controller apply', () => {
    expect(load('ui/desktop/FillHandle.tsx')).toContain('pdg-fill-handle');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('FillHandle');
    expect(load('infrastructure/ui/UITableController.ts')).toContain(
      'applyFillHandleDrag',
    );
    expect(load('engine/selection/fillHandle.ts')).toContain('buildFillUpdates');
    expect(load('ui/styles/erp-table.css')).toContain('.pdg-fill-handle');
  });

  it('applyFillHandleDrag fills numbers with one undo unit', async () => {
    const grid = createGrid({
      columnDefs: [
        { field: 'n', headerName: 'N', type: 'number' },
      ],
      rowData: [{ n: 1 }, { n: 2 }, { n: 3 }],
    });
    const { engine, controller, session, cellUndoStack } = await grid.ready;

    engine.addCellRange({ startRow: 0, endRow: 2, colIds: ['n'] });

    const depthBefore = cellUndoStack.undoDepth();
    await applyFillHandleDrag(
      engine,
      grid.store,
      grid.tableKey,
      { rowIndex: 5, colIndex: 0 },
      false,
      controller.getClipboardOptions(),
    );

    expect(engine.getUiRowCount()).toBeGreaterThan(3);
    expect(cellUndoStack.undoDepth()).toBe(depthBefore + 1);

    await session.undo();
    expect(engine.getUiRowCount()).toBe(3);
  });
});
