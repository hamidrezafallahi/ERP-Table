import { Cell } from '../../domain/entities/Cell';
import { Row } from '../../domain/entities/Row';
import { Table } from '../../domain/entities/Table';
import type { ColumnDef } from '../../domain/types/ColumnDef';
import type { ColDefOrGroup } from '../../domain/types/ColumnGroupDef';
import { flattenColDefOrGroup } from '../columns/flattenColumnDefs';
import {
  CellDisplay,
  CellValue,
  ColumnId,
  RowId,
  RowState,
  RowStateEnum,
} from '../../domain/value-objects';
import { columnDefFieldName } from '../columns/mapColumnDef';

export type GetRowId<TRow = unknown> = (row: TRow, index: number) => string;

/** Default `getRowId`: array index. Hosts with a stable key should pass one. */
export function defaultGetRowId<TRow>(_row: TRow, index: number): string {
  return String(index);
}

export function resolveSourceId<TRow>(
  row: TRow,
  index: number,
  getRowId: GetRowId<TRow> = defaultGetRowId,
): string {
  const id = getRowId(row, index);
  return id === '' || id == null ? String(index) : String(id);
}

/**
 * Map a host string id onto a numeric `RowId`. Reuses ids already taken
 * for the same source key; otherwise prefers a parseable integer.
 */
export function allocateNumericRowId(
  sourceId: string,
  index: number,
  taken: Set<number>,
  known: Map<string, number>,
): number {
  const existing = known.get(sourceId);
  if (existing !== undefined) return existing;
  if (/^-?\d+$/.test(sourceId)) {
    const n = Number(sourceId);
    if (Number.isSafeInteger(n) && !taken.has(n)) {
      known.set(sourceId, n);
      taken.add(n);
      return n;
    }
  }
  let n = index + 1;
  while (taken.has(n) || n === 0) n += 1;
  known.set(sourceId, n);
  taken.add(n);
  return n;
}

export function readHostCellValue<TRow, TValue = unknown>(
  data: TRow,
  def: ColumnDef<TRow, TValue>,
): unknown {
  if (def.type === 'index') return undefined;
  if (def.valueGetter) return def.valueGetter({ data });
  const field = def.field as string | undefined;
  if (field && data && typeof data === 'object') {
    return (data as Record<string, unknown>)[field];
  }
  return null;
}

export function readHostCellDisplay<TRow, TValue = unknown>(
  data: TRow,
  def: ColumnDef<TRow, TValue>,
  value: unknown,
): unknown {
  if (def.valueFormatter) {
    return def.valueFormatter({ value: value as TValue, data });
  }
  return value;
}

function hasIndexColumn<TRow>(defs: ColumnDef<TRow>[]): boolean {
  return defs.some(
    (def) =>
      def.type === 'index' ||
      def.field === 'index' ||
      def.colId === 'index',
  );
}

/**
 * Domain sort/pagination still keys off an `index` cell. When the host omits
 * one, synthesize a hidden `#` column so order stays stable.
 */
export function ensureIndexColumnDef<TRow>(
  defs: ColDefOrGroup<TRow>[],
): ColDefOrGroup<TRow>[] {
  const flat = flattenColDefOrGroup(defs);
  if (hasIndexColumn(flat)) return defs;
  return [
    {
      colId: 'index',
      headerName: '#',
      type: 'index',
      editable: false,
      sortable: false,
      hide: true,
    },
    ...defs,
  ];
}

export type MappedRowInput = {
  id: number;
  values: Record<string, unknown>;
  data: unknown;
  sourceId: string;
  collection: 'default';
};

export function mapRowDataToRowInputs<TRow>(
  rowData: readonly TRow[],
  columnDefs: ColumnDef<TRow>[],
  getRowId: GetRowId<TRow> = defaultGetRowId,
): MappedRowInput[] {
  const known = new Map<string, number>();
  const taken = new Set<number>();
  const needsValueCopy = columnDefs.some(
    (def) => Boolean(def.valueGetter) || def.type === 'index',
  );
  return rowData.map((data, index) => {
    const sourceId = resolveSourceId(data, index, getRowId);
    const id = allocateNumericRowId(sourceId, index, taken, known);
    // PR-101: prefer leaving values on `data` (lazy cells). Only copy when
    // getters/index synthesis require a values bag.
    const values: Record<string, unknown> = { index: index + 1 };
    if (needsValueCopy) {
      for (const def of columnDefs) {
        const fieldName = columnDefFieldName(def);
        if (def.type === 'index' || fieldName === 'index') {
          values[fieldName] = index + 1;
          continue;
        }
        if (def.valueGetter) {
          values[fieldName] = readHostCellValue(data, def);
        }
      }
    }
    return {
      id,
      values,
      data,
      sourceId,
      collection: 'default',
    };
  });
}

