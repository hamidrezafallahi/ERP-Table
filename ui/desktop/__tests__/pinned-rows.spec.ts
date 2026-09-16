import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  ariaDataRowIndex,
  ariaFooterRowIndex,
  ariaGridRowCount,
  ariaPinnedBottomRowIndex,
  ariaPinnedTopRowIndex,
} from '../../a11y/gridRoles';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-116 pinned top/bottom rows', () => {
  it('DesktopTable wires pinned props outside virtual body', () => {
    const desktop = load('ui/desktop/DesktopTable.tsx');
    expect(desktop).toContain('pinnedTopRowData');
    expect(desktop).toContain('pinnedBottomRowData');
    expect(desktop).toContain('ERPTablePinnedRows');
    // Render order in JSX: pinned top → body → pinned bottom → footer
    const renderStart = desktop.indexOf('return (');
    const slice = desktop.slice(renderStart);
    const topIdx = slice.indexOf('side="top"');
    const bodyIdx = Math.min(
      slice.indexOf('<ERPTableVirtualBody'),
      slice.indexOf('<ERPTableBody'),
    );
    const bottomIdx = slice.indexOf('side="bottom"');
    const footerIdx = slice.indexOf('<ERPTableFooter');
    expect(topIdx).toBeGreaterThan(-1);
    expect(bodyIdx).toBeGreaterThan(topIdx);
    expect(bottomIdx).toBeGreaterThan(bodyIdx);
    expect(footerIdx).toBeGreaterThan(bottomIdx);
  });

  it('pinned rows component is display-only (no selection / drag)', () => {
    const pinned = load('ui/desktop/ERPTablePinnedRows.tsx');
    expect(pinned).toContain('data-erp-pinned-row');
    expect(pinned).toContain('readPinnedRowCellValue');
    expect(pinned).not.toContain('TOGGLE_ROW_SELECTED');
    expect(pinned).not.toContain('draggedRowIdRef');
  });

  it('CSS sticks pinned rows in the scrollport', () => {
    const css = load('ui/styles/erp-table.css');
    expect(css).toContain('.erp-pinned-rows--top');
    expect(css).toContain('.erp-pinned-rows--bottom');
    expect(css).toContain('--erp-pinned-top-offset');
    expect(css).toContain('position: sticky');
  });

  it('DataGrid exposes pinnedTopRowData / pinnedBottomRowData', () => {
    const ui = load('ui/index.tsx');
    expect(ui).toContain('pinnedTopRowData');
    expect(ui).toContain('pinnedBottomRowData');
  });

  it('aria indices account for pinned rows', () => {
    expect(ariaPinnedTopRowIndex(0)).toBe(2);
    expect(ariaDataRowIndex(0, 1)).toBe(3);
    expect(ariaPinnedBottomRowIndex(0, 10, 1)).toBe(13);
    expect(ariaFooterRowIndex(10, 1, 1)).toBe(14);
    expect(ariaGridRowCount(10, true, 1, 1)).toBe(14);
    // Backward compatible defaults
    expect(ariaDataRowIndex(0)).toBe(2);
    expect(ariaGridRowCount(10, false)).toBe(11);
  });

  it('footer still uses ColumnAggIndex (aggregation intact)', () => {
    const footer = load('ui/desktop/ERPTableFooter.tsx');
    expect(footer).toContain('getColumnAggs');
    expect(footer).toContain('subscribeColumnAggs');
  });
});
