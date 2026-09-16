import { describe, expect, it } from 'vitest';

import type { ColumnSchema } from '../../domain/types/ColumnSchema';
import {
  canSetColumnVisible,
  isColumnShowForbidden,
} from '../dataOps/columnVisibility';
import { createGrid } from '../../bootstrap';
import { ariaColIndex } from '../../ui/a11y/gridRoles';

function schema(
  fieldName: string,
  opts: Partial<ColumnSchema> = {},
): ColumnSchema {
  return {
    fieldName,
    fieldCaption: fieldName,
    fieldType: fieldName === 'index' ? 'index' : 'text',
    visibility: { kind: 'always' },
    ...opts,
  };
}

describe('PR-111 column visibility (pure)', () => {
  it('forbids showing visibility.kind=never columns', () => {
    const col = schema('secret', { visibility: { kind: 'never' }, hidden: true });
    expect(isColumnShowForbidden(col)).toBe(true);
    expect(canSetColumnVisible(col, true)).toEqual({
      ok: false,
      reason: 'forbidden',
    });
    expect(canSetColumnVisible(col, false).ok).toBe(false);
  });

  it('allows toggling hide on always-visible columns', () => {
    const col = schema('name', { hidden: false });
    expect(canSetColumnVisible(col, false)).toEqual({
      ok: true,
      hidden: true,
    });
    expect(canSetColumnVisible({ ...col, hidden: true }, true)).toEqual({
      ok: true,
      hidden: false,
    });
  });

  it('refuses to hide the index column', () => {
    const col = schema('index');
    expect(canSetColumnVisible(col, false)).toEqual({
      ok: false,
      reason: 'index',
    });
  });
});

describe('PR-111 setColumnVisible runtime', () => {
  it('hides a column and keeps ARIA col indices contiguous for visible cols', async () => {
    const grid = createGrid({
      columnDefs: [
        { field: 'name', headerName: 'Name' },
        { field: 'amount', headerName: 'Amount' },
        { field: 'note', headerName: 'Note' },
      ],
      rowData: [{ name: 'a', amount: 1, note: 'x' }],
    });
    const { engine, api } = await grid.ready;

    api.setColumnVisible('amount', false);

    const view = engine.getViewState();
    expect(view?.columns.find((c) => c.fieldName === 'amount')?.hidden).toBe(
      true,
    );
    const visible = (view?.columns ?? []).filter((c) => !c.hidden);
    expect(visible.map((c) => c.fieldName)).not.toContain('amount');
    expect(visible.map((c) => c.fieldName)).toEqual(
      expect.arrayContaining(['name', 'note']),
    );
    visible.forEach((_, i) => {
      expect(ariaColIndex(i)).toBe(i + 1);
    });
    expect(api.getColumnState().find((c) => c.colId === 'amount')?.hide).toBe(
      true,
    );
  });

  it('does not show a domain visibility=never column (RBAC)', async () => {
    const grid = createGrid({
      columns: [
        {
          fieldName: 'index',
          fieldCaption: '#',
          fieldType: 'index',
          visibility: { kind: 'always' },
        },
        {
          fieldName: 'secret',
          fieldCaption: 'Secret',
          fieldType: 'text',
          visibility: { kind: 'never' },
          hidden: true,
        },
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          visibility: { kind: 'always' },
        },
      ],
      rows: [{ values: { name: 'a', secret: 'nope' } }],
    });
    const { engine, api } = await grid.ready;

    api.setColumnVisible('secret', true);
    const secret = engine
      .getViewState()
      ?.columns.find((c) => c.fieldName === 'secret');
    expect(secret?.hidden).toBe(true);
  });

  it('applyColumnState.hide toggles visibility', async () => {
    const grid = createGrid({
      columnDefs: [
        { field: 'name', headerName: 'Name' },
        { field: 'amount', headerName: 'Amount' },
      ],
      rowData: [{ name: 'a', amount: 1 }],
    });
    const { api } = await grid.ready;

    await api.applyColumnState([
      { colId: 'name', width: 120, hide: true, order: 0 },
      { colId: 'amount', width: 120, hide: false, order: 1 },
    ]);
    expect(api.getColumnState().find((c) => c.colId === 'name')?.hide).toBe(
      true,
    );
    expect(api.getColumnState().find((c) => c.colId === 'amount')?.hide).toBe(
      false,
    );
  });

  it('columnDefs.hide is applied at create', async () => {
    const grid = createGrid({
      columnDefs: [
        { field: 'name', headerName: 'Name' },
        { field: 'amount', headerName: 'Amount', hide: true },
      ],
      rowData: [{ name: 'a', amount: 1 }],
    });
    const { api } = await grid.ready;
    expect(api.getColumnState().find((c) => c.colId === 'amount')?.hide).toBe(
      true,
    );
  });
});
