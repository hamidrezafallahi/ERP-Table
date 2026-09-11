import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function load(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PR-46 public API honesty', () => {
  const doc = load('docs/public-api-honesty.md');

  it('documents the known dead/stub/exported-only surfaces', () => {
    for (const token of [
      'CLEAR_ROW_SELECTION',
      'SET_UNIT_LEVEL',
      'COLUMN_REORDERED',
      'asyncValidator',
      'SparseRowIndex',
      'SnapshotStrategy',
    ]) {
      expect(doc, `honesty doc missing ${token}`).toContain(token);
    }
  });

  it('CLEAR_ROW_SELECTION is a live engine command with UI dispatch', () => {
    const commands = load('application/commands/index.ts');
    expect(commands).toContain("type: 'CLEAR_ROW_SELECTION'");
    expect(commands).toMatch(
      /export type EngineTableCommand[\s\S]*ClearRowSelectionCommand/,
    );
    expect(commands).not.toMatch(
      /export type ApplicationTableCommand[\s\S]*ClearRowSelectionCommand/,
    );
    expect(load('engine/tableEngine.ts')).toContain(
      "case 'CLEAR_ROW_SELECTION'",
    );
    expect(load('engine/managers/SelectionManager.ts')).toContain(
      'clearRowSelection',
    );
    expect(load('infrastructure/ui/UITableController.ts')).toContain(
      "case 'CLEAR_ROW_SELECTION'",
    );
    expect(load('application/TableAppService.ts')).not.toContain(
      'CLEAR_ROW_SELECTION',
    );
  });

  it('COLUMN_REORDERED is an AppService command with header drag (PR-61)', () => {
    expect(load('application/TableAppService.ts')).toContain(
      "case 'COLUMN_REORDERED'",
    );
    expect(load('application/handlers/tableCommandHandler.ts')).toContain(
      'ReorderColumnCommandHandler',
    );
    expect(load('application/commands/index.ts')).toMatch(
      /export type ApplicationTableCommand[\s\S]*ColumnReorderedCommand/,
    );
    expect(load('engine/tableEngine.ts')).not.toContain("'COLUMN_REORDERED'");
    expect(load('ui/desktop/ERPTableHeader.tsx')).toMatch(/onDragStart/);
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('COLUMN_REORDERED');
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('data-erp-col-drag');
    expect(doc).toContain('**live** (PR-61)');
  });

  it('SET_UNIT_LEVEL stub is removed; UNIT_COLUMN_ADDED stays reserved with no emitter', () => {
    expect(load('application/commands/index.ts')).not.toContain('SET_UNIT_LEVEL');
    expect(load('application/TableAppService.ts')).not.toContain('SET_UNIT_LEVEL');
    const handler = load('application/handlers/tableCommandHandler.ts');
    expect(handler).not.toContain('ChangeUnitLevelHandler');
    expect(handler).not.toContain('addColumns([])');
    expect(handler).not.toContain('UNIT_COLUMN_ADDED');
    expect(load('application/events/eventCatalog.ts')).toContain(
      'UNIT_COLUMN_ADDED',
    );
    expect(doc).toMatch(/UNIT_COLUMN_ADDED[\s\S]*reserved, no emitter/i);
  });

  it('asyncValidator is awaited in TableEngine.validateCellFull', () => {
    expect(load('domain/value-objects/index.ts')).toContain('asyncValidator?');
    const engine = load('engine/tableEngine.ts');
    expect(engine).toContain('rule.asyncValidator');
    expect(engine).toMatch(/await rule\.asyncValidator/);
  });

  it('SparseRowIndex is on the virtual render path', () => {
    const virtualBody = load('ui/desktop/ERPTableVirtualBody.tsx');
    expect(virtualBody).toContain('getUiRowIndex');
    expect(virtualBody).not.toContain('getAllUIRows()');
    expect(virtualBody).not.toContain('[...allRows].sort');
    expect(load('ui/virtual/virtualWindow.ts')).toContain('SparseRowIndex');
    expect(load('ui/virtual/useVirtualWindow.ts')).toContain('SparseRowIndex');
    expect(load('infrastructure/session/DefaultGridSession.ts')).toContain(
      'getUiRowCount',
    );
    expect(load('engine/ViewStateBuilder.ts')).toContain('SparseRowIndex');
  });

  it('SnapshotStrategy is opt-in via CreateERPTableConfig.snapshotStore', () => {
    const bootstrap = load('bootstrap/index.ts');
    expect(bootstrap).toContain('SnapshotStrategy');
    expect(bootstrap).toContain('snapshotStore');
    expect(bootstrap).toMatch(/if \(snapshotStrategy\)/);
    expect(load('bootstrap/type.ts')).toContain('snapshotStore?');
    expect(bootstrap).toContain('loadWithCatchUp');
  });

  it('default RemoteApi is NoopRemoteApi in all environments (D1)', () => {
    const bootstrap = load('bootstrap/index.ts');
    expect(bootstrap).toContain('new NoopRemoteApi()');
    expect(bootstrap).not.toContain('FetchRemoteApi');
    expect(bootstrap).not.toContain("typeof window");
    expect(load('index.ts')).toContain('FetchRemoteApi');
    expect(load('publish/entry.ts')).toContain('FetchRemoteApi');
    expect(load('publish/entry.ts')).toContain('NoopRemoteApi');
  });

  it('multiSelectConfig is optional on ERPTableProps (D11)', () => {
    expect(load('ui/index.tsx')).toContain('multiSelectConfig?: IMultiSelectConfig');
    expect(doc).toContain('multiSelectConfig');
    expect(doc).toContain('PR-53 / D11');
  });

  it('ColumnViewBinding.render is consumed by CellRenderer (PR-54)', () => {
    const mapper = load('infrastructure/columns/mapColumnSchema.ts');
    expect(mapper).toContain('render: schema.render');
    expect(mapper).not.toContain(
      'schema.returnDisplayValue as ColumnViewBinding',
    );
    expect(load('ui/cellRenderer/index.tsx')).toContain('resolveCustomCellNode');
    expect(doc).toContain('`ColumnViewBinding.render`');
    expect(doc).toContain('**live** (PR-54)');
  });

  it('components map is on ERPTable host context and CellRenderer (PR-55)', () => {
    expect(load('ui/index.tsx')).toContain('components?: CellComponentMap');
    expect(load('ui/host/ERPTableHost.tsx')).toContain(
      'components?: CellComponentMap',
    );
    expect(load('ui/cellRenderer/index.tsx')).toContain('resolveBoundCellNode');
    expect(load('ui/cellRenderer/cellRegistry.ts')).toContain(
      'Partial<Record<FieldType, CellComponent>>',
    );
    expect(doc).toContain('PR-55');
  });

  it('textArea is a FieldType served from the default registry (PR-56)', () => {
    expect(load('domain/types/ColumnSchema.ts')).toContain("'textArea'");
    expect(load('ui/cellRenderer/cellRegistry.ts')).toContain(
      'textArea: TextAreaCell',
    );
    expect(load('ui/cellRenderer/index.tsx')).not.toMatch(
      /case\s+['"]textArea['"]/,
    );
    expect(load('ui/index.tsx')).toContain('shouldSkipGridNavigation');
    expect(doc).toContain('PR-56');
  });

  it('column resize is session view state (PR-58)', () => {
    expect(load('engine/tableEngine.ts')).toContain("case 'RESIZE_COLUMN'");
    expect(load('application/commands/index.ts')).toContain(
      "type: 'RESIZE_COLUMN'",
    );
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain(
      'ColumnResizeHandle',
    );
    expect(load('ui/desktop/ColumnResizeHandle.tsx')).toContain(
      'data-erp-col-resize',
    );
    expect(load('infrastructure/ui/UITableController.ts')).toContain(
      "case 'UI_RESIZE_COLUMN'",
    );
    expect(doc).toContain('**live** (PR-58)');
    expect(doc).toContain('بدون EventStore');
  });

  it('index column is horizontally pinned in product chrome (PR-59 / D10)', () => {
    expect(load('ui/columnPin.ts')).toContain('erp-col-pin-index');
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('indexPinClassName');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('data-erp-col-pin');
    expect(load('ui/desktop/ERPTableVirtualBody.tsx')).not.toMatch(
      /colSpan=\{colSpan\}/,
    );
    expect(load('ui/index.tsx')).not.toContain('pinnedColumns');
    expect(doc).toContain('**live** (PR-59)');
    expect(doc).toContain('D10');
  });

  it('product table exposes role=grid with col/row indices (PR-62)', () => {
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('role="grid"');
    expect(load('ui/mobile/MobileTable.tsx')).toContain('role="grid"');
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('columnheader');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('gridcell');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('ariaDataRowIndex');
    expect(load('ui/desktop/ERPTableVirtualBody.tsx')).toContain(
      'index={absoluteIndex}',
    );
    expect(doc).toContain('**live** (PR-62)');
  });

  it('active cell is aria-selected and row checkboxes have aria-label (PR-63)', () => {
    expect(load('ui/a11y/gridRoles.ts')).toContain('aria-selected');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('gridCellA11y');
    expect(load('ui/desktop/DesktopTable.tsx')).toContain(
      'aria-activedescendant',
    );
    expect(load('ui/mobile/MobileTable.tsx')).toContain(
      'aria-activedescendant',
    );
    expect(load('ui/desktop/indexCol.tsx')).toContain('general.selectRow');
    expect(load('ui/mobile/MobileIndexCol.tsx')).toContain(
      'general.selectRow',
    );
    expect(load('ui/primitives/chrome.tsx')).toContain("'aria-label'");
    expect(load('ui/index.tsx')).toContain('KEY_DOWN');
    expect(doc).toContain('**live** (PR-63)');
  });

  it('toolbar icon buttons have aria-label from messages (PR-64)', () => {
    expect(load('ui/a11y/ToolbarIconButton.tsx')).toContain('aria-label={label}');
    expect(load('ui/desktop/groupActionButtons.tsx')).toContain(
      'ToolbarIconButton',
    );
    expect(load('ui/desktop/groupActionButtons.tsx')).toContain(
      'role="toolbar"',
    );
    expect(load('ui/mobile/MobileActionButtons.tsx')).toContain(
      'ToolbarIconButton',
    );
    expect(load('ui/styles/erp-table.css')).toContain(
      '.erp-table .erp-toolbar-btn:focus-visible',
    );
    expect(load('ui/a11y/ToolbarIconButton.tsx')).not.toContain(
      'outline-none',
    );
    expect(doc).toContain('**live** (PR-64)');
  });

  it('Vazirmatn font is opt-in via fonts/vazirmatn subpath (PR-76)', () => {
    expect(load('packages/plugins/pdf/src/index.ts')).toContain(
      'VazirmatnPdfRenderer',
    );
    expect(load('packages/plugins/pdf/src/VazirmatnPdfRenderer.ts')).toContain(
      'CIDFontType2',
    );
    expect(load('packages/plugins/pdf/src/PdfExportPlugin.ts')).toContain(
      'options.renderer ?? new TextPdfRenderer()',
    );
    expect(load('packages/plugins/pdf/src/PdfExportPlugin.ts')).not.toContain(
      'new VazirmatnPdfRenderer()',
    );
    expect(load('publish/plugins/pdf-fonts-vazirmatn.ts')).toContain(
      'createVazirmatnPdfExportPlugin',
    );
    expect(load('publish/entry.ts')).toContain('VazirmatnPdfRenderer');
    expect(load('packages/plugins/pdf/src/TextPdfRenderer.ts')).toContain(
      '@deprecated',
    );
    expect(doc).toContain('**live** (PR-66 / PR-76)');
    expect(doc).toContain('**exported-only** (legacy)');
    expect(doc).toMatch(/PR-76/);
  });

  it('PDF toolbar button shows when PdfExportPlugin is registered (PR-67)', () => {
    expect(load('ui/index.tsx')).toContain('plugins');
    expect(load('ui/index.tsx')).toContain('pluginHost: result.pluginHost');
    expect(load('ui/useERPTable.ts')).toContain('pluginHost');
    expect(load('application/plugins/PluginHost.ts')).toContain(
      'has(pluginName: string)',
    );
    expect(load('ui/export/PdfExportToolbarButton.tsx')).toContain(
      'pdf-export',
    );
    expect(load('ui/export/PdfExportToolbarButton.tsx')).toContain(
      "format: 'pdf'",
    );
    expect(load('ui/desktop/groupActionButtons.tsx')).toContain(
      'PdfExportToolbarButton',
    );
    expect(load('ui/mobile/MobileActionButtons.tsx')).toContain(
      'PdfExportToolbarButton',
    );
    expect(load('ui/host/messages.ts')).toContain('general.exportToPdf');
    expect(doc).toContain('**live** (PR-67)');
  });

  it('Excel import toolbar button shows when ExcelImportPlugin is registered (PR-68)', () => {
    expect(load('ui/export/ExcelImportToolbarButton.tsx')).toContain(
      'excel-import',
    );
    expect(load('ui/export/ExcelImportToolbarButton.tsx')).toContain(
      "format: 'xlsx'",
    );
    expect(load('ui/export/ExcelImportToolbarButton.tsx')).toContain(
      'requestImport',
    );
    expect(load('ui/desktop/groupActionButtons.tsx')).toContain(
      'ExcelImportToolbarButton',
    );
    expect(load('ui/mobile/MobileActionButtons.tsx')).toContain(
      'ExcelImportToolbarButton',
    );
    expect(load('ui/host/messages.ts')).toContain('general.importFromExcel');
    expect(load('demo/src/LiveGridPreview.tsx')).toContain(
      'ExcelImportPlugin',
    );
    expect(doc).toContain('**live** (PR-68)');
  });

  it('footer totals and search marks use semantic theme tokens (PR-69)', () => {
    expect(load('ui/gridSearch/highlightText.tsx')).toContain('erp-search-hit');
    expect(load('ui/gridSearch/highlightText.tsx')).not.toContain(
      'bg-yellow-400',
    );
    expect(load('ui/desktop/ERPTableFooter.tsx')).toContain('erp-table-footer');
    expect(load('ui/styles/erp-table.css')).toContain('--erp-search-other');
    expect(load('ui/styles/injectStyles.ts')).toContain('--erp-search-other');
    expect(load('ui/styles/erp-table.css')).toContain('tfoot.erp-table-footer');
    expect(load('demo/src/LiveGridPreview.tsx')).toContain('footer={true}');
    expect(load('ui/primitives/DatePicker.tsx')).not.toContain('#ddecfd');
    expect(doc).toContain('**live** (PR-69)');
  });

  it('cell renderer product path has no ts-nocheck (PR-70)', () => {
    expect(load('ui/cellRenderer/index.tsx')).not.toContain('@ts-nocheck');
    expect(load('ui/cellRenderer/descriptionComponent/index.tsx')).not.toContain(
      '@ts-nocheck',
    );
    expect(load('ui/cellRenderer/descriptionComponent/index.tsx')).not.toContain(
      'useVoucherDescription',
    );
    expect(load('tsconfig.json')).not.toContain('useVoucherDescription');
    expect(load('tsconfig.publish.json')).not.toContain(
      'useVoucherDescription',
    );
    expect(load('examples/host-arian-erp/README.md')).toContain('useERPGrid');
    expect(doc).toContain('**live** (PR-70');
  });

  it('search marks registered textArea and description cells (PR-71)', () => {
    expect(load('ui/cellRenderer/cellRenderContext.ts')).toContain(
      'isCurrentSearchMatch',
    );
    expect(load('ui/cellRenderer/TextAreaCell.tsx')).toContain(
      'highlightIfCurrentSearch',
    );
    expect(load('ui/cellRenderer/descriptionComponent/index.tsx')).toContain(
      'highlightIfCurrentSearch',
    );
    expect(load('publish/entry.ts')).toContain('highlightIfCurrentSearch');
    expect(load('docs/cell-components.md')).toContain('highlightIfCurrentSearch');
    expect(doc).toContain('**live** (PR-71)');
  });
});

