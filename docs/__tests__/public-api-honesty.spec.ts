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
    expect(load('index.ts')).not.toContain('FetchRemoteApi');
    expect(load('publish/entry.ts')).not.toContain('FetchRemoteApi');
    expect(load('publish/adapters/arian-erp.ts')).toContain('FetchRemoteApi');
    expect(load('publish/entry.ts')).toContain('NoopRemoteApi');
    expect(load('docs/public-api.md')).toContain(
      'persian-data-grid/adapters/arian-erp',
    );
    expect(load('docs/public-api.md')).not.toMatch(
      /import \{[^}]*FetchRemoteApi[^}]*\} from 'persian-data-grid'/,
    );
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

  it('column pin: index + ColumnDef.pinned (PR-59 / PR-110 / D19)', () => {
    expect(load('ui/columnPin.ts')).toContain('erp-col-pin-index');
    expect(load('ui/columnPin.ts')).toContain('erp-col-pin-end');
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('columnPinCellProps');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('data-erp-col-pin');
    expect(load('ui/desktop/ERPTableVirtualBody.tsx')).not.toMatch(
      /colSpan=\{colSpan\}/,
    );
    expect(load('ui/index.tsx')).not.toContain('pinnedColumns');
    expect(load('domain/types/ColumnDef.ts')).toContain('pinned?: ColumnPinned');
    expect(doc).toMatch(/pin/i);
  });

  it('product table exposes role=grid with col/row indices (PR-62)', () => {
    expect(load('ui/desktop/DesktopTable.tsx')).toMatch(
      /role=\{isTreeGrid \? 'treegrid' : 'grid'\}|role="grid"/,
    );
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

  it('GridLiveRegion announces sort/filter/selection from messages (PR-125)', () => {
    expect(load('ui/a11y/GridLiveRegion.tsx')).toContain('aria-live="polite"');
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('GridLiveRegion');
    expect(load('ui/locales/fa.ts')).toContain('a11y.sortedAsc');
    expect(load('docs/public-api.md')).toContain('GridLiveRegion');
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
    expect(load('ui/locales/fa.ts')).toContain('general.exportToPdf');
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
    expect(load('ui/locales/fa.ts')).toContain('general.importFromExcel');
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

describe('PR-81 ColumnDef mapper (D14)', () => {
  it('exports ColumnDef and a bidirectional mapper without React in domain', () => {
    expect(load('domain/types/ColumnDef.ts')).toContain(
      'export interface ColumnDef',
    );
    expect(load('domain/types/ColumnDef.ts')).not.toMatch(
      /from ['"]react['"]/,
    );
    expect(load('infrastructure/columns/mapColumnDef.ts')).toContain(
      'export function toColumnSchema',
    );
    expect(load('infrastructure/columns/mapColumnDef.ts')).toContain(
      'export function toColumnDef',
    );
    expect(load('publish/entry.ts')).toContain('ColumnDef');
    expect(load('publish/entry.ts')).toContain('toColumnDef');
    expect(load('ui/cellRenderer/index.tsx')).not.toContain('ColumnDef');
    expect(load('ui/cellRenderer/cellRegistry.ts')).not.toContain('ColumnDef');
  });

  it('docs say ColumnDef mapper exists', () => {
    const publicApi = load('docs/public-api.md');
    const started = load('docs/getting-started.md');
    const honesty = load('docs/public-api-honesty.md');
    expect(publicApi).toContain('ColumnDef');
    expect(publicApi).toContain('toColumnSchema');
    expect(started).toContain('toColumnSchema');
    expect(honesty).toContain('**live** (PR-81)');
    expect(load('MIGRATION.md')).toContain('PR-81');
  });
});

describe('PR-82 rowData + getRowId', () => {
  it('wires rowData / columnDefs / getRowId on createERPTable and ERPTable', () => {
    expect(load('bootstrap/type.ts')).toContain('rowData?:');
    expect(load('bootstrap/type.ts')).toContain('columnDefs?:');
    expect(load('bootstrap/type.ts')).toContain('getRowId?:');
    expect(load('ui/index.tsx')).toContain('columnDefs');
    expect(load('ui/index.tsx')).toContain('rowData');
    expect(load('domain/entities/Row.ts')).toContain('public data?:');
    expect(load('infrastructure/rows/mapRowData.ts')).toContain(
      'export function mapRowDataToRowInputs',
    );
    expect(load('publish/entry.ts')).toContain('mapRowDataToRowInputs');
    expect(load('bootstrap/type.ts')).toContain('@deprecated Prefer `columnDefs`');
    expect(load('bootstrap/type.ts')).toContain('@deprecated Prefer `rowData`');
    expect(load('engine/tableEngine.ts')).toContain('applyHostRowData');
  });

  it('docs describe the rowData path', () => {
    expect(load('docs/public-api.md')).toContain('rowData');
    expect(load('docs/getting-started.md')).toContain('rowData');
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-82)');
    expect(load('MIGRATION.md')).toContain('PR-82');
  });
});

describe('PR-83 optional store / tableKey / actor', () => {
  it('makes store, tableKey, and actor optional on the config type', () => {
    const config = load('bootstrap/type.ts');
    expect(config).toContain('store?: string');
    expect(config).toContain('tableKey?: string');
    expect(config).toContain('actor?: Actor');
    expect(load('bootstrap/defaults.ts')).toContain('DEFAULT_MEMORY_STORE');
    expect(load('bootstrap/defaults.ts')).toContain('DEFAULT_GRID_ACTOR');
    expect(load('bootstrap/index.ts')).toContain('LocalTableRepository');
    expect(load('bootstrap/index.ts')).toContain('persist && typeof indexedDB');
    expect(load('ui/useERPTable.ts')).toContain('createGridTableKey');
    expect(load('publish/entry.ts')).toContain('DEFAULT_GRID_ACTOR');
  });

  it('docs describe the zero-config path', () => {
    expect(load('docs/public-api.md')).toContain('omit `store`');
    expect(load('docs/getting-started.md')).toContain('no `store` means in-memory');
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-83)');
    expect(load('MIGRATION.md')).toContain('PR-83');
  });
});

describe('PR-84 createGrid sync + lazy hydrate (D24)', () => {
  it('exports a sync createGrid and a deprecated async createERPTable alias', () => {
    const bootstrap = load('bootstrap/index.ts');
    expect(bootstrap).toContain('export function createGrid');
    expect(bootstrap).not.toMatch(/export async function createGrid/);
    expect(bootstrap).toContain('export function createERPTable');
    expect(bootstrap).toContain('@deprecated Prefer {@link createGrid}');
    expect(bootstrap).toContain('return createGrid(config).ready');
    expect(load('bootstrap/type.ts')).toContain(
      'readonly ready: Promise<CreateGridResult<TRow>>',
    );
    expect(load('ui/useERPTable.ts')).toContain('createGrid');
    expect(load('ui/useERPTable.ts')).toContain('grid.ready');
    expect(load('publish/entry.ts')).toContain('createGrid');
    expect(load('publish/headless.ts')).toContain('createGrid, createERPTable');
    expect(load('index.ts')).toContain('createGrid, createERPTable');
  });

  it('docs describe both paths and the migration row', () => {
    expect(load('docs/public-api.md')).toContain('createGrid');
    expect(load('docs/getting-started.md')).toContain('await grid.ready');
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-84)');
    expect(load('MIGRATION.md')).toContain('PR-84');
    expect(load('MIGRATION.md')).toContain('await grid.ready');
    expect(load('MIGRATION.md')).toContain('PR-131');
  });
});

describe('PR-85 React event props from EVENT_CATALOG', () => {
  it('wires host callbacks on ERPTable and maps CELL_CHANGED', () => {
    const props = load('ui/index.tsx');
    expect(props).toContain('onCellValueChanged?:');
    expect(props).toContain('onRowValueChanged?:');
    expect(props).toContain('onSelectionChanged?:');
    expect(props).toContain('onCellFocused?:');
    expect(props).toContain('onRowDataUpdated?:');
    expect(props).toContain('onGridReady?:');
    expect(load('ui/host/useGridHostEvents.ts')).toContain('bindGridHostEvents');
    expect(load('application/events/hostGridEvents.ts')).toContain(
      'CELL_CHANGED',
    );
    expect(load('application/events/hostGridEvents.ts')).toContain(
      "colId: cell.colId",
    );
    expect(load('application/events/eventCatalog.ts')).toContain(
      'onCellValueChanged',
    );
    expect(load('publish/entry.ts')).toContain('CellValueChangedEvent');
  });

  it('docs describe the React event props', () => {
    expect(load('docs/public-api.md')).toContain('onCellValueChanged');
    expect(load('docs/getting-started.md')).toContain('onCellValueChanged');
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-85)');
    expect(load('MIGRATION.md')).toContain('PR-85');
  });
});

describe('PR-86 GridApi / apiRef', () => {
  it('exposes GridApi on createGrid and apiRef on ERPTable; class leaves `.`', () => {
    expect(load('ui/index.tsx')).toContain('apiRef?:');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('export type GridApi');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('getRowNode');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('setRowData');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('refreshCells');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('getSelectedRows');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('deselectAll');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('startEditingCell');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('stopEditing');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('exportDataAsExcel');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('undo');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('redo');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('getColumnState');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('applyColumnState');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('setColumnVisible');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('autoSizeColumns');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('sizeColumnsToFit');
    expect(load('engine/tableEngine.ts')).toContain("case 'SET_COLUMN_VISIBLE'");
    expect(load('bootstrap/index.ts')).toContain('createGridApi');
    expect(load('ui/host/bindGridHostEvents.ts')).toContain('api: GridApi');
    expect(load('publish/entry.ts')).toContain('createGridApi');
    expect(load('publish/entry.ts')).toContain('export type { UITableController }');
    expect(load('publish/entry.ts')).not.toMatch(
      /export \{ UITableController \}/,
    );
    expect(load('publish/headless.ts')).toContain(
      'export { UITableController }',
    );
  });

  it('docs describe GridApi and the `.` move', () => {
    expect(load('docs/public-api.md')).toContain('GridApi');
    expect(load('docs/getting-started.md')).toContain('apiRef');
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-86)');
    expect(load('MIGRATION.md')).toContain('PR-86');
  });
});

