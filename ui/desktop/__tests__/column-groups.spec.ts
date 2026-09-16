import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-113 column groups', () => {
  it('header renders group rows with aria-colspan and collapse toggle', () => {
    const header = load('ui/desktop/ColumnGroupHeaderRows.tsx');
    expect(header).toContain('aria-colspan');
    expect(header).toContain('erp-col-group-toggle');
    expect(header).toContain('aria-expanded');
  });

  it('ERPTableHeader wires group toggle and group drag reorder', () => {
    const header = load('ui/desktop/ERPTableHeader.tsx');
    expect(header).toContain('ColumnGroupHeaderRows');
    expect(header).toContain('toggleColumnGroup');
    expect(header).toContain('resolveGroupBlockReorder');
  });

  it('engine handles TOGGLE_COLUMN_GROUP session state', () => {
    expect(load('engine/tableEngine.ts')).toContain("case 'TOGGLE_COLUMN_GROUP'");
    expect(load('engine/type.ts')).toContain('collapsedColumnGroups');
  });
});
