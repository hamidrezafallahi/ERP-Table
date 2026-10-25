/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';

import { DataGrid } from '../../index';
import { ERPTableHostProvider } from '../../host/ERPTableHost';
import {
  useHostDependOn,
  type UseDependOnHook,
} from '../../host/dependOn';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

type Row = { id: string; name: string };

const hostHook = (tag: string): UseDependOnHook => (dependOn) => {
  const list = Array.isArray(dependOn) ? dependOn : dependOn ? [dependOn] : [];
  const names = list.map((i) => (typeof i === 'string' ? i : i.fieldName));
  return {
    dependencyBody: Object.fromEntries(names.map((n) => [n, `${tag}:${n}`])),
    isReady: true,
    dependencyKey: tag,
  };
};

let seen: string | null = null;

function Probe() {
  const { dependencyBody } = useHostDependOn([{ fieldName: 'YearId' }], {
    enabled: true,
  });
  seen = JSON.stringify(dependencyBody);
  return <div data-testid="probe" />;
}

// No rows -> the no-rows overlay renders inside the grid's own provider.
const grid = (useDependOn?: UseDependOnHook) => (
  <DataGrid<Row>
    columnDefs={[{ field: 'name', headerName: 'Name', type: 'text' }]}
    rowData={[]}
    getRowId={(r) => r.id}
    noRowsOverlayComponent={() => <Probe />}
    useDependOn={useDependOn}
  />
);

describe('DataGrid host useDependOn', () => {
  beforeEach(() => {
    seen = null;
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
    Object.defineProperty(window, 'ResizeObserver', {
      writable: true,
      configurable: true,
      value: RO,
    });
  });
  afterEach(cleanup);

  it('uses the useDependOn prop', async () => {
    render(grid(hostHook('prop')));
    await waitFor(() => expect(seen).toBe('{"YearId":"prop:YearId"}'));
  });

  it('inherits useDependOn from an outer ERPTableHostProvider', async () => {
    render(
      <ERPTableHostProvider useDependOn={hostHook('outer')}>
        {grid()}
      </ERPTableHostProvider>,
    );
    await waitFor(() => expect(seen).toBe('{"YearId":"outer:YearId"}'));
  });

  it('explicit prop beats the outer provider', async () => {
    render(
      <ERPTableHostProvider useDependOn={hostHook('outer')}>
        {grid(hostHook('prop'))}
      </ERPTableHostProvider>,
    );
    await waitFor(() => expect(seen).toBe('{"YearId":"prop:YearId"}'));
  });

  it('falls back to static values when no hook is installed', async () => {
    render(grid());
    await waitFor(() => expect(seen).not.toBeNull());
    // JSON drops the undefined static value: nothing resolvable, no host hook.
    expect(seen).toBe('{}');
  });
});