describe('PR-87 D13 public rename', () => {
  it('exports DataGrid / useGrid / themeDefault with deprecated aliases', () => {
    const ui = load('ui/index.tsx');
    expect(ui).toContain('export function DataGrid');
    expect(ui).toContain('@deprecated Use {@link DataGrid}');
    expect(ui).toContain('export const ERPTable = DataGrid');
    expect(ui).toContain('className="pdg-grid erp-table"');
    expect(load('ui/useERPTable.ts')).toContain('export function useGrid');
    expect(load('ui/useERPTable.ts')).toContain('@deprecated Use {@link useGrid}');
    expect(load('ui/theme/GridTheme.ts')).toContain('export const themeDefault');
    expect(load('ui/theme/GridTheme.ts')).toContain('@deprecated Use {@link themeDefault}');
    expect(load('ui/theme/GridTheme.ts')).toContain('export const themeDark');
    expect(load('publish/entry.ts')).toContain('DataGrid, ERPTable');
    expect(load('publish/entry.ts')).toContain('themeDefault');
    expect(load('publish/entry.ts')).toContain('useGrid, useERPTable');
    expect(load('index.ts')).toContain("export { useGrid, useERPTable } from './ui/useERPTable'");
    expect(load('ui/styles/erp-table.css')).toContain('.pdg-grid');
    expect(load('ui/styles/erp-table.css')).toContain('--pdg-accent');
    expect(load('ui/styles/erp-table.css')).toContain('--erp-accent: var(--pdg-accent)');
  });

  it('docs describe the D13 rename and aliases', () => {
    expect(load('docs/public-api.md')).toContain('DataGrid');
    expect(load('docs/getting-started.md')).toContain('DataGrid');
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-87)');
    expect(load('MIGRATION.md')).toContain('PR-87');
    expect(load('MIGRATION.md')).toContain('themeDefault');
    expect(load('scripts/codemod-v0.7.mjs')).toContain('DataGrid');
  });
});

