import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-64 toolbar icon labels and focus', () => {
  it('GroupAction and mobile toolbars label icon buttons from messages', () => {
    const toolbar = load('ui/a11y/ToolbarIconButton.tsx');
    expect(toolbar).toContain('aria-label={label}');
    expect(toolbar).toContain('erp-toolbar-btn');

    const desktop = load('ui/desktop/groupActionButtons.tsx');
    expect(desktop).toContain('ToolbarIconButton');
    expect(desktop).toContain('role="toolbar"');
    expect(desktop).toContain('general.addNewRow');
    expect(desktop).toContain('general.copy');
    expect(desktop).toContain('general.exportToExcel');
    expect(desktop).toContain('PdfExportToolbarButton');
    expect(desktop).toContain('ExcelImportToolbarButton');
    expect(desktop).toContain('general.toolbar');

    const mobile = load('ui/mobile/MobileActionButtons.tsx');
    expect(mobile).toContain('ToolbarIconButton');
    expect(mobile).toContain('role="toolbar"');
    expect(mobile).toContain('general.addNewRow');
    expect(mobile).toContain('PdfExportToolbarButton');
    expect(mobile).toContain('ExcelImportToolbarButton');
  });

  it('search and theme toggle reuse the same labeled control', () => {
    expect(load('ui/gridSearch/GridSearchControl.tsx')).toContain(
      'ToolbarIconButton',
    );
    expect(load('ui/theme/ThemeToggleButton.tsx')).toContain(
      'ToolbarIconButton',
    );
    expect(load('ui/gridSearch/GridSearchPanel.tsx')).toContain(
      "aria-label={t('general.prev')}",
    );
    expect(load('ui/gridSearch/GridSearchPanel.tsx')).toContain(
      "aria-label={t('general.next')}",
    );
  });

  it('toolbar focus-visible uses accent, not outline-none', () => {
    const css = load('ui/styles/erp-table.css');
    const injected = load('ui/styles/injectStyles.ts');
    for (const src of [css, injected]) {
      expect(src).toContain('.erp-table .erp-toolbar-btn:focus-visible');
      expect(src).toContain('outline: 2px solid var(--erp-accent)');
    }
    expect(load('ui/a11y/ToolbarIconButton.tsx')).not.toContain(
      'outline-none',
    );
  });
});
