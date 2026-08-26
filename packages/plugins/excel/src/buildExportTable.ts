import type {
  ExportColumnDef,
  ExportSource,
} from '../../../../application/plugins/GridPlugin';
import { formatExportValue } from './formatExportValue';

const EMPTY_PLACEHOLDERS = new Set(['انتخاب کنید', 'select', 'Select']);

export type ExportTable = {
  columns: Array<{ fieldName: string; caption: string }>;
  /** Parallel to columns; already stringified cell text */
  rows: string[][];
};

const hasMeaningfulValue = (value: unknown) =>
  value !== undefined && value !== null && value !== '';

function cellText(
  source: ExportSource['rows'][number],
  column: ExportColumnDef,
): string {
  const cell = source.cells[column.fieldName];
  if (!cell) return '';

  const raw = hasMeaningfulValue(cell.display) ? cell.display : cell.value;
  if (!hasMeaningfulValue(raw)) return '';

  const text = formatExportValue(raw, column.fieldType).trim();
  if (!text || EMPTY_PLACEHOLDERS.has(text)) return '';
  return text;
}

/**
 * Builds a dense string matrix from ExportSource (plugin query port).
 */
export function buildExportTable(source: ExportSource): ExportTable {
  const columnsWithData = source.columns.filter((column) =>
    source.rows.some((row) => cellText(row, column) !== ''),
  );

  return {
    columns: columnsWithData.map((c) => ({
      fieldName: c.fieldName,
      caption: c.fieldCaption ?? c.fieldName,
    })),
    rows: source.rows.map((row) =>
      columnsWithData.map((col) => cellText(row, col)),
    ),
  };
}