describe('PR-88 end-to-end DataGrid<TRow>', () => {
  it('threads TRow on config, events, apiRef, and createGrid', () => {
    expect(load('bootstrap/type.ts')).toContain('CreateERPTableConfig<TRow');
    expect(load('bootstrap/type.ts')).toContain('rowData?: readonly TRow[]');
    expect(load('bootstrap/type.ts')).toContain('columnDefs?: ColDefOrGroup<NoInfer<TRow>>[]');
    expect(load('bootstrap/index.ts')).toContain('export function createGrid<TRow');
    expect(load('ui/index.tsx')).toContain('extends CreateERPTableConfig<TRow>');
    expect(load('ui/index.tsx')).toContain('CellValueChangedEvent<NoInfer<TRow>>');
    expect(load('ui/useERPTable.ts')).toContain('export function useGrid<TRow');
    expect(load('ui/data-grid-generics.typecheck.tsx')).toContain('expectTypeOf');
    expect(load('ui/data-grid-generics.typecheck.tsx')).toContain('@ts-expect-error');
    expect(load('ui/data-grid-generics.typecheck.tsx')).toContain('InferredInvoiceGrid');
    expect(load('domain/types/ColumnDef.ts')).toContain('export type ColumnField');
  });

  it('docs describe the 60-second generic path', () => {
    expect(load('docs/getting-started.md')).toContain('## 60-second path');
    expect(load('docs/getting-started.md')).toContain('DataGrid<Invoice>');
    expect(load('docs/getting-started.md')).toContain('onCellValueChanged={(e) => save(e.data)}');
    expect(load('docs/public-api.md')).toContain('PR-88');
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-88)');
    expect(load('MIGRATION.md')).toContain('PR-88');
    expect(load('README.md')).toContain('DataGrid<Invoice>');
  });
});

