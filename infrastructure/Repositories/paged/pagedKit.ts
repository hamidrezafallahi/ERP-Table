// Page-window ('paged-idb') kit — loaded lazily by createGrid so the default
// entry only pays for it when the mode is used.
import { DeleteRowsCommandHandler } from '../../../application/handlers/deleteRowsCommandHandler';
import type { WindowedTableRepository } from '../../../application/ports/TableRepository';
import type { ColumnSchema } from '../../../domain/types/ColumnSchema';
import type { Table } from '../../../domain/entities/Table';
import { Pagination } from '../../../domain/value-objects';

export { DeleteRowsCommandHandler };
export { PagedCachedTableRepository } from './PagedCachedTableRepository';

/**
 * Page-window seeding (persistence 'paged-idb'): first open pushes the full
 * seed to IndexedDB (replaceAll) and keeps ONE page in RAM; re-open reuses the
 * persisted window. Conditional (whenFieldTruthy / whenRemoteFlag) columns that
 * hold data are unhidden in their own collection.
 */
export async function seedWindowedTable(args: {
  repo: WindowedTableRepository;
  store: string;
  tableKey: string;
  table: Table;
  loadedTable?: Table;
  columns: Map<string, ColumnSchema>;
  columnMeta: Map<string, ColumnSchema>;
  page: number;
  pageSize: number;
  activeRowCount: number;
}): Promise<Table> {
  const { repo, store, tableKey, loadedTable, columns, columnMeta, page, pageSize } =
    args;
  let table = args.table;

  if (loadedTable) {
    table.setColumns(Array.from(columns.values()));
    // ویرایش (باز شدن مجدد جدول از IndexedDB): ستون‌های شرطیِ محتوا دار باید
    // در کالکشن خودشان نمایان شوند — حتی کالکشن‌هایی که سطرشان در پنجرهٔ RAM
    // نیست. اسکن مقدار، per-collection روی متای ستون‌ها انجام می‌شود.
    const activeName = table.getActiveCollectionName() ?? 'default';
    const conditionByCollection = new Map<string, Map<string, boolean>>();
    for (const row of table.getCollections().get(activeName)?.getRows().values() ?? []) {
      const cond = row.getVisibilityCondition() ?? {};
      for (const [fieldName, flag] of Object.entries(cond)) {
        if (flag !== true) continue;
        const colCfg =
          columnMeta.get(`${activeName}_${fieldName}`) ?? columnMeta.get(fieldName);
        const coll = colCfg?.fieldCollection ?? activeName;
        (
          conditionByCollection.get(coll) ??
          conditionByCollection.set(coll, new Map()).get(coll)!
        ).set(fieldName, true);
      }
    }
    for (const cfg of columnMeta.values()) {
      const coll = cfg.fieldCollection ?? activeName;
      if (conditionByCollection.get(coll)?.get(cfg.fieldName) !== true) continue;
      const target = table.getCollections().get(coll);
      const cur = target?.getColumns().get(cfg.fieldName);
      if (target && cur) {
        target.getColumns().set(cfg.fieldName, { ...cur, hidden: false });
      }
    }
    const loadedActiveCount =
      table.getCollections().get(table.getActiveCollectionName())?.getRows().size ?? 0;
    const totalRows =
      loadedActiveCount > 0
        ? Math.max(table.getPagination().totalRows, loadedActiveCount)
        : table.getPagination().totalRows;
    table.setPagination(new Pagination(page, pageSize, totalRows));
    await repo.save(store, table);
  } else {
    table.setColumns(Array.from(columns.values()));
    table.setPagination(new Pagination(page, pageSize, args.activeRowCount));
    // Full dataset → IndexedDB source of truth; RAM kept to page 1 only
    await repo.replaceAll(store, table);
  }

  // Always bind the engine to the RAM page window (not the full dataset)
  const pageWindow = await repo.loadPage(store, tableKey, page, pageSize);
  if (pageWindow) table = pageWindow;
  return table.setPageWindow(true);
}
