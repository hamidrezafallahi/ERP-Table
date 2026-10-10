import type { UITableController } from '../../../../infrastructure/ui/UITableController';
import { RowStateEnum } from '../../../../domain/value-objects';
import type { ExportSource } from '../../../../application/plugins/GridPlugin';
import { buildExportTable } from './buildExportTable';
import { buildXlsxBlob, downloadBlob } from './buildXlsxBlob';
import { exportActiveCollectionToExcelStreaming } from './exportActiveCollectionToExcelStreaming';

export type ExportActiveCollectionResult = {
  rowCount: number;
  columnCount: number;
};

export type ExportActiveCollectionOptions = {
  fileName?: string;
  sheetName?: string;
  direction?: 'rtl' | 'ltr';
  rowHeaderLabel?: string;
  /** When false, skip browser download (tests). */
  download?: boolean;
};

const hasMeaningfulValue = (value: unknown) =>
  value !== undefined && value !== null && value !== '';

/**
 * Imperative facade used by ERP toolbar buttons.
 * Prefer PluginHost.requestExport + ExcelExportPlugin for event-driven hosts.
 */
export async function exportActiveCollectionToExcel(
  controller: UITableController,
  options?: ExportActiveCollectionOptions,
): Promise<ExportActiveCollectionResult> {
  // Page-window mode: only one page is in RAM — stream the full set from
  // IndexedDB instead of materializing rows.
  if (controller.isPagedWindow()) {
    return exportActiveCollectionToExcelStreaming(controller, options);
  }
  const view = controller.getViewState();
  const columns = (
    view?.activeCollectionColumn?.length
      ? view.activeCollectionColumn
      : (view?.columns ?? [])
  )
    .filter((col) => col.fieldType !== 'index')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const rows = (controller.getAllRows() ?? []).filter((row) => {
    if (row.rowState.value === RowStateEnum.Deleted) return false;
    return Array.from(row.getCells().entries()).some(
      ([key, cell]) => key !== 'index' && hasMeaningfulValue(cell.getValue()),
    );
  });

  const source: ExportSource = {
    columns: columns.map((col) => ({
      fieldName: col.fieldName,
      fieldCaption: col.fieldCaption,
      fieldType: col.fieldType,
      order: col.order,
    })),
    rows: rows.map((row) => ({
      id: row.id.value,
      rowState: String(row.rowState.value),
      cells: Object.fromEntries(
        [...row.getCells()].map(([key, cell]) => [
          key,
          { value: cell.getValue(), display: cell.getDisplay() },
        ]),
      ),
    })),
  };

  const table = buildExportTable(source);
  if (table.columns.length === 0 && table.rows.length === 0) {
    throw new Error('NO_COLUMNS');
  }

  const direction = options?.direction ?? 'rtl';
  const rowHeaderLabel = options?.rowHeaderLabel ?? 'ردیف';
  const sheetName = options?.sheetName ?? 'Sheet1';
  const fileName =
    options?.fileName ??
    `export-${new Date().toISOString().slice(0, 10)}.xlsx`;

  await new Promise<void>((resolve) => {
    if (typeof setTimeout === 'function') setTimeout(resolve, 0);
    else resolve();
  });

  const blob = buildXlsxBlob(table, {
    direction,
    rowHeaderLabel,
    sheetName,
  });

  if (options?.download !== false) {
    downloadBlob(blob, fileName);
  }

  return { rowCount: table.rows.length, columnCount: table.columns.length + 1 };
}
