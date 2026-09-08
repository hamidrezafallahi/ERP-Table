import type { GridSession } from '../../../../application/session/GridSession';
import type { ImportCellKv } from './mapImportedSheet';

export type ApplyImportedRowsResult = {
  rowCount: number;
};

/**
 * Applies imported cell matrices through the engine (ADD_NEW_ROWS) so
 * CachedTableRepository / IndexedDB persistence stays on the normal path.
 *
 * Uses a synthetic unique `index` token only for dedupe in Table.addNewRows;
 * addNewRow still auto-assigns the real index cell.
 */
export async function applyImportedRows(
  session: GridSession,
  rows: ImportCellKv[][],
): Promise<ApplyImportedRowsResult> {
  if (rows.length === 0) {
    return { rowCount: 0 };
  }

  const stamp = Date.now();
  const engine = session.getEngine();
  const payload = rows.map((cells, i) => [
    {
      key: 'index',
      value: `import-${stamp}-${i}`,
      display: `import-${stamp}-${i}`,
    },
    ...cells.filter((c) => c.key !== 'index'),
  ]);

  await engine.dispatch({
    type: 'ADD_NEW_ROWS',
    store: session.store,
    tableKey: session.tableKey,
    detailFieldKey: 'index',
    rows: payload,
    autoActivate: false,
  });

  return { rowCount: rows.length };
}
