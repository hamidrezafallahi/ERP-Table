import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  buildColumnWindowModel,
  scrollOffsetFromInlineStart,
} from '../columnWindow';
import type { ColumnSchema } from '../../../bootstrap/type';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function makeCols(n: number): ColumnSchema[] {
  const cols: ColumnSchema[] = [
    {
      fieldName: 'index',
      fieldCaption: '#',
      fieldType: 'index',
      visibility: { kind: 'always' },
    },
  ];
  for (let i = 0; i < n; i += 1) {
    cols.push({
      fieldName: `c${i}`,
      fieldCaption: `C${i}`,
      fieldType: 'text',
      visibility: { kind: 'always' },
      minWidth: 144,
    });
  }
  return cols;
}

describe('PR-98 column window UI', () => {
  it('200 columns mount far fewer than 25 scrollable header cells at start', () => {
    const cols = makeCols(200);
    const model = buildColumnWindowModel(cols, undefined, 0, 800, 1);
    expect(model.pinned).toHaveLength(1);
    expect(model.scrollable.length).toBeLessThan(25);
    expect(model.pinned.length + model.mountedScrollableCount).toBeLessThan(30);
    expect(model.spacerEnd).toBeGreaterThan(0);
  });

  it('shares ColumnWindowProvider across header / body / footer', () => {
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('ColumnWindowProvider');
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('ColumnWindowCells');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('ColumnWindowCells');
    expect(load('ui/desktop/ERPTableFooter.tsx')).toContain('ColumnWindowCells');
    expect(load('ui/desktop/ERPTableVirtualBody.tsx')).toContain('ColumnWindowCells');
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('data-pdg-col-virt');
  });

  it('keeps index pin with column spacers', () => {
    expect(load('ui/virtual/ColumnWindowCells.tsx')).toContain('pdg-col-spacer');
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('columnPinCellProps');
    expect(load('ui/virtual/ColumnWindowCells.tsx')).toContain('pin-end');
  });

  it('normalizes RTL scrollLeft variants', () => {
    const ltr = {
      scrollLeft: 120,
      scrollWidth: 2000,
      clientWidth: 800,
    } as HTMLElement;
    expect(scrollOffsetFromInlineStart(ltr, 'ltr')).toBe(120);

    const rtlNeg = {
      scrollLeft: -120,
      scrollWidth: 2000,
      clientWidth: 800,
    } as HTMLElement;
    expect(scrollOffsetFromInlineStart(rtlNeg, 'rtl')).toBe(120);

    const rtlPos = {
      scrollLeft: 200,
      scrollWidth: 2000,
      clientWidth: 800,
    } as HTMLElement;
    // max = 1200; distance from start = 1200 - 200
    expect(scrollOffsetFromInlineStart(rtlPos, 'rtl')).toBe(1000);
  });
});
