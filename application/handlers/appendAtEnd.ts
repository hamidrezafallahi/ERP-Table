// application/handlers/appendAtEnd.ts — page-window ('paged-idb') helper.
import { RowAdded } from '../../domain/events';
import { Table } from '../../domain/entities/Table';
import { KeyValue, Pagination } from '../../domain/value-objects';
import { WindowedTableRepository } from '../ports/TableRepository';

/**
 * Append a row at the end of the full dataset (IndexedDB SoT), bump totalRows,
 * then load the last page into the RAM window so UI/pagination stay correct.
 *
 * Memory Iron Rule: max index + row count are computed with ONE streaming
 * cursor pass over IndexedDB (batch-bounded heap) — never a full getAllRows
 * hydration of the dataset.
 */
export async function appendAtEndAndShowLastPage(
  repo: WindowedTableRepository,
  store: string,
  tableKey: string,
  table: Table,
  data?: KeyValue[],
): Promise<RowAdded> {
  let maxIndex = 0;
  let existingCount = 0;
  await repo.iterateRowRecords(store, tableKey, 'active', async records => {
    for (const rec of records) {
      existingCount += 1;
      // Same semantics as the former getAllRows reduce: cell 'index' value,
      // 0 when missing/non-numeric.
      const n = Number(rec.cells['index']?.value ?? 0);
      if (Number.isFinite(n) && n > maxIndex) maxIndex = n;
    }
  });
  const nextIndex = maxIndex + 1;

  // Meta may be stale (stuck at pageSize); trust the larger of meta vs real count
  const newTotal = Math.max(table.getPagination().totalRows, existingCount) + 1;
  const pageSize = Math.max(1, table.getPagination().pageSize);
  const lastPage = Math.max(1, Math.ceil(newTotal / pageSize));

  const event = table.addNewRow(data, nextIndex);
  // Force correct totals/page (addNewRow may have used a stale base totalRows)
  table.setPagination(new Pagination(lastPage, pageSize, newTotal));

  await repo.save(store, table);

  const loaded = await repo.loadPage(store, tableKey, lastPage, pageSize);
  if (loaded) {
    // Ensure RAM window carries the corrected pagination after load
    if (
      loaded.getPagination().totalRows !== newTotal ||
      loaded.getPagination().page !== lastPage
    ) {
      loaded.setPagination(new Pagination(lastPage, pageSize, newTotal));
      await repo.save(store, loaded);
    }
  }

  return event;
}
