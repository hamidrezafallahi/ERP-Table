/**
 * @vitest-environment jsdom
 */
// <DataGrid> as the arianERP (newFront) page uses it: every grid option is
// honoured, the window key listener never takes keys typed elsewhere on the
// page, text keys inside a cell editor stay native, Tab works from any cell,
// and a deferred edit is committed when focus leaves the grid.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';

import '../../../infrastructure/Repositories/paged/__tests__/fakeIndexedDb';
import { DataGrid, type DataGridProps } from '../../index';
import type { ColumnSchema, RowInput } from '../../../bootstrap/type';
import type { UITableController } from '../../../infrastructure/ui/UITableController';
import { RowStateEnum } from '../../../domain/value-objects';

const COLUMNS: ColumnSchema[] = [
  { fieldName: 'index', fieldCaption: '#', fieldType: 'index', editable: false, visibility: { kind: 'always' } },
  { fieldName: 'Title', fieldCaption: 'Title', fieldType: 'text', visibility: { kind: 'always' } },
  { fieldName: 'Note', fieldCaption: 'Note', fieldType: 'text', visibility: { kind: 'always' } },
];

const ROWS: RowInput[] = [1, 2].map((id) => ({
  id,
  values: { index: id, Title: `row ${id}`, Note: `note ${id}`, RowState: RowStateEnum.Unchanged },
}));

let keySeq = 0;

async function mount(props: Partial<DataGridProps> = {}) {
  keySeq += 1;
  const tableKey = `dom-parity-${keySeq}`;
  let controller: UITableController | null = null;
  const view = render(
    <div>
      <input data-testid="page-input" defaultValue="header field" />
      <DataGrid
        // paged-idb needs a store; the event-sourced grid stays in memory here.
        store={props.persistence === 'paged-idb' ? 'domParity' : undefined}
        tableKey={tableKey}
        columns={COLUMNS}
        rows={ROWS}
        recordPerPage={10}
        onReady={(c) => {
          controller = c;
        }}
        {...props}
      />
    </div>,
  );
  await waitFor(() => expect(controller).not.toBeNull());
  return { ...view, tableKey, controller: controller! };
}

const cellEl = (tableKey: string, rowId: number, columnId: string) =>
  document.getElementById(`erp-cell-${tableKey}-${rowId}-${columnId}`)!;

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

describe('DataGrid forwards every grid option', () => {
  it("persistence='paged-idb' reaches createGrid (page window + immediate commit)", async () => {
    const { controller } = await mount({ persistence: 'paged-idb' });
    expect(controller.isPagedWindow()).toBe(true);

    await controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });
    await controller.dispatch({ type: 'UI_CELL_CHANGE', rowId: 1, columnId: 'Title', value: 'typed' });
    expect(controller.getRowView(1)?.cells.Title?.value).toBe('typed');
  });

  it('enterNavigation reaches the keyboard handler', async () => {
    const { controller, tableKey } = await mount({ enterNavigation: 'down' });
    await controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });
    await waitFor(() =>
      expect(cellEl(tableKey, 1, 'Title').querySelector('input')).not.toBeNull(),
    );
    fireEvent.keyDown(cellEl(tableKey, 1, 'Title').querySelector('input')!, { key: 'Enter', code: 'Enter' });
    await waitFor(() => expect(controller.getActiveCell()).toEqual({ rowId: 2, columnId: 'Title' }));
  });
});

