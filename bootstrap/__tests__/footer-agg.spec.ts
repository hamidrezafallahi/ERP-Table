import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createGrid } from '../index';
import { resolveColumnAggSpecs } from '../../engine/dataOps/aggregation';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

type Row = { id: string; name: string; amount: number; qty: number };

describe('PR-119 footer aggregation', () => {
  it('avg column aggregates; column without aggFunc stays empty', async () => {
    const grid = createGrid<Row>({
      columnDefs: [
        { field: 'name', headerName: 'Name', type: 'text' },
        { field: 'amount', headerName: 'Amount', type: 'number', aggFunc: 'avg' },
        { field: 'qty', headerName: 'Qty', type: 'number' },
      ],
      rowData: [
        { id: '1', name: 'a', amount: 10, qty: 1 },
        { id: '2', name: 'b', amount: 30, qty: 2 },
      ],
      getRowId: (r) => r.id,
    });
    await grid.ready;
    const aggs = grid.controller.getColumnAggs();
    expect(aggs.amount).toBe(20);
    expect(aggs.qty).toBeUndefined();
    expect(aggs.name).toBeUndefined();
  });

  it('legacy price/number sum when no aggFunc declared', async () => {
    const grid = createGrid<Row>({
      columnDefs: [
        { field: 'amount', headerName: 'Amount', type: 'number' },
        { field: 'qty', headerName: 'Qty', type: 'number' },
      ],
      rowData: [
        { id: '1', name: 'a', amount: 10, qty: 1 },
        { id: '2', name: 'b', amount: 30, qty: 2 },
      ],
      getRowId: (r) => r.id,
    });
    await grid.ready;
    const totals = grid.controller.getColumnTotals();
    expect(totals.amount).toBe(40);
    expect(totals.qty).toBe(3);
  });

  it('resolveColumnAggSpecs prefers explicit aggFunc', () => {
    const specs = resolveColumnAggSpecs([
      { fieldName: 'a', fieldType: 'number', columnDef: { aggFunc: 'avg' } },
      { fieldName: 'b', fieldType: 'number' },
    ]);
    expect(specs).toEqual([{ colId: 'a', aggFunc: 'avg' }]);
  });

  it('footer UI reads aggFunc and footerRows', () => {
    const footer = load('ui/desktop/ERPTableFooter.tsx');
    expect(footer).toContain('footerRows');
    expect(footer).toContain('getColumnAggs');
    expect(footer).toContain('getColumnAggValue');
    expect(footer).not.toMatch(/fieldType === \"price\"/);
    expect(load('ui/index.tsx')).toContain('footerRows');
  });
});
