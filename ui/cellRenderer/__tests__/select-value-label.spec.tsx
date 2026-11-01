/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';

import type { ColumnSchema } from '../../../bootstrap/type';
import type { UITableController } from '../../../infrastructure/ui/UITableController';
import { ERPTableHostProvider } from '../../host/ERPTableHost';
import type { UIRow } from '../../type';
import { CellRenderer } from '..';

afterEach(cleanup);

/**
 * Host parity (newFront d5edc45de): a select cell whose stored value is not in
 * the loaded options shows its stored display label, not the raw id.
 */
function renderSelectCell(cell: { value: unknown; display: unknown }) {
  const request = vi.fn(async () => ({
    Data: [{ _SelectId: 1, _SelectValue: 'v1', _SelectDisplay: 'Alpha' }],
    ReturnCount: 1,
  }));
  const controller = {
    dispatch: vi.fn(),
    subscribe: () => () => undefined,
    getViewState: () => null,
    getCell: () => ({ getValue: () => cell.value, getDisplay: () => cell.display }),
    getEditDraft: () => undefined,
    isActiveCell: () => true,
    isEditingCell: () => true,
    isValidCell: () => undefined,
    getAllRows: () => [],
    startCellEdit: vi.fn(),
  } as unknown as UITableController;
  const meta = {
    fieldName: 'AccountId',
    fieldCaption: 'Account',
    fieldType: 'selectOption',
    visibility: { kind: 'always' },
    dynamicSource: { endpoint: '/accounts' },
  } as unknown as ColumnSchema;
  const row = { id: 1, rowState: 'Unchanged', visibilityCondition: {}, cells: {} } as unknown as UIRow;
  const view = render(
    <ERPTableHostProvider locale="en" remoteApi={{ request } as never}>
      <CellRenderer
        tableKey="t"
        row={row}
        columnId="AccountId"
        idx={0}
        meta={meta}
        controller={controller}
        tabIndex={0}
      />
    </ERPTableHostProvider>,
  );
  return { request, view };
}

const selectedText = (container: HTMLElement) =>
  container.querySelector('.ant-select-selection-item')?.textContent;

describe('CellRenderer selectOption valueLabel', () => {
  it('shows the stored display for a value missing from the loaded options', async () => {
    const { request, view } = renderSelectCell({ value: 77, display: 'Stored label' });
    await waitFor(() => expect(request).toHaveBeenCalled());
    await waitFor(() => expect(selectedText(view.container)).toBe('Stored label'));
  });

  it('prefers the loaded option label when the value is in the options', async () => {
    const { view } = renderSelectCell({ value: 1, display: 'Old label' });
    await waitFor(() => expect(selectedText(view.container)).toBe('Alpha'));
  });
});
