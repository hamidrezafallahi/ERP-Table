import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-61 header column drag', () => {
  it('desktop header dispatches COLUMN_REORDERED from th drag', () => {
    const header = load('ui/desktop/ERPTableHeader.tsx');
    expect(header).toContain('onDragStart');
    expect(header).toContain('COLUMN_REORDERED');
    expect(header).toContain('data-erp-col-drag');
    expect(header).toContain('resolveColumnReorder');
  });

  it('does not make the index header a drag source', () => {
    const header = load('ui/desktop/ERPTableHeader.tsx');
    const indexBlock = header.match(
      /if \(isIndexColumn\(col\)\) \{[\s\S]*?return \([\s\S]*?<\/th>/,
    )?.[0];
    expect(indexBlock).toBeTruthy();
    expect(indexBlock).not.toContain('data-erp-col-drag');
    expect(indexBlock).not.toContain('onDragStart');
  });

  it('resize handle does not start a column drag', () => {
    expect(load('ui/desktop/ColumnResizeHandle.tsx')).toContain('onDragStart');
    expect(load('ui/desktop/ColumnResizeHandle.tsx')).toMatch(
      /onDragStart=\{\(e\) => \{\s*e\.preventDefault\(\);\s*e\.stopPropagation\(\);/,
    );
  });

  it('mobile header has no column drag', () => {
    expect(load('ui/mobile/MobileTableHeader.tsx')).not.toContain(
      'data-erp-col-drag',
    );
    expect(load('ui/mobile/MobileTableHeader.tsx')).not.toContain(
      'COLUMN_REORDERED',
    );
  });
});
