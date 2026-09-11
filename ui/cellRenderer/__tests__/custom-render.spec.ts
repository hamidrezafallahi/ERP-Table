import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  resolveCustomCellNode,
  type CellRenderContext,
} from '../cellRenderContext';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

const ctx = {
  tableKey: 't1',
  columnId: 'mark',
  value: 12,
  display: '12',
} as CellRenderContext;

describe('PR-54 custom cell render', () => {
  it('falls through when render is omitted (built-in FieldType path)', () => {
    expect(resolveCustomCellNode({}, ctx)).toEqual({ hit: false });
    expect(resolveCustomCellNode({ render: undefined }, ctx)).toEqual({
      hit: false,
    });
  });

  it('returns the custom node when render is set', () => {
    const result = resolveCustomCellNode(
      { render: (raw) => `badge:${(raw as CellRenderContext).value}` },
      ctx,
    );
    expect(result).toEqual({ hit: true, node: 'badge:12' });
  });

  it('treats a render that returns null as a hit (empty custom cell, not FieldType)', () => {
    expect(resolveCustomCellNode({ render: () => null }, ctx)).toEqual({
      hit: true,
      node: null,
    });
  });

  it('does not treat returnDisplayValue as a renderer', () => {
    const schema = {
      returnDisplayValue: () => 'label-only',
    } as { returnDisplayValue: () => string; render?: undefined };
    expect(resolveCustomCellNode(schema, ctx)).toEqual({ hit: false });
  });

  it('CellRenderer (desktop + mobile) calls resolveCustomCellNode before FieldType switch', () => {
    const src = load('ui/cellRenderer/index.tsx');
    const customIdx = src.indexOf('resolveCustomCellNode');
    const switchIdx = src.indexOf('switch (type)');
    expect(customIdx).toBeGreaterThan(0);
    expect(switchIdx).toBeGreaterThan(customIdx);
    expect(src).toContain('data-erp-custom-cell');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('<CellRenderer');
    expect(load('ui/mobile/MobileTableRow.tsx')).toContain('<CellRenderer');
    expect(load('ui/mobile/MobileRowFormModal.tsx')).toContain('<CellRenderer');
  });
});
