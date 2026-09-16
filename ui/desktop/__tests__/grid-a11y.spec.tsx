/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import axe from 'axe-core';

import { createGrid } from '../../../bootstrap';
import { ERPTableHostProvider } from '../../host/ERPTableHost';
import { themeDefault } from '../../theme';
import { DesktopTable } from '../DesktopTable';
import {
  ARIA_HEADER_ROW_INDEX,
  ariaColIndex,
  ariaDataRowIndex,
  ariaFooterRowIndex,
  ariaGridRowCount,
  gridCellDomId,
  isAriaSelectedCell,
} from '../../a11y/gridRoles';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

type Row = {
  id: string;
  name: string;
  category: string;
  amount: number;
  notes: string;
};

function stubMatchMedia(desktop = true): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: desktop ? query.includes('min-width') : false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

function stubResizeObserver(): void {
  class RO {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: RO,
  });
}

async function expectNoSeriousOrCritical(
  container: HTMLElement,
  label: string,
): Promise<void> {
  const run = axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  });
  const results = await Promise.race([
    run,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`axe timed out: ${label}`)), 20_000);
    }),
  ]);
  const bad = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(bad, `${label}\n${JSON.stringify(bad, null, 2)}`).toEqual([]);
}

function makeRows(n: number): Row[] {
  return Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    name: `Item ${i + 1}`,
    category: i % 2 === 0 ? 'food' : 'tool',
    amount: (i + 1) * 1000,
    notes: `note-${i + 1}`,
  }));
}

describe('PR-62 / PR-63 grid roles (source contracts)', () => {
  it('maps 0-based collection indices to 1-based ARIA indices', () => {
    expect(ARIA_HEADER_ROW_INDEX).toBe(1);
    expect(ariaColIndex(0)).toBe(1);
    expect(ariaColIndex(3)).toBe(4);
    expect(ariaDataRowIndex(0)).toBe(2);
    expect(ariaDataRowIndex(9)).toBe(11);
    expect(ariaFooterRowIndex(10)).toBe(12);
    expect(ariaGridRowCount(10, false)).toBe(11);
    expect(ariaGridRowCount(10, true)).toBe(12);
    expect(ariaGridRowCount(10, true, 1, 1)).toBe(14);
  });

  it('desktop table is a grid with columnheader / gridcell / rowindex', () => {
    expect(load('ui/desktop/DesktopTable.tsx')).toContain("role={isTreeGrid ? 'treegrid' : 'grid'}");
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('aria-colcount');
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('aria-rowcount');
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('columnheader');
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('aria-colindex');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('gridcell');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('aria-rowindex');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('ariaDataRowIndex');
  });

  it('virtual body uses absolute indices, not the mounted window offset', () => {
    const virtual = load('ui/desktop/ERPTableVirtualBody.tsx');
    expect(virtual).toContain('absoluteIndex');
    expect(virtual).toContain('index={absoluteIndex}');
    expect(virtual).toMatch(/aria-hidden/);
    expect(virtual).not.toContain('ariaDataRowIndex(i)');
  });

  it('mobile table uses the same grid roles', () => {
    expect(load('ui/mobile/MobileTable.tsx')).toContain('role="grid"');
    expect(load('ui/mobile/MobileTableHeader.tsx')).toContain('columnheader');
    expect(load('ui/mobile/MobileTableRow.tsx')).toContain('gridcell');
    expect(load('ui/mobile/MobileTableRow.tsx')).toContain('ariaDataRowIndex');
  });

  it('builds a stable cell id and selected flag', () => {
    expect(gridCellDomId('voucher:1', 12, 'qty.price')).toBe(
      'erp-cell-voucher_1-12-qty_price',
    );
    expect(
      isAriaSelectedCell({ rowId: 12, columnId: 'qty' }, 12, 'qty'),
    ).toBe(true);
    expect(
      isAriaSelectedCell({ rowId: 12, columnId: 'qty' }, 12, 'price'),
    ).toBe(false);
    expect(isAriaSelectedCell(null, 12, 'qty')).toBe(false);
  });

  it('wires aria-selected, activedescendant, and select-row labels', () => {
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('gridCellA11y');
    expect(load('ui/desktop/DesktopTable.tsx')).toContain(
      'aria-activedescendant',
    );
    expect(load('ui/mobile/MobileTableRow.tsx')).toContain('gridCellA11y');
    expect(load('ui/desktop/indexCol.tsx')).toContain('general.selectRow');
    expect(load('ui/mobile/MobileIndexCol.tsx')).toContain(
      'general.selectRow',
    );
    expect(load('ui/index.tsx')).toContain('KEY_DOWN');
  });

  it('cell editors use tabIndex -1 (APG activedescendant; PR-123)', () => {
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('tabIndex={-1}');
    expect(load('ui/mobile/MobileTableRow.tsx')).toContain('tabIndex={-1}');
    expect(load('ui/desktop/eRPTableRow.tsx')).not.toContain(
      'tabIndex={absoluteColIndex}',
    );
  });
});

