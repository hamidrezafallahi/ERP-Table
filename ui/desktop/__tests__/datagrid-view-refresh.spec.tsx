/**
 * @vitest-environment jsdom
 */
// <DataGrid rowData> keeps grid edits when the host re-renders with inline
// `getRowId`, and the virtual body follows a filter / sort right away (no
// scroll needed). Regressions found by the Playwright clipboard / filter specs.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import React, { useState } from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';

import { DataGrid } from '../../index';
import type { ColumnDef } from '../../../domain/types/ColumnDef';
import type { UITableController } from '../../../infrastructure/ui/UITableController';
import type { GridApi } from '../../../infrastructure/ui/createGridApi';

type Line = { id: string; item: string; price: number; category: string };

const CATEGORIES = ['Parts', 'Labor', 'Freight'];
const LINES: Line[] = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  item: `Item ${i + 1}`,
  price: ((i * 137) % 900) * 1000,
  category: CATEGORIES[i % 3]!,
}));

const DEFS: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'Item', editable: true },
  { field: 'price', headerName: 'Price', type: 'number', sortable: true },
  { field: 'category', headerName: 'Category', filter: 'text' },
];

/** Distinct body rows currently mounted by the (virtual) body. */
const mountedRows = (root: HTMLElement) =>
  new Set(
    [...root.querySelectorAll('[data-pdg-row-index]')].map((el) =>
      el.getAttribute('data-pdg-row-index'),
    ),
  ).size;

/** Host that re-renders after every cell change, with an inline getRowId. */
function Host(props: {
  onReady: (c: UITableController) => void;
  onApi: (api: GridApi<Line>) => void;
  onRender: () => void;
}) {
  const [, setTick] = useState(0);
  props.onRender();
  return (
    <DataGrid<Line>
      rowData={LINES}
      columnDefs={DEFS}
      getRowId={(row) => row.id}
      tableHeight={360}
      onCellValueChanged={() => setTick((t) => t + 1)}
      onReady={props.onReady}
      onGridReady={({ api }) => props.onApi(api)}
    />
  );
}

async function mount() {
  let controller: UITableController | null = null;
  let api: GridApi<Line> | null = null;
  let renders = 0;
  const view = render(
    <Host
      onReady={(c) => {
        controller = c;
      }}
      onApi={(a) => {
        api = a;
      }}
      onRender={() => {
        renders += 1;
      }}
    />,
  );
  await waitFor(() => expect(controller && api).toBeTruthy());
  await waitFor(() => expect(mountedRows(view.container)).toBeGreaterThan(0));
  return {
    ...view,
    controller: controller!,
    api: api!,
    renders: () => renders,
  };
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('min-width'),
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
  class RO {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  Object.defineProperty(window, 'ResizeObserver', { writable: true, configurable: true, value: RO });
});
afterEach(cleanup);

describe('DataGrid rowData + inline getRowId', () => {
  it('an edit survives the host re-render it triggers', async () => {
    const { controller, renders } = await mount();
    const rowId = controller.getAllUIRows()[3]!.id;
    const before = renders();

    await act(async () => {
      await controller.dispatch({ type: 'UI_CELL_CHANGE', rowId, columnId: 'item', value: 'Typed' });
    });

    await waitFor(() => expect(renders()).toBeGreaterThan(before));
    expect(controller.getCell(rowId, 'item')?.getValue()).toBe('Typed');
  });
});

describe('virtual body follows the view query without a scroll', () => {
  it('a filter shrinks the mounted rows to the matches', async () => {
    const { container, controller, api } = await mount();
    expect(controller.getAllUIRows()).toHaveLength(20);
    const before = mountedRows(container);

    await act(async () => {
      api.setFilterModel({ category: { filterType: 'text', type: 'contains', filter: 'Parts' } });
    });

    expect(controller.getAllUIRows()).toHaveLength(7);
    await waitFor(() => expect(mountedRows(container)).toBe(Math.min(7, before)));
  });

  it('a sort re-renders the mounted rows in the new order', async () => {
    const { container, controller, api } = await mount();
    /** Text of the first mounted body row. */
    const topRowText = () =>
      [...container.querySelectorAll('[data-pdg-row-index="0"]')]
        .map((el) => el.textContent?.trim() ?? '')
        .join('|');
    expect(topRowText()).toContain('Item 1');

    await act(async () => {
      api.setSortModel([{ colId: 'price', sort: 'desc' }]);
    });

    const topId = controller.getAllUIRows()[0]!.id;
    const topItem = String(controller.getCell(topId, 'item')?.getValue());
    expect(topItem).not.toBe('Item 1');
    await waitFor(() => expect(topRowText()).toContain(topItem));
  });
});
