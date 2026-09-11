import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ARIA_HEADER_ROW_INDEX,
  ariaColIndex,
  ariaDataRowIndex,
  ariaFooterRowIndex,
  ariaGridRowCount,
} from '../../a11y/gridRoles';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-62 grid roles', () => {
  it('maps 0-based collection indices to 1-based ARIA indices', () => {
    expect(ARIA_HEADER_ROW_INDEX).toBe(1);
    expect(ariaColIndex(0)).toBe(1);
    expect(ariaColIndex(3)).toBe(4);
    expect(ariaDataRowIndex(0)).toBe(2);
    expect(ariaDataRowIndex(9)).toBe(11);
    expect(ariaFooterRowIndex(10)).toBe(12);
    expect(ariaGridRowCount(10, false)).toBe(11);
    expect(ariaGridRowCount(10, true)).toBe(12);
  });

  it('desktop table is a grid with columnheader / gridcell / rowindex', () => {
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('role="grid"');
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('aria-colcount');
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('aria-rowcount');
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('columnheader');
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('aria-colindex');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('gridcell');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('aria-rowindex');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('ariaDataRowIndex');
  });

  it('virtual body uses absolute indices, not the mounted window offset', () => {
    const virtual = load('ui/desktop/ERPTableVirtualBody.tsx');
    expect(virtual).toContain('absoluteIndex');
    expect(virtual).toContain('index={absoluteIndex}');
    expect(virtual).toMatch(/aria-hidden/);
    expect(virtual).not.toContain('ariaDataRowIndex(i)');
  });

  it('mobile table uses the same grid roles', () => {
    expect(load('ui/mobile/MobileTable.tsx')).toContain('role="grid"');
    expect(load('ui/mobile/MobileTableHeader.tsx')).toContain('columnheader');
    expect(load('ui/mobile/MobileTableRow.tsx')).toContain('gridcell');
    expect(load('ui/mobile/MobileTableRow.tsx')).toContain('ariaDataRowIndex');
  });
});
