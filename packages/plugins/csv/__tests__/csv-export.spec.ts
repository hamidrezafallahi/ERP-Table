import { describe, expect, it } from 'vitest';

import type { ExportSource } from '../../../../application/plugins/GridPlugin';
import { buildCsvText, buildCsvBlob } from '../src/buildCsv';
import { buildExportTable } from '../../excel/src/buildExportTable';
import { buildXlsxBlob } from '../../excel/src/buildXlsxBlob';
import { createGrid } from '../../../../bootstrap';

const groupedSource: ExportSource = {
  columns: [
    { fieldName: 'category', fieldCaption: 'Cat', fieldType: 'text', order: 1 },
    { fieldName: 'amount', fieldCaption: 'Amount', fieldType: 'number', order: 2 },
  ],
  rows: [
    {
      id: -1,
      rowState: 'None',
      kind: 'group',
      groupKey: 'food',
      outlineLevel: 0,
      cells: {
        category: { value: 'food', display: 'food' },
        amount: { value: 30, display: 30 },
      },
    },
    {
      id: 1,
      rowState: 'None',
      kind: 'leaf',
      outlineLevel: 1,
      cells: {
        category: { value: 'food', display: 'food' },
        amount: { value: 10, display: 10 },
      },
    },
    {
      id: 2,
      rowState: 'None',
      kind: 'leaf',
      outlineLevel: 1,
      cells: {
        category: { value: 'food', display: 'food' },
        amount: { value: 20, display: 20 },
      },
    },
  ],
};

describe('PR-122 export groups + CSV', () => {
  it('buildCsvText includes a Group column for group rows', () => {
    const csv = buildCsvText(groupedSource);
    expect(csv).toContain('Group');
    expect(csv).toContain('food');
    expect(csv.split('\n')).toHaveLength(4);
  });

  it('buildCsvBlob has UTF-8 BOM', async () => {
    const blob = buildCsvBlob(groupedSource);
    const buf = new Uint8Array(await blob.arrayBuffer());
    expect(buf[0]).toBe(0xef);
    expect(buf[1]).toBe(0xbb);
    expect(buf[2]).toBe(0xbf);
  });

  it('Excel sheet XML carries outlineLevel for groups', async () => {
    const table = buildExportTable(groupedSource);
    expect(table.rowKinds?.[0]).toBe('group');
    expect(table.outlineLevels?.[0]).toBe(0);
    expect(table.outlineLevels?.[1]).toBe(1);
    const blob = buildXlsxBlob(table);
    const zip = await blob.arrayBuffer();
    const text = new TextDecoder().decode(zip);
    expect(text).toContain('outlineLevel="0"');
    expect(text).toContain('outlineLevel="1"');
  });

  it('createGrid getExportSource projects group rows', async () => {
    const grid = createGrid({
      columnDefs: [
        { field: 'category', headerName: 'Cat', type: 'text' as const },
        {
          field: 'amount',
          headerName: 'Amount',
          type: 'number' as const,
          aggFunc: 'sum' as const,
        },
      ],
      rowData: [
        { id: '1', category: 'a', amount: 1 },
        { id: '2', category: 'a', amount: 2 },
        { id: '3', category: 'b', amount: 3 },
      ],
      getRowId: (r: { id: string }) => r.id,
      groupBy: 'category',
      groupDefaultExpanded: true,
    });
    await grid.ready;
    const { createEngineGridQuery } = await import(
      '../../../../application/plugins/createEngineGridQuery'
    );
    const exportSource = createEngineGridQuery(grid.engine).getExportSource();
    expect(exportSource).toBeTruthy();
    expect(exportSource!.rows.some((r) => r.kind === 'group')).toBe(true);
    expect(exportSource!.rows.filter((r) => r.kind === 'leaf')).toHaveLength(3);
  });
});
