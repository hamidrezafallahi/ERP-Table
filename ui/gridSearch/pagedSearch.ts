// Page-window ('paged-idb') grid search helpers — loaded lazily by `utils.ts`
// so the default entry does not pay for them. Rows stream from IndexedDB in
// bounded batches; only lightweight matches accumulate.
import { RowStateEnum } from '../../domain/value-objects';
import type { UITableController } from '../../infrastructure/ui/UITableController';
import type { GridSearchMatch } from './types';

/** Search text for a streamed record cell (plain data, no domain objects). */
export function getRecordCellSearchText(
  cells: Record<string, { value: unknown; originalValue: unknown; display: unknown }>,
  columnId: string,
): string {
  const cell = cells[columnId];
  const display = cell?.display;
  if (display != null && display !== '') return String(display);
  return String(cell?.value ?? '');
}

export async function findPagedColumnMatches(
  controller: UITableController,
  columnId: string,
  query: string,
): Promise<GridSearchMatch[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const matches: GridSearchMatch[] = [];
  await controller.iterateRowsFromDb('active', async (records) => {
    for (const record of records) {
      if (record.rowState === RowStateEnum.Deleted) continue;
      const text = getRecordCellSearchText(record.cells, columnId).toLowerCase();
      if (text.includes(q)) matches.push({ rowId: record.rowId, columnId });
    }
  });
  return matches;
}

/** Page that holds `rowId` (from the record's sorted ordinal), or null. */
export async function findPagedRowPage(
  controller: UITableController,
  rowId: number,
  pageSize: number,
): Promise<number | null> {
  let targetPage: number | null = null;
  await controller.iterateRowsFromDb('active', async (records, ordinalBase) => {
    for (let i = 0; i < records.length; i++) {
      if (records[i].rowId === rowId) {
        targetPage = Math.ceil((ordinalBase + i + 1) / pageSize);
        return false; // early stop
      }
    }
  });
  return targetPage;
}