describe('PR-89 applySort / SortModel', () => {
  it('exports a pure applySort (PR-89 core)', () => {
    expect(load('engine/dataOps/sortModel.ts')).toContain('export function applySort');
    expect(load('engine/dataOps/sortModel.ts')).toContain('export type SortModel');
    expect(load('publish/entry.ts')).toContain('applySort');
    expect(load('publish/headless.ts')).toContain('applySort');
    expect(load('index.ts')).toContain('applySort');
  });

  it('docs describe the core function as unwired to the header', () => {
    expect(load('docs/public-api.md')).toContain('applySort');
    expect(load('docs/public-api.md')).toContain('PR-89');
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-89)');
    expect(load('docs/getting-started.md')).toContain('applySort');
    expect(load('MIGRATION.md')).toContain('PR-89');
  });
});

describe('PR-90 sort wired to SparseRowIndex', () => {
  it('exposes SET_SORT_MODEL and rebuilds the index from SortModel', () => {
    expect(load('application/commands/index.ts')).toContain("type: 'SET_SORT_MODEL'");
    expect(load('infrastructure/ui/uiEvents.ts')).toContain("type: 'UI_SET_SORT_MODEL'");
    expect(load('engine/tableEngine.ts')).toContain("case 'SET_SORT_MODEL'");
    expect(load('engine/ViewStateBuilder.ts')).toContain('applySort');
    expect(load('engine/type.ts')).toContain('sortModel: SortModel');
    expect(load('infrastructure/ui/UITableController.ts')).toContain('setSortModel');
  });

  it('docs describe session sort without claiming header UI', () => {
    expect(load('docs/public-api.md')).toContain('SET_SORT_MODEL');
    expect(load('docs/public-api-honesty.md')).toContain('PR-90');
    expect(load('docs/getting-started.md')).toContain('SET_SORT_MODEL');
    expect(load('MIGRATION.md')).toContain('PR-90');
  });
});

describe('PR-91 header sort UI', () => {
  it('wires aria-sort and click-vs-drag threshold on the desktop header', () => {
    const header = load('ui/desktop/ERPTableHeader.tsx');
    expect(header).toContain('aria-sort={ariaSort}');
    expect(header).toContain('HEADER_SORT_CLICK_MAX_MOVE_PX');
    expect(header).toContain('cycleSortModel');
    expect(header).toContain('controller.setSortModel');
    expect(load('engine/dataOps/sortModel.ts')).toContain(
      'export function shouldCommitHeaderSortClick',
    );
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('getSortModel');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('setSortModel');
  });

  it('docs claim header sort as live', () => {
    expect(load('docs/public-api-honesty.md')).toContain('Header click / `aria-sort`');
    expect(load('docs/public-api-honesty.md')).toContain('live** (PR-91)');
    expect(load('docs/getting-started.md')).toContain('Desktop header clicks (PR-91)');
    expect(load('MIGRATION.md')).toContain('PR-91');
    expect(load('demo/src/LiveGridPreview.tsx')).toContain('data-demo-sort-hint');
  });
});

describe('PR-92 applyFilter / FilterModel', () => {
  it('exports a pure applyFilter (PR-92 core)', () => {
    expect(load('engine/dataOps/filterModel.ts')).toContain('export function applyFilter');
    expect(load('engine/dataOps/filterModel.ts')).toContain('export type FilterModel');
    expect(load('engine/dataOps/filterModel.ts')).toContain('normalizeFilterText');
    expect(load('publish/entry.ts')).toContain('applyFilter');
    expect(load('publish/headless.ts')).toContain('applyFilter');
    expect(load('index.ts')).toContain('applyFilter');
  });

  it('docs describe the core function as unwired to the row index', () => {
    expect(load('docs/public-api.md')).toContain('applyFilter');
    expect(load('docs/public-api.md')).toContain('PR-92');
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-92)');
    expect(load('docs/getting-started.md')).toContain('applyFilter');
    expect(load('MIGRATION.md')).toContain('PR-92');
  });
});

