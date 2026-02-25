// index.tsx – نقطه خروجی کامپوننت

export { ERPTable } from './ui';
export { CellRenderer } from './ui/cellRenderer';
export { TableEngine } from './engine/tableEngine';

export { createERPTable } from './bootstrap';
export type {
  CreateERPTableConfig,
  FieldType,
  IDetailColumnConfig,
} from './bootstrap/type';