describe('window key listener scope', () => {
  it('keys typed in a page control are never taken by the grid', async () => {
    const { controller, getByTestId } = await mount({ persistence: 'paged-idb' });
    await controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });
    const input = getByTestId('page-input');
    input.focus();

    for (const [key, code, ctrlKey] of [
      ['c', 'KeyC', true],
      ['v', 'KeyV', true],
      ['a', 'KeyA', true],
      ['z', 'KeyZ', true],
      ['Home', 'Home', false],
      ['Enter', 'Enter', false],
      ['ArrowLeft', 'ArrowLeft', false],
      ['Tab', 'Tab', false],
    ] as const) {
      const notPrevented = fireEvent.keyDown(input, { key, code, ctrlKey });
      expect({ key, prevented: !notPrevented }).toEqual({ key, prevented: false });
    }
    await new Promise((r) => setTimeout(r, 0));
    expect(controller.getActiveCell()).toEqual({ rowId: 1, columnId: 'Title' });
  });

  it('legacy global chords (Alt+N) still work from a page control', async () => {
    const { controller, getByTestId } = await mount({ persistence: 'paged-idb' });
    const before = controller.getViewState()!.pagination.totalRows;
    const input = getByTestId('page-input');
    input.focus();
    const notPrevented = fireEvent.keyDown(input, { key: 'n', code: 'KeyN', altKey: true });
    expect(notPrevented).toBe(false);
    await waitFor(() => expect(controller.getViewState()!.pagination.totalRows).toBe(before + 1));
  });

  it('AltGr (Ctrl+Alt) is typing, not a grid chord', async () => {
    const { getByTestId } = await mount();
    const input = getByTestId('page-input');
    input.focus();
    const event = new KeyboardEvent('keydown', {
      key: 'n',
      code: 'KeyN',
      altKey: true,
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'getModifierState', {
      value: (k: string) => k === 'AltGraph',
    });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});

describe('inside a cell', () => {
  it('text keys stay with the editor; arrows still move the active cell', async () => {
    const { controller, tableKey } = await mount({ persistence: 'paged-idb' });
    await controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });
    await waitFor(() =>
      expect(cellEl(tableKey, 1, 'Title').querySelector('input')).not.toBeNull(),
    );
    const editor = cellEl(tableKey, 1, 'Title').querySelector('input')!;
    editor.focus();

    for (const [key, code, ctrlKey] of [
      ['a', 'KeyA', true],
      ['c', 'KeyC', true],
      ['x', 'KeyX', true],
      ['v', 'KeyV', true],
      ['z', 'KeyZ', true],
      ['y', 'KeyY', true],
      ['Home', 'Home', false],
      ['End', 'End', false],
    ] as const) {
      const notPrevented = fireEvent.keyDown(editor, { key, code, ctrlKey });
      expect({ key, prevented: !notPrevented }).toEqual({ key, prevented: false });
    }

    const notPrevented = fireEvent.keyDown(editor, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(notPrevented).toBe(false);
    await waitFor(() => expect(controller.getActiveCell()).toEqual({ rowId: 1, columnId: 'Note' }));
  });

  it('Tab moves from a cell element that is not a text editor', async () => {
    const { controller, tableKey } = await mount({ persistence: 'paged-idb', singleClickEdit: false });
    await controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });
    const button = await waitFor(() => {
      const el = cellEl(tableKey, 1, 'Title').querySelector('button');
      expect(el).not.toBeNull();
      return el!;
    });
    button.focus();
    const notPrevented = fireEvent.keyDown(button, { key: 'Tab', code: 'Tab' });
    expect(notPrevented).toBe(false);
    await waitFor(() => expect(controller.getActiveCell()).toEqual({ rowId: 1, columnId: 'Note' }));
  });
});

describe('stopEditingWhenCellsLoseFocus (deferred commit)', () => {
  it('focus moving to a page control commits the draft', async () => {
    const { controller, getByTestId } = await mount();
    await controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });
    await controller.dispatch({ type: 'UI_CELL_CHANGE', rowId: 1, columnId: 'Title', value: 'draft' });
    expect(controller.isEditingCell(1, 'Title')).toBe(true);
    expect(controller.getRowView(1)?.cells.Title?.value).toBe('row 1');

    getByTestId('page-input').focus();
    await waitFor(() => expect(controller.getRowView(1)?.cells.Title?.value).toBe('draft'));
    expect(controller.isEditingCell(1, 'Title')).toBe(false);
  });

  it('focus moving inside the grid keeps the edit open', async () => {
    const { controller, tableKey } = await mount();
    await controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });
    await controller.dispatch({ type: 'UI_CELL_CHANGE', rowId: 1, columnId: 'Title', value: 'draft' });
    const table = cellEl(tableKey, 1, 'Title').closest('table')!;
    table.focus();
    await new Promise((r) => setTimeout(r, 10));
    expect(controller.isEditingCell(1, 'Title')).toBe(true);
  });
});

describe('render stability', () => {
  it('leaving edit mode does not start an endless re-render loop', async () => {
    const { controller, tableKey } = await mount();
    await controller.dispatch({ type: 'UI_ACTIVE_CELL', rowId: 1, columnId: 'Title' });
    await waitFor(() =>
      expect(cellEl(tableKey, 1, 'Title').querySelector('input')).not.toBeNull(),
    );
    let renders = 0;
    const getViewState = controller.getViewState.bind(controller);
    controller.getViewState = () => {
      renders += 1;
      return getViewState();
    };
    // Escape (through React's act) ends the edit; it used to never settle.
    fireEvent.keyDown(cellEl(tableKey, 1, 'Title').querySelector('input')!, {
      key: 'Escape',
      code: 'Escape',
    });
    await new Promise((r) => setTimeout(r, 150));
    const settled = renders;
    await new Promise((r) => setTimeout(r, 300));
    expect(renders).toBe(settled);
  });
});

describe('paged-idb header', () => {
  it('offers no page-local sort / filter unless the column opts in', async () => {
    const { container } = await mount({
      persistence: 'paged-idb',
      columns: [
        ...COLUMNS.slice(0, 2),
        { ...COLUMNS[2]!, columnDef: { sortable: true } },
      ],
    });
    await waitFor(() => expect(container.querySelector('th[data-pdg-sortable]')).not.toBeNull());
    const sortable = Array.from(container.querySelectorAll('th[data-pdg-sortable="true"]'));
    expect(sortable).toHaveLength(1);
    expect(container.querySelector('th[data-pdg-filterable="true"]')).toBeNull();
  });

  it('the event-sourced grid keeps header sort', async () => {
    const { container } = await mount();
    await waitFor(() =>
      expect(container.querySelectorAll('th[data-pdg-sortable="true"]').length).toBe(2),
    );
  });
});