describe('PR-93 quickFilterText hides rows', () => {
  it('wires SET_QUICK_FILTER_TEXT and QuickFilterIndex', () => {
    expect(load('engine/dataOps/quickFilter.ts')).toContain('export class QuickFilterIndex');
    expect(load('engine/dataOps/quickFilter.ts')).toContain('export function applyQuickFilter');
    expect(load('application/commands/index.ts')).toContain("type: 'SET_QUICK_FILTER_TEXT'");
    expect(load('engine/ViewStateBuilder.ts')).toContain('applyQuickFilter');
    expect(load('infrastructure/ui/UITableController.ts')).toContain('setQuickFilterText');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('setQuickFilter');
    expect(load('bootstrap/type.ts')).toContain('quickFilterText?: string');
  });

  it('docs separate quick filter from GridSearchPanel', () => {
    expect(load('docs/public-api-honesty.md')).toContain('quickFilterText` **live** (PR-93)');
    expect(load('docs/public-api-honesty.md')).toContain('GridSearchPanel` remains find-and-navigate');
    expect(load('docs/getting-started.md')).toContain('Quick filter vs grid search');
    expect(load('MIGRATION.md')).toContain('PR-93');
    expect(load('demo/src/LiveGridPreview.tsx')).toContain('data-demo-quick-filter');
  });
});

describe('PR-94 column filter UI', () => {
  it('wires SET_FILTER_MODEL, header popover, and floatingFilter', () => {
    expect(load('application/commands/index.ts')).toContain("type: 'SET_FILTER_MODEL'");
    expect(load('engine/ViewStateBuilder.ts')).toContain('applyFilter');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('setFilterModel');
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('data-pdg-filter-btn');
    expect(load('ui/desktop/ColumnFilterPopover.tsx')).toContain('useThemePortalStyle');
    expect(load('ui/index.tsx')).toContain('floatingFilter');
  });

  it('docs claim column filter UI as live', () => {
    expect(load('docs/public-api-honesty.md')).toContain('Column filter UI **live** (PR-94)');
    expect(load('docs/getting-started.md')).toContain('SET_FILTER_MODEL');
    expect(load('MIGRATION.md')).toContain('PR-94');
  });
});

describe('PR-95 custom filter components', () => {
  it('wires filterComponents registry and custom ColumnDef.filter', () => {
    expect(load('ui/filters/filterRegistry.ts')).toContain('FilterComponentMap');
    expect(load('engine/dataOps/filterModel.ts')).toContain('resolveFilterUi');
    expect(load('ui/index.tsx')).toContain('filterComponents?: FilterComponentMap');
    expect(load('demo/src/LiveGridPreview.tsx')).toContain('فقط مبالغ رُند');
  });

  it('docs claim custom filter components as live', () => {
    expect(load('docs/public-api-honesty.md')).toContain(
      'Custom filter components **live** (PR-95)',
    );
    expect(load('docs/cell-components.md')).toContain('filterComponents');
    expect(load('docs/cell-components.md')).toContain('فقط مبالغ رُند');
    expect(load('MIGRATION.md')).toContain('PR-95');
  });
});

describe('PR-96 server / infinite datasource', () => {
  it('wires rowModelType and GridDatasource getRows', () => {
    expect(load('application/ports/GridDatasource.ts')).toContain('getRows');
    expect(load('bootstrap/type.ts')).toContain('rowModelType');
    expect(load('bootstrap/type.ts')).toContain('datasource');
    expect(load('engine/ViewStateBuilder.ts')).toContain('isServerRowModel');
    expect(load('application/rowModel/attachServerRowModel.ts')).toContain(
      'attachServerRowModel',
    );
  });

  it('docs claim server datasource contract as live', () => {
    expect(load('docs/public-api-honesty.md')).toContain(
      'Server/infinite datasource **live** (PR-96 / PR-102)',
    );
    expect(load('docs/getting-started.md')).toContain("rowModelType: 'infinite'");
    expect(load('MIGRATION.md')).toContain('PR-96');
  });
});

describe('PR-102 infinite / serverSide block cache', () => {
  it('wires BlockCache, refreshServerSide, cache options', () => {
    expect(load('engine/dataOps/blockCache.ts')).toContain('class BlockCache');
    expect(load('application/rowModel/attachServerRowModel.ts')).toContain(
      'refreshServerSide',
    );
    expect(load('bootstrap/type.ts')).toContain('cacheBlockSize');
    expect(load('bootstrap/type.ts')).toContain('maxBlocksInCache');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain(
      'refreshServerSide',
    );
  });

  it('docs claim block cache as live', () => {
    expect(load('docs/public-api-honesty.md')).toContain(
      'block cache** **live** (PR-102)',
    );
    expect(load('docs/getting-started.md')).toContain('cacheBlockSize');
    expect(load('MIGRATION.md')).toContain('maxBlocksInCache');
  });
});

