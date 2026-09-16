import type { FilterModel } from '../../engine/dataOps/filterModel';
import type { SortModel } from '../../engine/dataOps/sortModel';
import type { RowModelType } from '../../engine/dataOps/rowModel';

export type { RowModelType } from '../../engine/dataOps/rowModel';
export {
  isServerRowModel,
  pageWindow,
} from '../../engine/dataOps/rowModel';

/**
 * Host-provided row source for `rowModelType: 'infinite' | 'serverSide'` (PR-96).
 * Block cache / LRU / `refreshServerSide` — PR-102.
 */
export type GridDatasourceGetRowsParams = {
  startRow: number;
  endRow: number;
  sortModel: SortModel;
  filterModel: FilterModel;
};

export type GridDatasourceGetRowsResult<TRow = unknown> = {
  rows: TRow[];
  /** Total row count when known; drives pagination. */
  lastRow?: number;
};

export interface GridDatasource<TRow = unknown> {
  getRows(
    p: GridDatasourceGetRowsParams,
  ): Promise<GridDatasourceGetRowsResult<TRow>>;
}
