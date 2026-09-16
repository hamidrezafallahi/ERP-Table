import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { buildColumnWindowModel } from '../../virtual/columnWindow';
import type { ColumnSchema } from '../../../bootstrap/type';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-110 column pin UI', () => {
  it('wires three-zone ColumnWindowCells and pin CSS', () => {
    expect(load('ui/virtual/ColumnWindowCells.tsx')).toContain('pin-end');
    expect(load('ui/styles/erp-table.css')).toContain('erp-col-pin-end');
    expect(load('ui/columnPin.ts')).not.toContain('No public pin API');
    expect(load('domain/types/ColumnDef.ts')).toContain("pinned?: ColumnPinned");
  });

  it('header/body/footer apply pin offsets', () => {
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('columnPinCellProps');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('columnPinCellProps');
    expect(load('ui/desktop/ERPTableFooter.tsx')).toContain('columnPinCellProps');
  });

  it('RTL and LTR pin shadows are both defined', () => {
    const css = load('ui/styles/erp-table.css');
    expect(css).toMatch(/\[dir="ltr"\].*erp-col-pin-end/s);
    expect(css).toMatch(/\[dir="rtl"\].*erp-col-pin-end/s);
  });

  it('end pin stays mounted when scrolled', () => {
    const columns: ColumnSchema[] = [
      {
        fieldName: 'index',
        fieldCaption: '#',
        fieldType: 'index',
        visibility: { kind: 'always' },
      },
      ...Array.from({ length: 40 }, (_, i) => ({
        fieldName: `c${i}`,
        fieldCaption: `C${i}`,
        fieldType: 'text' as const,
        visibility: { kind: 'always' as const },
        minWidth: 120,
      })),
      {
        fieldName: 'total',
        fieldCaption: 'Total',
        fieldType: 'number' as const,
        visibility: { kind: 'always' as const },
        minWidth: 120,
        columnDef: { pinned: 'end' as const },
      },
    ];
    const scrolled = buildColumnWindowModel(columns, undefined, 800, 500, 1);
    expect(scrolled.pinnedEnd).toHaveLength(1);
    expect(scrolled.endPinOffsets.total).toBe(0);
  });
});
