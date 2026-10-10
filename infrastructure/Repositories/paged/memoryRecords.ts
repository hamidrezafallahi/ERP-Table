// In-memory serving of the `iterateRowRecords` contract (default mode).
import type { PersistedRowRecord } from '../../../application/ports/TableRepository';
import type { Row } from '../../../domain/entities/Row';
import type { TableSnapShot } from '../../../engine/type';

export async function iterateMemoryRows(
  rows: readonly Row[],
  onBatch: (records: PersistedRowRecord[], ordinalBase: number) => Promise<boolean | void>,
  batchSize?: number,
): Promise<void> {
  const size = Math.max(1, batchSize ?? 500);
  for (let base = 0; base < rows.length; base += size) {
    const records: PersistedRowRecord[] = rows.slice(base, base + size).map((row, i) => ({
      rowId: row.id.value,
      collection: row.getCollection(),
      sortIndex: Number(row.getCell('index')?.getValue() ?? base + i) || 0,
      rowState: row.rowState.value,
      cells: Object.fromEntries(
        [...row.getCells()].map(([k, c]) => [
          k,
          {
            value: c.getValue(),
            originalValue: c.getOriginalValue().value,
            display: c.getDisplay(),
          },
        ]),
      ),
    }));
    if ((await onBatch(records, base)) === false) return;
  }
}

const hasMeaningfulValue = (value: unknown) =>
  value !== undefined && value !== null && value !== '';

/** Rows with data (besides `index`) → server-save snapshot. */
export function rowsToSnapshot(rows: readonly Row[]): TableSnapShot {
  return {
    rows: rows
      .filter((row) =>
        Array.from(row.getCells().entries()).some(
          ([key, cell]) => key !== 'index' && hasMeaningfulValue(cell.getValue()),
        ),
      )
      .map((row) => ({
        id: row.id.value,
        changeFields: row.getSnapshotChangeFields(),
        cells: Object.fromEntries(
          [...row.getCells()].map(([k, c]) => [k, c.getValue()]),
        ),
        rowState: row.rowState.value,
        collection: row.getCollection(),
        rowType: row.getCollection(),
        isSaveDescription: row.isSaveDescription,
      })),
  };
}