function writeIndexCell(row: Row, index: number): boolean {
  const value = index + 1;
  let cell = row.peekCell('index');
  if (!cell) {
    cell = new Cell(
      row.id,
      ColumnId.for('index'),
      value,
      value,
      value,
    );
    row.cells.set('index', cell);
    return true;
  }
  let changed = false;
  if (cell.getValue() !== value) {
    cell.changeValue(value);
    cell.changeOriginalValue(value);
    changed = true;
  }
  if (cell.getDisplay() !== value) {
    cell.changeDisplay(value);
    changed = true;
  }
  return changed;
}

export function syncRowFromHost<TRow>(
  row: Row,
  data: TRow,
  index: number,
  columnDefs: ColumnDef<TRow>[],
): boolean {
  const sameRef = Object.is(row.data, data);
  row.setData(data);
  let changed = writeIndexCell(row, index);
  // PR-101: do not eagerly allocate cells. Update only already-materialized
  // cells; untouched fields stay on host `data`.
  for (const def of columnDefs) {
    const fieldName = columnDefFieldName(def);
    if (def.type === 'index' || fieldName === 'index') continue;
    const cell = row.peekCell(fieldName);
    if (!cell) {
      if (!sameRef) changed = true;
      continue;
    }
    const value = readHostCellValue(data, def);
    const display = readHostCellDisplay(data, def, value);
    if (cell.getValue() !== value) {
      cell.changeValue(value);
      cell.changeOriginalValue(value);
      changed = true;
    }
    if (cell.getDisplay() !== display) {
      cell.changeDisplay(display);
      changed = true;
    }
  }
  if (!sameRef) changed = true;
  return changed;
}

export function createDomainRowFromHost<TRow>(
  data: TRow,
  index: number,
  columnDefs: ColumnDef<TRow>[],
  sourceId: string,
  numericId: number,
  collection = 'default',
): Row {
  const rowId = new RowId(numericId);
  const cells = new Map<string, Cell>();
  const indexValue = index + 1;
  // PR-101: only materialize the index cell. Other fields stay on `data`
  // until getCell / edit — keeps 100k×N under the memory budget.
  cells.set(
    'index',
    new Cell(
      rowId,
      ColumnId.for('index'),
      indexValue,
      indexValue,
      indexValue,
    ),
  );
  void columnDefs;
  return new Row(
    rowId,
    cells,
    new RowState(RowStateEnum.Unchanged),
    new Set(),
    {},
    collection,
    false,
    data,
    sourceId,
  );
}

export type HostRowDataDiffResult = {
  added: number;
  updated: number;
  removed: number;
  kept: number;
  structureChanged: boolean;
  removedIds: number[];
  /** Domain `Row` instances whose cells were not rewritten. */
  unchangedRows: Row[];
};

/**
 * Align table rows with a new `rowData` array without rebuilding the table.
 * Unchanged rows keep the same `Row` instance (no deep clone of `data`).
 */
export function applyHostRowDataToTable<TRow>(
  table: Table,
  rowData: readonly TRow[],
  columnDefs: ColumnDef<TRow>[],
  getRowId: GetRowId<TRow> = defaultGetRowId,
): HostRowDataDiffResult {
  const existing = table.getRows();
  const known = new Map<string, number>();
  const taken = new Set<number>();
  const bySource = new Map<string, Row>();
  for (const row of existing) {
    const sid = row.sourceId ?? String(row.id.value);
    known.set(sid, row.id.value);
    taken.add(row.id.value);
    bySource.set(sid, row);
  }

  const nextIds = new Set<string>();
  let added = 0;
  let updated = 0;
  let kept = 0;
  const unchangedRows: Row[] = [];
  const collection = table.getActiveCollectionName();

  for (let i = 0; i < rowData.length; i += 1) {
    const data = rowData[i] as TRow;
    const sourceId = resolveSourceId(data, i, getRowId);
    nextIds.add(sourceId);
    const prev = bySource.get(sourceId);
    if (!prev) {
      const numericId = allocateNumericRowId(sourceId, i, taken, known);
      table.hostPutRow(
        createDomainRowFromHost(
          data,
          i,
          columnDefs,
          sourceId,
          numericId,
          collection,
        ),
      );
      added += 1;
      continue;
    }
    const sameRef = Object.is(prev.data, data);
    const cellsChanged = syncRowFromHost(prev, data, i, columnDefs);
    if (cellsChanged) {
      updated += 1;
    } else {
      kept += 1;
      unchangedRows.push(prev);
      if (!sameRef) prev.setData(data);
    }
  }

  const removedIds: number[] = [];
  for (const row of existing) {
    const sid = row.sourceId ?? String(row.id.value);
    if (!nextIds.has(sid)) {
      table.hostRemoveRow(row.id.value);
      removedIds.push(row.id.value);
    }
  }

  return {
    added,
    updated,
    removed: removedIds.length,
    kept,
    structureChanged: added > 0 || removedIds.length > 0,
    removedIds,
    unchangedRows,
  };
}