describe('PR-103 loading / no-rows overlays', () => {
  it('docs claim overlays as live', () => {
    expect(load('docs/public-api-honesty.md')).toContain(
      'Loading / no-rows overlays + infinite skeleton **live** (PR-103)',
    );
    expect(load('docs/getting-started.md')).toContain('loadingOverlayComponent');
    expect(load('docs/public-api.md')).toContain('noRowsOverlayComponent');
  });
});

describe('PR-104 cell range model', () => {
  it('exports pure cell range helpers from headless', () => {
    expect(load('engine/selection/cellRange.ts')).toContain('export type CellRange');
    expect(load('engine/selection/cellRange.ts')).toContain('shiftArrowCell');
    expect(load('publish/headless.ts')).toContain('clickCell');
    expect(load('docs/public-api-honesty.md')).toContain(
      'Cell-range **model** **live** on `/headless` (PR-104)',
    );
  });
});

describe('PR-105 cell range UI', () => {
  it('docs and API claim cell range UI as live', () => {
    expect(load('docs/public-api-honesty.md')).toContain(
      'Cell-range **UI** **live** (PR-105)',
    );
    expect(load('docs/public-api.md')).toContain('getCellRanges');
    expect(load('infrastructure/ui/createGridApi.ts')).toContain('addCellRange');
    expect(load('ui/styles/erp-table.css')).toContain('--pdg-range-bg');
  });
});

describe('PR-108 fill handle', () => {
  it('docs and code claim fill handle as live', () => {
    expect(load('docs/public-api-honesty.md')).toContain(
      'Fill handle** **live** (PR-108)',
    );
    expect(load('ui/desktop/FillHandle.tsx')).toContain('pdg-fill-handle');
    expect(load('engine/selection/fillHandle.ts')).toContain('buildFillUpdates');
    expect(load('ui/styles/erp-table.css')).toContain('.pdg-fill-handle');
  });
});

describe('PR-107 system clipboard paste', () => {
  it('docs and code claim Ctrl+V clipboard paste as live', () => {
    expect(load('docs/public-api-honesty.md')).toContain(
      'clipboard paste** **live** (PR-107)',
    );
    expect(load('docs/public-api.md')).toContain('pasteAddsRows');
    expect(load('infrastructure/ui/UITableKeyboardHandler.ts')).toMatch(
      /ctrlKey && !altKey[\s\S]*pasteCells/,
    );
    expect(load('engine/selection/clipboardPaste.ts')).toContain(
      'parseDelimitedClipboardText',
    );
    expect(load('application/commands/index.ts')).toContain('PASTE_CELLS');
  });
});

describe('PR-106 system clipboard copy', () => {
  it('docs and code claim Ctrl+C clipboard copy as live', () => {
    expect(load('docs/public-api-honesty.md')).toContain(
      'clipboard copy** **live** (PR-106)',
    );
    expect(load('docs/public-api.md')).toContain('copyFormattedValue');
    expect(load('infrastructure/ui/UITableKeyboardHandler.ts')).toContain(
      'ctrlKey && !altKey',
    );
    expect(load('engine/selection/clipboardCopy.ts')).toContain(
      'buildClipboardPayload',
    );
    expect(load('README.md')).toContain('Ctrl+C');
  });
});

describe('PR-97 virtualization default on (D17)', () => {
  it('defaults on when session exists; false keeps pagination', () => {
    const resolve = load('ui/desktop/resolveDesktopVirtualization.ts');
    expect(resolve).toContain('virtualization === false');
    expect(resolve).not.toContain('virtualization === true && !!session');
    expect(load('ui/desktop/DesktopTable.tsx')).toMatch(/On by default/i);
  });

  it('docs and migration claim the flip', () => {
    expect(load('docs/public-api-honesty.md')).toContain(
      'Desktop virtualization **default on** (PR-97 / D17)',
    );
    expect(load('docs/public-api.md')).toContain('Desktop virtualization (default **on**)');
    expect(load('MIGRATION.md')).toContain('PR-97');
    expect(load('MIGRATION.md')).toContain('virtualization={false}');
  });
});

describe('PR-98 column virtualization', () => {
  it('wires shared ColumnWindow across desktop chrome', () => {
    expect(load('engine/ColumnViewport.ts')).toContain('calculateColumnViewport');
    expect(load('engine/ViewportCalculator.ts')).toContain('calculateColumns');
    expect(load('ui/desktop/DesktopTable.tsx')).toContain('ColumnWindowProvider');
    expect(load('ui/desktop/ERPTableHeader.tsx')).toContain('ColumnWindowCells');
    expect(load('ui/desktop/eRPTableRow.tsx')).toContain('ColumnWindowCells');
  });

  it('docs claim column virtualization as live', () => {
    expect(load('docs/public-api-honesty.md')).toContain(
      'Column virtualization **live** (PR-98)',
    );
    expect(load('docs/public-api.md')).toContain('Column virtualization (PR-98)');
    expect(load('MIGRATION.md')).toContain('PR-98');
  });
});

