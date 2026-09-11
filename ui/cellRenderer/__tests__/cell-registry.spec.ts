import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import type { CellRenderContext } from '../cellRenderContext';
import {
  resolveBoundCellNode,
  resolveRegisteredCellNode,
} from '../cellRegistry';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

const ctx = {
  tableKey: 't1',
  columnId: 'ok',
  value: true,
  display: 'true',
} as CellRenderContext;

describe('PR-55 cell component registry', () => {
  it('falls through when the FieldType is not in the map', () => {
    expect(resolveRegisteredCellNode('checkbox', undefined, ctx)).toEqual({
      hit: false,
    });
    expect(resolveRegisteredCellNode('checkbox', {}, ctx)).toEqual({
      hit: false,
    });
    expect(
      resolveRegisteredCellNode('text', { checkbox: () => 'cb' }, ctx),
    ).toEqual({ hit: false });
  });

  it('replaces checkbox from the map and leaves other types to the switch', () => {
    const components = {
      checkbox: () => 'host-checkbox',
    };
    expect(
      resolveRegisteredCellNode('checkbox', components, ctx),
    ).toEqual({ hit: true, node: 'host-checkbox' });
    expect(resolveRegisteredCellNode('text', components, ctx)).toEqual({
      hit: false,
    });
  });

  it('accepts free custom type keys', () => {
    const result = resolveRegisteredCellNode(
      'textArea',
      { textArea: () => 'area' },
      ctx,
    );
    expect(result).toEqual({ hit: true, node: 'area' });
  });

  it('column render wins over the components map', () => {
    const bound = resolveBoundCellNode(
      {
        fieldType: 'checkbox',
        render: () => 'column-render',
      },
      { checkbox: () => 'registry-checkbox' },
      ctx,
    );
    expect(bound).toEqual({ hit: true, node: 'column-render' });
  });

  it('CellRenderer reads the registry before the FieldType switch', () => {
    const src = load('ui/cellRenderer/index.tsx');
    const boundIdx = src.indexOf('resolveBoundCellNode');
    const switchIdx = src.indexOf('switch (type)');
    expect(boundIdx).toBeGreaterThan(0);
    expect(switchIdx).toBeGreaterThan(boundIdx);
    expect(src).toContain('data-erp-cell-component');
    expect(src).toContain('components');
    expect(load('ui/index.tsx')).toContain('components?: CellComponentMap');
    expect(load('ui/host/ERPTableHost.tsx')).toContain('components?: CellComponentMap');
  });
});
