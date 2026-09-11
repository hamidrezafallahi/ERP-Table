import React from 'react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import type { CellRenderContext } from '../cellRenderContext';
import {
  DEFAULT_CELL_COMPONENTS,
  mergeCellComponents,
  resolveBoundCellNode,
} from '../cellRegistry';
import { TextAreaCell } from '../TextAreaCell';

function collectMarks(
  node: React.ReactNode,
): { className: string; text: string }[] {
  if (node == null || typeof node === 'boolean') return [];
  if (typeof node === 'string' || typeof node === 'number') return [];
  if (Array.isArray(node)) return node.flatMap(collectMarks);
  if (!React.isValidElement(node)) return [];
  const props = node.props as { className?: string; children?: React.ReactNode };
  if (node.type === 'mark') {
    return [{ className: props.className ?? '', text: String(props.children ?? '') }];
  }
  return collectMarks(props.children);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

const ctx = {
  tableKey: 't1',
  columnId: 'note',
  value: 'line',
  display: 'line',
  isActive: true,
  isDeleted: false,
  isEditable: true,
  mode: 'cell',
} as CellRenderContext;

describe('PR-56 textArea default registry', () => {
  it('registers textArea as a default cell component, not a CellRenderer switch case', () => {
    expect(DEFAULT_CELL_COMPONENTS.textArea).toBe(TextAreaCell);
    const src = load('ui/cellRenderer/index.tsx');
    expect(src).not.toMatch(/case\s+['"]textArea['"]/);
    expect(load('domain/types/ColumnSchema.ts')).toContain("'textArea'");
    expect(load('ui/cellRenderer/TextAreaCell.tsx')).toContain(
      'data-erp-cell-textarea',
    );
  });

  it('resolves textArea from defaults when the host omits components', () => {
    const result = resolveBoundCellNode({ fieldType: 'textArea' }, undefined, ctx);
    expect(result.hit).toBe(true);
  });

  it('lets the host override the default textArea without dropping other defaults', () => {
    const merged = mergeCellComponents({
      textArea: () => 'host-area',
      checkbox: () => 'host-cb',
    });
    expect(merged.textArea?.({} as CellRenderContext)).toBe('host-area');
    expect(merged.checkbox?.({} as CellRenderContext)).toBe('host-cb');
    expect(
      resolveBoundCellNode({ fieldType: 'textArea' }, { textArea: () => 'x' }, ctx),
    ).toEqual({ hit: true, node: 'x' });
  });

  it('treats textArea values as strings in the command handler', () => {
    const handler = load('application/handlers/cellCommandsHandler.ts');
    expect(handler).toMatch(/case 'textArea'/);
  });

  it('shows a search mark instead of a textarea when this cell is the current hit (PR-71)', () => {
    const node = TextAreaCell({
      ...ctx,
      isActive: true,
      value: '123',
      searchQuery: '123',
      isCurrentSearchMatch: true,
    });
    expect(collectMarks(node)).toEqual([
      { className: 'erp-search-hit is-current', text: '123' },
    ]);
  });
});
