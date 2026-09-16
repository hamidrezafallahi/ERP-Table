import { readFileSync } from 'node:fs';

import { dirname, join } from 'node:path';

import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';



const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');



function load(rel: string): string {

  return readFileSync(join(root, rel), 'utf8');

}



describe('PR-59 / PR-110 column pin', () => {

  it('pins index at inline-start and supports ColumnDef.pinned', () => {

    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('data-erp-col-pin');

    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('data-erp-col-pin');

    expect(load('ui/desktop/ERPTableFooter.tsx')).toContain('data-erp-col-pin');

    expect(load('ui/columnPin.ts')).toContain('erp-col-pin-index');

    expect(load('ui/columnPin.ts')).toContain('erp-col-pin-end');

    expect(load('ui/columnPin.ts')).toContain('resolveColumnPinned');

  });



  it('virtual spacers keep a cell per column so sticky pins are not colspan-only', () => {

    const virtual = load('ui/desktop/ERPTableVirtualBody.tsx');

    expect(virtual).toContain('data-erp-virtual-spacer');

    expect(virtual).toContain('ColumnWindowCells');

    expect(virtual).not.toMatch(/colSpan=\{colSpan\}/);

    expect(virtual).toContain('columnPinCellProps');

  });



  it('does not add a pinnedColumns prop — pin is per ColumnDef', () => {

    const props = load('ui/index.tsx');

    expect(props).not.toContain('pinnedColumns');

    expect(props).not.toContain('pinColumn');

  });



  it('demo no longer has a separate sticky-index toggle', () => {

    expect(load('demo/src/DemoComponent.tsx')).not.toContain('Sticky IndexCol');

    expect(load('demo/src/DemoComponent.tsx')).not.toContain('overlapOn');

  });

});


