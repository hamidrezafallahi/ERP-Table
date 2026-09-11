import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-59 pin index column (D10)', () => {
  it('pins only the index column in product header, body, footer', () => {
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('data-erp-col-pin');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('data-erp-col-pin');
    expect(load('ui/desktop/ERPTableFooter.tsx')).toContain('data-erp-col-pin');
    expect(load('ui/columnPin.ts')).toContain("erp-col-pin-index");
    expect(load('ui/columnPin.ts')).toContain('only the index column is pinned');
  });

  it('virtual spacers keep a cell per column so sticky index is not colspan-only', () => {
    const virtual = load('ui/desktop/ERPTableVirtualBody.tsx');
    expect(virtual).toContain('data-erp-virtual-spacer');
    expect(virtual).toContain('visibleColumns.map');
    expect(virtual).not.toMatch(/colSpan=\{colSpan\}/);
    expect(virtual).toContain('indexPinClassName');
  });

  it('does not add a public pin API on ERPTableProps', () => {
    const props = load('ui/index.tsx');
    expect(props).not.toContain('pinnedColumns');
    expect(props).not.toContain('pinColumn');
    expect(props).not.toMatch(/pin(?:ned)?:/);
  });

  it('demo no longer has a separate sticky-index toggle', () => {
    expect(load('demo/src/DemoComponent.tsx')).not.toContain('Sticky IndexCol');
    expect(load('demo/src/DemoComponent.tsx')).not.toContain('overlapOn');
  });
});
