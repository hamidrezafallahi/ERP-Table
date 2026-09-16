import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createGrid } from '../../../bootstrap';
import { ERPTableGroupRow } from '../ERPTableGroupRow';
import type { UIRow } from '../../type';
import type { UITableController } from '../../../infrastructure/ui/UITableController';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

type Row = {
  id: string;
  category: string;
  name: string;
  amount: number;
};

describe('PR-121 group row UI', () => {
  it('renders chevron, aria-expanded, and aria-level', () => {
    const row: UIRow = {
      id: -42,
      cells: {
        category: { value: 'food', originalValue: 'food', display: 'food' },
        amount: { value: 30, originalValue: 30, display: 30 },
      },
      rowState: 'None' as UIRow['rowState'],
      isExpanded: true,
      changeFields: [],
      visibilityCondition: {},
      rowKind: 'group',
      groupField: 'category',
      groupKey: 'food',
      groupChildCount: 2,
      groupExpanded: true,
    };
    const controller = {
      toggleRowGroup: () => undefined,
      onRowClick: () => undefined,
      onRowSelect: () => undefined,
      getViewState: () => undefined,
    } as unknown as UITableController;

    const html = renderToStaticMarkup(
      <ERPTableGroupRow
        row={row}
        index={0}
        table={{
          columns: [
            {
              fieldName: 'category',
              fieldCaption: 'Cat',
              fieldType: 'text',
              order: 0,
            },
            {
              fieldName: 'amount',
              fieldCaption: 'Amount',
              fieldType: 'number',
              order: 1,
            },
          ],
          columnWidths: {},
          activeCell: null,
        }}
        controller={controller}
        tableKey="t"
        isSelected={false}
        isActive={false}
      />,
    );

    expect(html).toContain('data-pdg-row-kind="group"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-level="1"');
    expect(html).toContain('pdg-group-row__chevron');
    expect(html).toContain('food');
    expect(html).toContain('30');
  });

  it('wires keyboard left/right and selection of children', async () => {
    expect(load('infrastructure/ui/UITableKeyboardHandler.ts')).toContain(
      'toggleRowGroupById',
    );
    expect(load('engine/managers/SelectionManager.ts')).toContain(
      'getGroupChildren',
    );
    expect(load('ui/desktop/ERPTableVirtualBody.tsx')).toContain(
      'ERPTableGroupRow',
    );
    expect(load('ui/desktop/ERPTableBody.tsx')).toContain('React.lazy');
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('treegrid');
    expect(load('ui/desktop/ERPTableGroupRow.tsx')).toContain('pdg-group-row');
    expect(load('ui/desktop/ERPTableGroupRow.tsx')).toContain(
      'pdg-group-row__chevron',
    );

    const grid = createGrid<Row>({
      columnDefs: [
        { field: 'category', headerName: 'Cat', type: 'text' },
        { field: 'name', headerName: 'Name', type: 'text' },
        { field: 'amount', headerName: 'Amount', type: 'number', aggFunc: 'sum' },
      ],
      rowData: [
        { id: '1', category: 'a', name: 'x', amount: 1 },
        { id: '2', category: 'a', name: 'y', amount: 2 },
        { id: '3', category: 'b', name: 'z', amount: 3 },
      ],
      getRowId: (r) => r.id,
      groupBy: 'category',
      groupDefaultExpanded: false,
    });
    await grid.ready;

    const groupA = grid.engine.getAllUIRows()!.find(
      (r) => r.rowKind === 'group' && r.groupKey === 'a',
    )!;
    expect(groupA.groupExpanded).toBe(false);

    grid.engine.toggleRowGroupById(groupA.id);
    expect(
      grid.engine.getRowView(groupA.id)?.groupExpanded,
    ).toBe(true);

    grid.controller.onRowSelect(groupA.id);
    const selected = grid.controller.getViewState()?.selectedRows ?? {};
    expect(selected[groupA.id]).toBe(true);
    const children = grid.engine.getGroupNode(groupA.id)!.childRowIds;
    for (const id of children) {
      expect(selected[id]).toBe(true);
    }
  });
});
