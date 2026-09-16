import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_MEMORY_STORE } from '../defaults';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

const sampleConfig = {
  columnDefs: [{ field: 'name', headerName: 'Name', type: 'text' as const }],
  rowData: [{ name: 'alpha' }],
};

describe('PR-84 createGrid is sync (D24)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns immediately without await and is renderable', async () => {
    const open = vi.fn(() => {
      throw new Error('indexedDB.open must not run without store');
    });
    vi.stubGlobal('indexedDB', { open });

    const { createGrid } = await import('../index');
    const grid = createGrid(sampleConfig);

    expect(grid).not.toBeInstanceOf(Promise);
    expect('then' in grid).toBe(false);
    expect(grid.ready).toBeInstanceOf(Promise);
    expect(grid.store).toBe(DEFAULT_MEMORY_STORE);
    expect(grid.tableKey.startsWith('pdg-')).toBe(true);

    const html = renderToStaticMarkup(
      React.createElement('div', { 'data-table-key': grid.tableKey }, grid.store),
    );
    expect(html).toContain(grid.tableKey);
    expect(html).toContain(DEFAULT_MEMORY_STORE);
    expect(open).not.toHaveBeenCalled();

    const hydrated = await grid.ready;
    expect(hydrated).toBe(grid);
    expect(grid.engine).toBeDefined();
    expect(grid.controller.getViewState()).toBeTruthy();
    expect(grid.table.getRows()[0]?.getCell('name')?.getValue()).toBe('alpha');
  });

  it('deprecated createERPTable still hydrates (both paths work)', async () => {
    const { createGrid, createERPTable } = await import('../index');
    expect(createGrid).not.toBe(createERPTable);

    const viaAlias = await createERPTable(sampleConfig);
    expect(viaAlias.engine).toBeDefined();
    expect(viaAlias.ready).toBeInstanceOf(Promise);
    await viaAlias.ready;
    expect(viaAlias.table.getRows()).toHaveLength(1);

    const viaGrid = createGrid(sampleConfig);
    await viaGrid.ready;
    expect(viaGrid.table.getRows()).toHaveLength(1);
  });

  it('createERPTable(cfg) is createGrid(cfg).ready', async () => {
    const { createGrid, createERPTable } = await import('../index');
    const source = createERPTable.toString();
    expect(source).toContain('createGrid');
    expect(source).toContain('.ready');
    expect(createGrid.toString()).not.toMatch(/^\s*async /);
  });
});