describe('PR-100 grid performance numbers', () => {
  it('docs claim published 100k numbers as live', () => {
    expect(load('docs/public-api-honesty.md')).toContain(
      '100k performance numbers published** (PR-100)',
    );
    expect(load('docs/public-api.md')).toContain('Performance (PR-100');
    expect(load('docs/performance.md')).toContain('1675 ms');
    expect(load('README.md')).toContain('## Performance');
  });

  it('docs claim memory budget as live (PR-101)', () => {
    expect(load('docs/public-api-honesty.md')).toContain('215 MB');
    expect(load('docs/public-api-honesty.md')).toContain('PR-101');
    expect(load('docs/performance.md')).toContain('215 MB');
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
    sideEffects?: unknown;
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
    expect(publicApi).toMatch(/`dist\/`/);
    expect(publicApi).toMatch(/LICENSE/);
    expect(publicApi).toMatch(/OFL\.txt/);
    expect(pkg.files).toEqual(['dist', 'LICENSE', 'OFL.txt']);
    expect(pkg.exports?.['./styles.css']).toBe('./dist/styles.css');
    expect(pkg.exports?.['./plugins/excel']).toBeTruthy();
    expect(pkg.exports?.['./headless']).toBeTruthy();
  });

  it('README and public-api require explicit CSS import (PR-77 / D16)', () => {
    expect(readme).toContain("import 'persian-data-grid/styles.css'");
    expect(readme).toContain('injectGridStyles');
    expect(publicApi).toContain("import 'persian-data-grid/styles.css'");
    expect(publicApi).toContain('injectGridStyles');
    expect(publicApi).toMatch(/unstyled/i);
    expect(publicApi).not.toMatch(/injected at runtime via `injectStyles` \*\*and\*\*/);
    expect(pkg.sideEffects).toEqual(['**/*.css']);
    expect(load('docs/getting-started.md')).toContain(
      "import 'persian-data-grid/styles.css'",
    );
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
    expect(load('ui/index.tsx')).toContain('export function DataGrid');
    expect(load('ui/index.tsx')).toContain('export const ERPTable');
    expect(load('ui/desktop/pagination.tsx').length).toBeGreaterThan(0);
    expect(load('ui/desktop/indexCol.tsx').length).toBeGreaterThan(0);
    expect(load('ui/primitives/DatePicker.tsx')).toContain('useDateAdapter');
    expect(load('ui/date/PersianRangeDatePicker.tsx')).not.toContain(
      "from 'react-persian-range-picker'",
    );

    // RTL-native
    expect(byLabel['RTL-native']).toBeTruthy();
    expect(load('ui/host/ERPTableHost.tsx')).toMatch(/direction|rtl/i);
    expect(load('ui/primitives/DatePicker.tsx')).toContain('DateAdapter');
    expect(load('package.json')).not.toContain('react-persian-range-picker');

    // Cell keyboard navigation (honest — Excel clipboard round-trip)
    expect(byLabel['Cell keyboard navigation']).toBeTruthy();
    expect(byLabel['Cell keyboard navigation']).toMatch(/Ctrl\+C\/X\/V/i);
    expect(byLabel['Cell keyboard navigation']).toMatch(/Home\/End/i);
    expect(byLabel['Cell keyboard navigation']).toMatch(/keyboard\.md/i);
    const keys = load('infrastructure/ui/UITableKeyboardHandler.ts');
    expect(keys).toContain("case 'Tab'");
    expect(keys).toContain("case 'Home'");
    expect(keys).toContain("case 'End'");
    expect(keys).toContain("case 'ArrowLeft'");
    expect(keys).toContain("case 'Enter'");
    expect(load('docs/keyboard.md')).toContain('Ctrl+C');
    expect(load('ui/keyboard/skipGridNavigation.ts')).toContain('ArrowUp');

    // VirtualList — default on; pagination via virtualization={false}
    expect(byLabel.VirtualList).toBeTruthy();
    expect(byLabel.VirtualList).toMatch(/on by default/i);
    expect(byLabel.VirtualList).toMatch(/virtualization=\{false\}/i);
    expect(load('publish/entry.ts')).toContain('VirtualList');
    expect(load('ui/desktop/resolveDesktopVirtualization.ts')).toContain(
      'virtualization === false',
    );
    expect(load('ui/desktop/resolveDesktopVirtualization.ts')).not.toContain(
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
    const bullets = featureBullets();
    const virtual = bullets.find((b) => b.includes('VirtualList'));
    expect(virtual).toBeTruthy();
    expect(virtual!).not.toMatch(/tens of thousands/i);
    expect(virtual!).toMatch(/on by default/i);
    expect(virtual!).not.toMatch(/opt-in/i);
  });
});

describe('PR-120 row grouping engine', () => {
  it('wires groupBy into index, commands, and GridApi', () => {
    expect(load('engine/dataOps/rowGrouping.ts')).toContain('buildGroupedFlatIndex');
    expect(load('engine/ViewStateBuilder.ts')).toContain('buildGroupedFlatIndex');
    expect(load('application/commands/index.ts')).toContain(
      "type: 'SET_ROW_GROUP_COLUMNS'",
    );
    expect(load('infrastructure/ui/uiEvents.ts')).toContain(
      "type: 'UI_SET_ROW_GROUP_COLUMNS'",
    );
    expect(load('engine/tableEngine.ts')).toContain("case 'SET_ROW_GROUP_COLUMNS'");
    expect(load('infrastructure/ui/createGridApi.ts')).toContain(
      'setRowGroupColumns',
    );
    expect(load('bootstrap/type.ts')).toContain('groupBy?:');
  });

  it('docs describe session grouping engine', () => {
    expect(load('docs/public-api.md')).toContain('groupBy');
    expect(load('docs/public-api.md')).toContain('PR-120');
    expect(load('docs/getting-started.md')).toContain('groupBy');
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-120)');
  });
});