describe('PR-75 README / public-api honesty', () => {
  const readme = load('README.md');
  const publicApi = load('docs/public-api.md');
  const pkg = JSON.parse(load('package.json')) as {
    files?: string[];
    exports?: Record<string, unknown>;
    peerDependencies?: Record<string, string>;
    description?: string;
  };

  function featureBullets(): string[] {
    const section = readme.split(/^## Features\s*$/m)[1]?.split(/^## /m)[0] ?? '';
    return section
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('- '));
  }

  it('public-api documents styles.css export and docs stay out of npm files', () => {
    expect(publicApi).toMatch(/persian-data-grid\/styles\.css/);
    expect(publicApi).not.toMatch(/files`? still ships `docs\//);
    expect(publicApi).toMatch(/\*\*only\*\* `dist\//);
    expect(pkg.files).toEqual(['dist']);
    expect(pkg.exports?.['./styles.css']).toBe('./dist/styles.css');
    expect(pkg.exports?.['./plugins/excel']).toBeTruthy();
    expect(pkg.exports?.['./headless']).toBeTruthy();
  });

  it('README drops false Excel-like / default tens-of-thousands claims', () => {
    expect(readme).not.toMatch(/Excel-like keyboard/i);
    expect(readme).not.toMatch(/tens of thousands/i);
    expect(readme).not.toMatch(/ناوبری کیبورد شبیه Excel/);
    expect(pkg.description ?? '').not.toMatch(/Excel\/IDE keyboard/i);
  });

  it('Features section has seven bullets and each is backed by code', () => {
    const bullets = featureBullets();
    expect(bullets).toHaveLength(7);

    const byLabel = Object.fromEntries(
      bullets.map((b) => {
        const m = b.match(/^\- \*\*([^*]+)\*\*/);
        return [m?.[1]?.trim() ?? b, b];
      }),
    );

    // Grid — published React chrome
    expect(byLabel.Grid).toBeTruthy();
    expect(load('ui/index.tsx')).toContain('export function ERPTable');
    expect(load('ui/desktop/pagination.tsx').length).toBeGreaterThan(0);
    expect(load('ui/desktop/indexCol.tsx').length).toBeGreaterThan(0);
    expect(load('ui/primitives/DatePicker.tsx')).toContain(
      'react-persian-range-picker',
    );

    // RTL-native
    expect(byLabel['RTL-native']).toBeTruthy();
    expect(load('ui/host/ERPTableHost.tsx')).toMatch(/direction|rtl/i);
    expect(load('ui/primitives/DatePicker.tsx')).toContain(
      'react-persian-range-picker',
    );

    // Cell keyboard navigation (honest — not Excel clipboard)
    expect(byLabel['Cell keyboard navigation']).toBeTruthy();
    expect(byLabel['Cell keyboard navigation']).toMatch(/not implemented yet/i);
    const keys = load('infrastructure/ui/UITableKeyboardHandler.ts');
    expect(keys).toContain("case 'Tab'");
    expect(keys).toContain("case 'ArrowLeft'");
    expect(keys).toContain("case 'Enter'");
    expect(load('ui/keyboard/skipGridNavigation.ts')).toContain('ArrowUp');

    // VirtualList — opt-in, pagination default
    expect(byLabel.VirtualList).toBeTruthy();
    expect(byLabel.VirtualList).toMatch(/opt-in/i);
    expect(byLabel.VirtualList).toMatch(/pagination is the default/i);
    expect(load('publish/entry.ts')).toContain('VirtualList');
    expect(load('ui/desktop/resolveDesktopVirtualization.ts')).toContain(
      'virtualization === true && !!session',
    );

    // Event-sourced session
    expect(byLabel['Event-sourced session']).toBeTruthy();
    expect(load('publish/entry.ts')).toContain('IndexedDbEventStore');
    expect(load('application/undo/CellUndoStack.ts').length).toBeGreaterThan(0);

    // Excel / PDF plugins — available via root deprecated alias + subpaths
    expect(byLabel['Excel / PDF plugins']).toBeTruthy();
    expect(load('publish/entry.ts')).toContain('ExcelExportPlugin');
    expect(load('publish/entry.ts')).toContain('PdfExportPlugin');
    expect(load('publish/plugins/excel.ts')).toContain('ExcelExportPlugin');
    expect(load('publish/plugins/pdf.ts')).toContain('PdfExportPlugin');
    expect(load('application/plugins/PluginHost.ts')).toContain(
      'EXPORT_REQUESTED',
    );

    // TypeScript / React peers
    expect(byLabel.TypeScript).toBeTruthy();
    expect(pkg.peerDependencies?.react).toContain('17');
    expect(pkg.peerDependencies?.react).toContain('18');
    expect(pkg.peerDependencies?.react).toContain('19');
  });

  it('removing an honest VirtualList claim would fail this suite (guard)', () => {
    // If someone rewrites Features to re-claim default virtualization for
    // "tens of thousands", the negative assertion above must catch it.
    const bullets = featureBullets();
    const virtual = bullets.find((b) => b.includes('VirtualList'));
    expect(virtual).toBeTruthy();
    expect(virtual!).not.toMatch(/tens of thousands/i);
    expect(virtual!).toMatch(/opt-in/i);
  });
});
