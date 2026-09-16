import { DataGrid } from 'persian-data-grid';
import 'persian-data-grid/styles.css';
import type { ColumnDef } from 'persian-data-grid';

export type DemoRow = {
  id: string;
  item: string;
  qty: number;
  price: number;
  category: string;
  date: string;
};

export const DEMO_ROWS: DemoRow[] = [
  { id: '1', item: 'Cable', qty: 12, price: 120_000, category: 'Parts', date: '1404-01-15' },
  { id: '2', item: 'Switch', qty: 4, price: 85_000, category: 'Parts', date: '1404-01-18' },
  { id: '3', item: 'Service', qty: 1, price: 500_000, category: 'Labor', date: '1404-02-01' },
  { id: '4', item: 'Bracket', qty: 20, price: 15_000, category: 'Parts', date: '1404-02-05' },
  { id: '5', item: 'Install', qty: 2, price: 250_000, category: 'Labor', date: '1404-02-10' },
];

export const BASE_COLUMNS: ColumnDef<DemoRow>[] = [
  { field: 'item', headerName: 'Item' },
  { field: 'qty', headerName: 'Qty', type: 'number' },
  { field: 'price', headerName: 'Price', type: 'price' },
  { field: 'category', headerName: 'Category' },
  { field: 'date', headerName: 'Date', type: 'date' },
];

export { DataGrid };
