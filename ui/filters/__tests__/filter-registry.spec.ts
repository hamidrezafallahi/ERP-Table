import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { resolveFilterComponent } from '../filterRegistry';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-95 filter component registry', () => {
  it('resolves a named FilterComponent from the host map', () => {
    const round = () => 'round-ui';
    expect(resolveFilterComponent('roundAmount', { roundAmount: round })).toBe(
      round,
    );
    expect(resolveFilterComponent('roundAmount', {})).toBeUndefined();
    expect(resolveFilterComponent(undefined, { roundAmount: round })).toBeUndefined();
    expect(resolveFilterComponent('roundAmount', undefined)).toBeUndefined();
  });

  it('wires filterComponents through DataGrid host and header popover', () => {
    expect(load('ui/index.tsx')).toContain('filterComponents?: FilterComponentMap');
    expect(load('ui/host/ERPTableHost.tsx')).toContain(
      'filterComponents?: FilterComponentMap',
    );
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('resolveFilterComponent');
    expect(load('ui/desktop/ColumnFilterPopover.tsx')).toContain('customComponent');
    expect(load('demo/src/LiveGridPreview.tsx')).toContain('roundAmount');
    expect(load('demo/src/LiveGridPreview.tsx')).toContain('فقط مبالغ رُند');
    expect(load('demo/src/fixtures.ts')).toContain("filter: 'roundAmount'");
  });

  it('exports FilterComponent types from the public entry', () => {
    expect(load('index.ts')).toContain('FilterComponent');
    expect(load('publish/entry.ts')).toContain('FilterComponentMap');
  });
});
