import type { EventStore, Unsubscribe } from '../ports/EventStore';
import type { GridEvent } from '../../domain/types/GridEvent';

/**
 * Catalog types that map to `onRowDataUpdated` (PR-85).
 * Keep in sync with `EVENT_CATALOG` — do not invent a parallel bus.
 */
export const ROW_DATA_UPDATED_CATALOG_TYPES = [
  'ROW_ADDED',
  'NEW_ROW_ADDED',
  'ROW_DELETED',
  'NEW_ROW_REMOVED',
  'ROW_RESTORED',
  'ROW_REORDERED',
] as const;

export type RowDataUpdatedCatalogType =
  (typeof ROW_DATA_UPDATED_CATALOG_TYPES)[number];

/** Single mapping table: EVENT_CATALOG token → React callback names. */
export const CATALOG_TO_HOST_CALLBACKS: Readonly<
  Record<string, readonly string[]>
> = {
  CELL_CHANGED: ['onCellValueChanged', 'onRowValueChanged'],
  ROW_ADDED: ['onRowDataUpdated'],
  NEW_ROW_ADDED: ['onRowDataUpdated'],
  ROW_DELETED: ['onRowDataUpdated'],
  NEW_ROW_REMOVED: ['onRowDataUpdated'],
  ROW_RESTORED: ['onRowDataUpdated'],
  ROW_REORDERED: ['onRowDataUpdated'],
};

export type CellValueChangedEvent<TRow = unknown> = {
  oldValue: unknown;
  newValue: unknown;
  colId: string;
  rowId: number;
  data: TRow | undefined;
};

export type RowValueChangedEvent<TRow = unknown> = {
  rowId: number;
  data: TRow | undefined;
};

export type RowDataUpdatedEvent<TRow = unknown> = {
  rowData: TRow[];
  source: string;
};

export type SelectionChangedEvent<TRow = unknown> = {
  selectedRowIds: number[];
  selectedRows: TRow[];
};

export type CellFocusedEvent = {
  rowId: number | null;
  colId: string | null;
};

export type CatalogHostEventHandlers<TRow = unknown> = {
  onCellValueChanged?: (event: CellValueChangedEvent<TRow>) => void;
  onRowValueChanged?: (event: RowValueChangedEvent<TRow>) => void;
  onRowDataUpdated?: (event: RowDataUpdatedEvent<TRow>) => void;
};

export type CatalogHostEventContext<TRow = unknown> = {
  tableId: string;
  getRowData: (rowId: number) => TRow | undefined;
  getAllRowData: () => TRow[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function readCellChanged(event: GridEvent): {
  rowId: number;
  colId: string;
  newValue: unknown;
  oldValue: unknown;
} | null {
  if (event.type !== 'CELL_CHANGED') return null;
  const payload = isRecord(event.payload) ? event.payload : {};
  const rowId = readNumber(payload.rowId);
  const colId =
    typeof payload.columnId === 'string' && payload.columnId.length > 0
      ? payload.columnId
      : typeof payload.colId === 'string' && payload.colId.length > 0
        ? payload.colId
        : null;
  if (rowId == null || colId == null) return null;
  return {
    rowId,
    colId,
    newValue: payload.newValue,
    oldValue: payload.previousValue,
  };
}

function isRowDataUpdatedType(type: string): type is RowDataUpdatedCatalogType {
  return (ROW_DATA_UPDATED_CATALOG_TYPES as readonly string[]).includes(type);
}

/**
 * Map one `EVENT_CATALOG` GridEvent onto host React callbacks.
 * Returns how many host notifications were emitted (0–2 for CELL_CHANGED).
 */
export function dispatchCatalogHostEvent<TRow = unknown>(
  event: GridEvent,
  ctx: CatalogHostEventContext<TRow>,
  handlers: CatalogHostEventHandlers<TRow>,
): number {
  if (event.tableId !== ctx.tableId) return 0;
  let count = 0;

  const cell = readCellChanged(event);
  if (cell) {
    const data = ctx.getRowData(cell.rowId);
    handlers.onCellValueChanged?.({
      oldValue: cell.oldValue,
      newValue: cell.newValue,
      colId: cell.colId,
      rowId: cell.rowId,
      data,
    });
    count += 1;
    handlers.onRowValueChanged?.({
      rowId: cell.rowId,
      data,
    });
    count += 1;
    return count;
  }

  if (isRowDataUpdatedType(event.type)) {
    handlers.onRowDataUpdated?.({
      rowData: ctx.getAllRowData(),
      source: event.type,
    });
    return 1;
  }

  return 0;
}

export function subscribeCatalogHostEvents<TRow = unknown>(
  eventStore: EventStore,
  ctx: CatalogHostEventContext<TRow>,
  handlers: CatalogHostEventHandlers<TRow>,
): Unsubscribe {
  return eventStore.subscribeAll((event) => {
    dispatchCatalogHostEvent(event, ctx, handlers);
  });
}
