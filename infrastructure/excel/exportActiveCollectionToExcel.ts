/**
 * @deprecated Import from `packages/plugins/excel` (or `persian-data-grid` when published).
 * Kept as a stable path for existing ERP toolbar imports.
 */
export {
  exportActiveCollectionToExcel,
} from '../../packages/plugins/excel/src/exportActiveCollectionToExcel';
export type {
  ExportActiveCollectionOptions,
  ExportActiveCollectionResult,
} from '../../packages/plugins/excel/src/exportActiveCollectionToExcel';
export { parseXlsxBlob } from '../../packages/plugins/excel/src/parseXlsxBlob';
export type { ParsedXlsxSheet } from '../../packages/plugins/excel/src/parseXlsxBlob';
export { mapImportedSheet } from '../../packages/plugins/excel/src/mapImportedSheet';
export { applyImportedRows } from '../../packages/plugins/excel/src/applyImportedRows';
