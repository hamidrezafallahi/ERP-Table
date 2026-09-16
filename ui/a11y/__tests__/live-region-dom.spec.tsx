/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';

import { createGrid } from '../../../bootstrap';
import { ERPTableHostProvider } from '../../host/ERPTableHost';
import { themeDefault } from '../../theme';
import { DesktopTable } from '../../desktop/DesktopTable';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

type Row = { id: string; name: string; amount: number };

function stubMatchMedia(): void {
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

describe('PR-125 GridLiveRegion DOM', () => {
  beforeEach(() => {
    stubMatchMedia();
    stubResizeObserver();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('updates live region text when sort model changes', async () => {
    const grid = createGrid<Row>({
      columnDefs: [
        { field: 'name', headerName: 'Name', type: 'text' },
        { field: 'amount', headerName: 'Amount', type: 'number' },
      ],
      rowData: [
        { id: '1', name: 'A', amount: 2 },
        { id: '2', name: 'B', amount: 1 },
      ],
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
          tableHeight={280}
        />
      </ERPTableHostProvider>,
    );

    const live = container.querySelector(
      '[data-pdg-live-region]',
    ) as HTMLElement;
    expect(live).toBeTruthy();
    expect(live.getAttribute('aria-live')).toBe('polite');
    expect(live.textContent).toBe('');

    grid.api.setSortModel([{ colId: 'amount', sort: 'asc' }]);

    await waitFor(() => {
      expect(live.textContent).toContain('Sorted by Amount ascending');
    });

    grid.api.setSortModel([{ colId: 'amount', sort: 'desc' }]);
    await waitFor(() => {
      expect(live.textContent).toContain('Sorted by Amount descending');
    });
  });
});
