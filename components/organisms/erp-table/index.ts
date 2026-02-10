// index.tsx – نقطه خروجی کامپوننت

export { ERPTable } from './ui/erp-table';
export { CellRenderer } from './ui/erp-table/cellRenderer';
export { TableEngine } from './engine/tableEngine';

export { createERPTable } from './bootstrap';
export type {
  CreateERPTableConfig,
  FieldType,
  IDetailColumnConfig,
} from './bootstrap/type';