describe('PR-123 axe-core (real DOM)', () => {
  beforeEach(() => {
    stubMatchMedia(true);
    stubResizeObserver();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('20-row grid with sort filter pin has no serious|critical axe violations', async () => {
    const grid = createGrid<Row>({
      columnDefs: [
        { field: 'name', headerName: 'Name', type: 'text', pinned: 'start' },
        { field: 'category', headerName: 'Category', type: 'text' },
        { field: 'amount', headerName: 'Amount', type: 'number' },
        { field: 'notes', headerName: 'Notes', type: 'text' },
      ],
      rowData: makeRows(20),
      getRowId: (r) => r.id,
    });
    await grid.ready;

    grid.api.setSortModel([{ colId: 'amount', sort: 'asc' }]);
    grid.api.setFilterModel({
      name: { filterType: 'text', type: 'contains', filter: 'Item' },
    });

    const { container } = render(
      <ERPTableHostProvider locale="en" theme={themeDefault}>
        <DesktopTable
          controller={grid.controller}
          tableKey={grid.tableKey}
          store={grid.store}
          ready
          session={grid.session}
          virtualization={false}
          tableHeight={480}
          floatingFilter
          footer
          pinnedTopRowData={[
            {
              id: 'top',
              name: 'Pinned',
              category: 'x',
              amount: 0,
              notes: '',
            },
          ]}
        />
      </ERPTableHostProvider>,
    );

    const gridEl = container.querySelector('[role="grid"]') as HTMLElement | null;
    expect(gridEl).toBeTruthy();
    await expectNoSeriousOrCritical(gridEl!, 'sorted+filtered+pinned grid');
  });

  it('grouped grid uses treegrid and has no serious|critical axe violations', async () => {
    const grid = createGrid<Row>({
      columnDefs: [
        { field: 'name', headerName: 'Name', type: 'text' },
        { field: 'category', headerName: 'Category', type: 'text' },
        {
          field: 'amount',
          headerName: 'Amount',
          type: 'number',
          aggFunc: 'sum',
        },
      ],
      rowData: makeRows(8),
      getRowId: (r) => r.id,
      groupBy: 'category',
      groupDefaultExpanded: true,
    });
    await grid.ready;

    const { container } = render(
      <ERPTableHostProvider locale="en" theme={themeDefault}>
        <DesktopTable
          controller={grid.controller}
          tableKey={grid.tableKey}
          store={grid.store}
          ready
          session={grid.session}
          virtualization={false}
          tableHeight={360}
          footer
        />
      </ERPTableHostProvider>,
    );

    const tree = container.querySelector('[role="treegrid"]') as HTMLElement | null;
    expect(tree).toBeTruthy();
    await waitFor(() => {
      expect(container.querySelector('[data-pdg-row-kind="group"]')).toBeTruthy();
    });
    expect(container.querySelector('tfoot')).toBeTruthy();
    await expectNoSeriousOrCritical(tree!, 'grouped treegrid');
  });

  it('column menu open has no serious|critical axe violations', async () => {
    const grid = createGrid<Row>({
      columnDefs: [
        { field: 'name', headerName: 'Name', type: 'text' },
        { field: 'amount', headerName: 'Amount', type: 'number' },
      ],
      rowData: makeRows(5),
      getRowId: (r) => r.id,
    });
    await grid.ready;

    const { container } = render(
      <ERPTableHostProvider locale="en" theme={themeDefault}>
        <DesktopTable
          controller={grid.controller}
          tableKey={grid.tableKey}
          store={grid.store}
          ready
          session={grid.session}
          virtualization={false}
          tableHeight={320}
        />
      </ERPTableHostProvider>,
    );

    const menuButtons = container.querySelectorAll(
      'button[aria-haspopup="menu"]',
    );
    expect(menuButtons.length).toBeGreaterThan(0);
    (menuButtons[0] as HTMLButtonElement).click();
    await Promise.resolve();

    const menu = document.querySelector('[role="menu"]');
    expect(menu).toBeTruthy();

    await expectNoSeriousOrCritical(menu as HTMLElement, 'column menu open');
  });

  it('canary: removing an accessible name is caught by axe (serious|critical)', async () => {
    const { container } = render(
      <div>
        <button type="button" />
      </div>,
    );
    const results = await axe.run(container);
    const bad = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(bad.length).toBeGreaterThan(0);
    expect(bad.some((v) => v.id.includes('button-name') || v.id.includes('name'))).toBe(
      true,
    );
  });

  it('grid exposes aria-rowcount / aria-colcount for 20 data rows', async () => {
    const grid = createGrid<Row>({
      columnDefs: [
        { field: 'name', headerName: 'Name', type: 'text' },
        { field: 'amount', headerName: 'Amount', type: 'number' },
      ],
      rowData: makeRows(20),
      getRowId: (r) => r.id,
    });
    await grid.ready;

    render(
      <ERPTableHostProvider locale="en" theme={themeDefault}>
        <DesktopTable
          controller={grid.controller}
          tableKey={grid.tableKey}
          store={grid.store}
          ready
          session={grid.session}
          virtualization={false}
          tableHeight={480}
        />
      </ERPTableHostProvider>,
    );

    const gridEl = screen.getByRole('grid');
    expect(Number(gridEl.getAttribute('aria-rowcount'))).toBeGreaterThanOrEqual(
      21,
    );
    expect(Number(gridEl.getAttribute('aria-colcount'))).toBeGreaterThanOrEqual(
      2,
    );
    expect(within(gridEl).getAllByRole('columnheader').length).toBeGreaterThan(
      0,
    );
  });
});
