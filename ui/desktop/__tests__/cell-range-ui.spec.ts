import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  cellRangeClassName,
  cellRangeEdgeAttr,
  resolveCellRangePresentation,
} from '../../../engine/selection/cellRangePresentation';
import type { CellRange } from '../../../engine/selection/cellRange';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-105 cell range UI', () => {
  it('marks edge cells for a rectangular range', () => {
    const ranges: CellRange[] = [
      { startRow: 1, endRow: 2, colIds: ['name', 'amount'] },
    ];
    const corner = resolveCellRangePresentation(
      { rowIndex: 1, colId: 'name' },
      ranges,
    );
    expect(corner.inRange).toBe(true);
    expect(corner.top).toBe(true);
    expect(corner.left).toBe(true);
    expect(cellRangeClassName(corner)).toBe('pdg-cell-range');
    expect(cellRangeEdgeAttr(corner)).toContain('top');
    expect(cellRangeEdgeAttr(corner)).toContain('left');

    const inner = resolveCellRangePresentation(
      { rowIndex: 2, colId: 'amount' },
      ranges,
    );
    expect(inner.bottom).toBe(true);
    expect(inner.right).toBe(true);
    expect(inner.top).toBe(false);
  });

  it('renders range data attributes on a table cell', () => {
    const flags = resolveCellRangePresentation(
      { rowIndex: 0, colId: 'name' },
      [{ startRow: 0, endRow: 0, colIds: ['name'] }],
    );
    const html = renderToStaticMarkup(
      React.createElement('td', {
        className: cellRangeClassName(flags),
        'data-pdg-cell-range': 'true',
        'data-pdg-range-edge': cellRangeEdgeAttr(flags),
      }),
    );
    expect(html).toContain('data-pdg-cell-range="true"');
    expect(html).toContain('pdg-cell-range');
    expect(html).toContain('data-pdg-range-edge="');
    expect(html).toMatch(/top/);
    expect(html).toMatch(/bottom/);
    expect(html).toMatch(/left/);
    expect(html).toMatch(/right/);
  });

  it('wires GridApi, keyboard, CSS tokens, and row chrome', () => {
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('getCellRanges');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('addCellRange');
    expect(load('infrastructure/ui/UITableKeyboardHandler.ts')).toContain(
      'EXTEND_CELL_RANGE',
    );
    expect(load('infrastructure/ui/UITableKeyboardHandler.ts')).toContain(
      'SELECT_ALL_CELLS',
    );
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('data-pdg-cell-range');
    expect(load('ui/styles/erp-table.css')).toContain('--pdg-range-bg');
    expect(load('ui/styles/erp-table.css')).toContain('--pdg-range-border');
    expect(load('engine/managers/CellRangeManager.ts')).toContain(
      'CellRangeManager',
    );
  });
});
