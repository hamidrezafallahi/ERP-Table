import { useMemo } from 'react';
import {
  DataGrid,
  type ColumnDef,
  type GridDatasource,
} from 'persian-data-grid';
import 'persian-data-grid/styles.css';
import { makeLines, type Line } from '../shared';

const columns: ColumnDef<Line>[] = [
  { field: 'item', headerName: 'Item', sortable: true },
  { field: 'qty', headerName: 'Qty', type: 'number', sortable: true },
  { field: 'price', headerName: 'Price', type: 'price', sortable: true },
  { field: 'category', headerName: 'Category' },
];

/** 06 — Infinite / server-side row model with a mock datasource. */
export default function InfiniteServerExample() {
  const all = useMemo(() => makeLines(5_000), []);
  const datasource = useMemo<GridDatasource<Line>>(
    () => ({
      async getRows(params) {
        await new Promise((r) => setTimeout(r, 80));
        let rows = all;
        const sort = params.sortModel[0];
        if (sort) {
          const dir = sort.sort === 'desc' ? -1 : 1;
          const col = sort.colId as keyof Line;
          rows = [...all].sort((a, b) => {
            const av = a[col];
            const bv = b[col];
            if (av === bv) return 0;
            return av! > bv! ? dir : -dir;
          });
        }
        return {
          rows: rows.slice(params.startRow, params.endRow),
          lastRow: rows.length,
        };
      },
    }),
    [all],
  );

  return (
    <DataGrid<Line>
      rowModelType="infinite"
      datasource={datasource}
      columnDefs={columns}
      getRowId={(r) => r.id}
      recordPerPage={50}
      cacheBlockSize={50}
      tableHeight={360}
    />
  );
}
