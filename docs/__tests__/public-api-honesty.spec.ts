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
    expect(load('ui/desktop/eRPTableRow.tsx')).not.toContain('aria-selected');
    expect(doc).toContain('**live** (PR-62)');
  });
});
