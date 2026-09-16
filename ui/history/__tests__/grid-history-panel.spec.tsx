/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createGrid } from '../../../bootstrap';
import { ERPTableHostProvider } from '../../host/ERPTableHost';
import { themeDefault } from '../../theme';
import { GridHistoryPanel } from '../GridHistoryPanel';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

type Row = { id: string; name: string; qty: number };

describe('PR-136 GridHistoryPanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows cell edits, filters, jumps, and restores previous value', async () => {
    const grid = createGrid<Row>({
      columnDefs: [
        { field: 'name', headerName: 'Name', editable: true },
        { field: 'qty', headerName: 'Qty', type: 'number', editable: true },
      ],
      rowData: [
        { id: '1', name: 'alpha', qty: 1 },
        { id: '2', name: 'beta', qty: 2 },
      ],
      getRowId: (r) => r.id,
      actor: { userId: 'tester', roles: ['admin'] },
    });
    await grid.ready;
    const controller = grid.controller;
    const rowId = controller.getAllRows()![0]!.id.value;

    await act(async () => {
      await controller.dispatch({
        type: 'UI_CELL_CHANGE',
        rowId,
        columnId: 'name',
        value: 'alpha-edited',
      });
    });

    const { container } = render(
      <ERPTableHostProvider locale="en" theme={themeDefault}>
        <div
          data-erp-table-scroll=""
          data-erp-table-key={grid.tableKey}
          data-erp-virtualization="off"
        />
        <GridHistoryPanel controller={controller} />
      </ERPTableHostProvider>,
    );

    await waitFor(() => {
      expect(
        container.querySelector('[data-pdg-history-list]'),
      ).toBeTruthy();
    });

    const jump = container.querySelector(
      '[data-pdg-history-type="CELL_CHANGED"] [data-pdg-history-jump]',
    ) as HTMLButtonElement;
    expect(jump).toBeTruthy();
    expect(jump.textContent).toMatch(/Cell changed/i);

    const restore = container.querySelector(
      '[data-pdg-history-restore]',
    ) as HTMLButtonElement;
    expect(restore).toBeTruthy();
    await act(async () => {
      fireEvent.click(restore);
    });
    await waitFor(() => {
      expect(controller.getCell(rowId, 'name')?.getValue()).toBe('alpha');
    });

    fireEvent.click(jump);
    await waitFor(() => {
      expect(controller.getActiveCell()?.columnId).toBe('name');
      expect(controller.getActiveCell()?.rowId).toBe(rowId);
    });

    const severity = container.querySelector(
      '[data-pdg-history-severity]',
    ) as HTMLSelectElement;
    fireEvent.change(severity, { target: { value: 'error' } });
    await waitFor(() => {
      expect(
        container.querySelector('[data-pdg-history-empty]'),
      ).toBeTruthy();
    });
  });
});
