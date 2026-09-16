import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-114 column menu', () => {
  it('header exposes ⋮ menu button and popover wiring', () => {
    const header = load('ui/desktop/ERPTableHeader.tsx');
    expect(header).toContain('data-pdg-col-menu-btn');
    expect(header).toContain('ColumnMenuPopover');
    expect(header).toContain('ColumnsPanelPopover');
  });

  it('menu popover has menu items, keyboard, and theme portal', () => {
    const menu = load('ui/desktop/ColumnMenuPopover.tsx');
    expect(menu).toContain('role="menu"');
    expect(menu).toContain('role="menuitem"');
    expect(menu).toContain('data-pdg-col-menu-item');
    for (const id of [
      'sortAsc',
      'sortDesc',
      'sortNone',
      'filter',
      'hideColumn',
      'pinStart',
      'pinEnd',
      'pinNone',
      'autoSize',
      'columnsPanel',
    ]) {
      expect(menu).toContain(`'${id}'`);
    }
    expect(menu).toContain("e.key === 'ArrowDown'");
    expect(menu).toContain("e.key === 'ArrowUp'");
    expect(menu).toContain("e.key === 'Enter'");
    expect(menu).toContain("e.key === 'Escape'");
    expect(menu).toContain('useThemePortalStyle');
  });

  it('columns panel toggles visibility checkboxes', () => {
    const panel = load('ui/desktop/ColumnsPanelPopover.tsx');
    expect(panel).toContain('data-pdg-col-columns-panel');
    expect(panel).toContain('data-pdg-col-panel-toggle');
    expect(panel).toContain('setColumnVisible');
  });

  it('engine handles SET_COLUMN_PIN', () => {
    expect(load('engine/tableEngine.ts')).toContain("case 'SET_COLUMN_PIN'");
  });

  it('DataGrid accepts columnMenuItems prop', () => {
    expect(load('ui/index.tsx')).toContain('columnMenuItems');
    expect(load('ui/host/ERPTableHost.tsx')).toContain('columnMenuItems');
  });

  it('dark theme uses portal CSS variables on menu', () => {
    expect(load('ui/styles/erp-table.css')).toContain('.erp-col-menu');
    expect(load('ui/styles/erp-table.css')).toContain('--pdg-bg');
  });
});