describe('PR-121 group row UI honesty', () => {
  it('ships ERPTableGroupRow with a11y and keyboard wiring', () => {
    expect(load('ui/desktop/ERPTableGroupRow.tsx')).toContain('aria-expanded');
    expect(load('ui/desktop/ERPTableGroupRow.tsx')).toContain('aria-level');
    expect(load('infrastructure/ui/UITableKeyboardHandler.ts')).toContain(
      'toggleRowGroupById',
    );
    expect(load('docs/public-api.md')).toContain('ERPTableGroupRow');
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-121)');
  });
});

describe('PR-136 GridHistoryPanel honesty', () => {
  it('exports product history panel and documents it live', () => {
    expect(load('publish/entry.ts')).toContain('GridHistoryPanel');
    expect(load('ui/history/GridHistoryPanel.tsx')).toContain('data-pdg-history-panel');
    expect(load('ui/history/GridHistoryPanel.tsx')).toContain('data-pdg-history-restore');
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-136)');
    expect(load('examples/gallery/src/examples/historyAudit.tsx')).toContain(
      'GridHistoryPanel',
    );
  });
});

describe('PR-137 GridOfflineStatus honesty', () => {
  it('exports offline status and documents recovery', () => {
    expect(load('publish/entry.ts')).toContain('GridOfflineStatus');
    expect(load('application/offline/OfflineStatus.ts')).toContain('markSynced');
    expect(load('ui/offline/GridOfflineStatus.tsx')).toContain(
      'data-pdg-offline-status',
    );
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-137)');
    expect(load('examples/gallery/src/examples/offlineStatus.tsx')).toContain(
      'GridOfflineStatus',
    );
  });
});

describe('PR-138 SyncPort honesty', () => {
  it('exports sync port, panel, and documents policies', () => {
    expect(load('publish/sync.ts')).toContain('GridSyncPanel');
    expect(load('publish/headless.ts')).toContain('InMemorySyncHub');
    expect(load('publish/headless.ts')).toContain('GridSyncService');
    expect(load('package.json')).toContain('"./sync"');
    expect(load('application/ports/SyncPort.ts')).toContain('lastWriteWins');
    expect(load('ui/sync/GridSyncPanel.tsx')).toContain('data-pdg-sync-panel');
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-138)');
    expect(load('examples/gallery/src/examples/syncConflicts.tsx')).toContain(
      'GridSyncPanel',
    );
  });
});

describe('PR-139 Presence honesty', () => {
  it('exports presence panel on subpath and documents transport', () => {
    expect(load('publish/presence.ts')).toContain('GridPresencePanel');
    expect(load('publish/headless.ts')).toContain('InMemoryPresenceHub');
    expect(load('publish/headless.ts')).toContain(
      'createBroadcastChannelPresenceTransport',
    );
    expect(load('package.json')).toContain('"./presence"');
    expect(load('ui/presence/GridPresencePanel.tsx')).toContain(
      'data-pdg-presence-panel',
    );
    expect(load('docs/public-api-honesty.md')).toContain('**live** (PR-139)');
    expect(load('examples/gallery/src/examples/presencePeers.tsx')).toContain(
      'GridPresencePanel',
    );
  });
});
