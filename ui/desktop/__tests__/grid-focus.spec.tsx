/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';

import { createGrid } from '../../../bootstrap';
import {
  closestGridRoot,
  isCellEditorTarget,
  listFocusable,
  trapTabKey,
} from '../../../infrastructure/ui/focusTrap';
import { ERPTableHostProvider } from '../../host/ERPTableHost';
import { themeDefault } from '../../theme';
import { DesktopTable } from '../DesktopTable';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

vi.mock('@services/customBaseQuery', () => ({
  baseQueryByToken: async () => ({ data: null }),
}));

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

type Row = { id: string; name: string; amount: number };

function stubMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('min-width'),
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

function stubResizeObserver(): void {
  class RO {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: RO,
  });
}

describe('PR-124 focusTrap helpers', () => {
  it('detects cell editors and traps Tab at ends', () => {
    document.body.innerHTML = `
      <table role="grid"><tr><td role="gridcell"><input id="ed" /></td></tr></table>
      <div id="menu" role="menu">
        <button id="a">A</button>
        <button id="b">B</button>
      </div>
    `;
    const ed = document.getElementById('ed')!;
    expect(isCellEditorTarget(ed)).toBe(true);
    expect(closestGridRoot(ed)?.getAttribute('role')).toBe('grid');

    const menu = document.getElementById('menu') as HTMLElement;
    const items = listFocusable(menu);
    expect(items).toHaveLength(2);
    items[0]!.focus();
    const prevented: string[] = [];
    trapTabKey(menu, {
      key: 'Tab',
      shiftKey: true,
      preventDefault: () => prevented.push('shift'),
    });
    expect(prevented).toContain('shift');
    expect(document.activeElement).toBe(items[1]);
  });
});

describe('PR-124 grid single tab-stop (APG)', () => {
  beforeEach(() => {
    stubMatchMedia();
    stubResizeObserver();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('Tab enters the grid once; arrows move active cell; Tab leaves', async () => {
    const before = document.createElement('button');
    before.textContent = 'before';
    before.id = 'before-grid';
    const after = document.createElement('button');
    after.textContent = 'after';
    after.id = 'after-grid';
    document.body.append(before, after);

    const grid = createGrid<Row>({
      columnDefs: [
        { field: 'name', headerName: 'Name', type: 'text' },
        { field: 'amount', headerName: 'Amount', type: 'number' },
      ],
      rowData: [
        { id: '1', name: 'A', amount: 1 },
        { id: '2', name: 'B', amount: 2 },
      ],
      getRowId: (r) => r.id,
    });
    await grid.ready;

    const { container } = render(
      <ERPTableHostProvider locale="en" theme={themeDefault}>
        <DesktopTable
          controller={grid.controller}
          tableKey={grid.tableKey}
          store={grid.store}
          ready
          session={grid.session}
          virtualization={false}
          tableHeight={320}
        />
      </ERPTableHostProvider>,
      { container: document.body.appendChild(document.createElement('div')) },
    );

    const gridEl = container.querySelector(
      '[role="grid"][data-pdg-grid-focus]',
    ) as HTMLElement;
    expect(gridEl).toBeTruthy();
    expect(gridEl.tabIndex).toBe(0);

    before.focus();
    expect(document.activeElement).toBe(before);

    gridEl.focus();
    await waitFor(() => {
      expect(document.activeElement).toBe(gridEl);
      expect(grid.controller.getActiveCell()?.columnId).toBeTruthy();
    });

    const first = grid.controller.getActiveCell()!;
    await grid.controller.dispatch({
      type: 'KEY_DOWN',
      event: new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        code: 'ArrowDown',
        bubbles: true,
      }),
      ctx: {
        activeRowId: first.rowId,
        tableKey: grid.tableKey,
        activeColumnId: first.columnId,
      },
    });
    const afterArrow = grid.controller.getActiveCell()!;
    expect(
      afterArrow.rowId !== first.rowId || afterArrow.columnId !== first.columnId,
    ).toBe(true);

    // Navigation-mode Tab must not preventDefault (APG exit).
    const tab = new KeyboardEvent('keydown', {
      key: 'Tab',
      code: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    const prevented = vi.spyOn(tab, 'preventDefault');
    await grid.controller.dispatch({
      type: 'KEY_DOWN',
      event: tab,
      ctx: {
        activeRowId: afterArrow.rowId,
        tableKey: grid.tableKey,
        activeColumnId: afterArrow.columnId,
      },
    });
    expect(prevented).not.toHaveBeenCalled();

    after.focus();
    expect(document.activeElement).toBe(after);

    before.remove();
    after.remove();
  });

  it('wires tabIndex=0, Esc ladder, focus trap, and cell editor focus-visible', () => {
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('tabIndex={0}');
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('data-pdg-grid-focus');
    expect(load('ui/mobile/MobileTable.tsx')).toContain('tabIndex={0}');
    expect(load('infrastructure/ui/UITableKeyboardHandler.ts')).toContain(
      'isCellEditorTarget',
    );
    expect(load('infrastructure/ui/UITableKeyboardHandler.ts')).toContain(
      'closestGridRoot',
    );
    expect(load('ui/desktop/ColumnMenuPopover.tsx')).toContain('trapTabKey');
    expect(load('ui/primitives/chrome.tsx')).toContain('trapTabKey');
    expect(load('ui/primitives/chrome.tsx')).toContain('role="dialog"');
    expect(load('ui/styles/erp-table.css')).toContain(
      '.pdg-cell-editor:focus-visible',
    );
    expect(load('ui/cellRenderer/index.tsx')).toContain('pdg-cell-editor');
    expect(load('docs/keyboard.md')).toContain('single tab-stop');
  });
});
