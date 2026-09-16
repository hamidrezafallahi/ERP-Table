import type { EventStore } from '../../application/ports/EventStore';
import {
  subscribeCatalogHostEvents,
  type CatalogHostEventHandlers,
  type CellFocusedEvent,
  type SelectionChangedEvent,
} from '../../application/events/hostGridEvents';
import type { GridApi } from '../../infrastructure/ui/createGridApi';
import type { UITableController } from '../../infrastructure/ui/UITableController';

export type GridReadyEvent<TRow = unknown> = {
  api: GridApi<TRow>;
};

export type GridHostEventHandlers<TRow = unknown> = CatalogHostEventHandlers<TRow> & {
  onSelectionChanged?: (event: SelectionChangedEvent<TRow>) => void;
  onCellFocused?: (event: CellFocusedEvent) => void;
  onGridReady?: (event: GridReadyEvent<TRow>) => void;
};

function selectedKeysEqual(
  a: Record<number, boolean> | null | undefined,
  b: Record<number, boolean> | null | undefined,
): boolean {
  const left = Object.keys(a ?? {});
  const right = Object.keys(b ?? {});
  if (left.length !== right.length) return false;
  return left.every((key) => {
    const id = Number(key);
    return Boolean(a?.[id]) === Boolean(b?.[id]);
  });
}

function activeCellEqual(
  a: { rowId?: number; columnId?: string } | null | undefined,
  b: { rowId?: number; columnId?: string } | null | undefined,
): boolean {
  return a?.rowId === b?.rowId && a?.columnId === b?.columnId;
}

function selectedRowIds(
  selected: Record<number, boolean> | null | undefined,
): number[] {
  return Object.keys(selected ?? {})
    .map(Number)
    .filter((id) => Number.isFinite(id) && Boolean(selected?.[id]));
}

/**
 * Subscribe to EVENT_CATALOG (`EventStore`) plus the existing view store
 * (selection / focus). One unsubscribe. Not a second event bus.
 */
export function bindGridHostEvents<TRow = unknown>(
  input: {
    eventStore: EventStore;
    controller: UITableController;
    tableKey: string;
    handlers: GridHostEventHandlers<TRow>;
  },
): () => void {
  const { eventStore, controller, tableKey, handlers } = input;

  const unsubCatalog = subscribeCatalogHostEvents(
    eventStore,
    {
      tableId: tableKey,
      getRowData: (rowId) =>
        controller.getAllRows()?.find((row) => row.id.value === rowId)?.data as
          | TRow
          | undefined,
      getAllRowData: () =>
        (controller.getAllRows() ?? [])
          .map((row) => row.data)
          .filter((data): data is TRow => data !== undefined),
    },
    handlers,
  );

  const unsubSelection = controller.subscribeSelected(
    () => controller.getSelectedRows(),
    (selected) => {
      const ids = selectedRowIds(selected);
      const rows = controller.getAllRows() ?? [];
      const selectedRows = ids
        .map((id) => rows.find((row) => row.id.value === id)?.data)
        .filter((data): data is TRow => data !== undefined);
      handlers.onSelectionChanged?.({
        selectedRowIds: ids,
        selectedRows,
      });
    },
    selectedKeysEqual,
  );

  const unsubFocus = controller.subscribeSelected(
    () => controller.getActiveCell(),
    (cell) => {
      handlers.onCellFocused?.({
        rowId: cell?.rowId ?? null,
        colId: cell?.columnId ?? null,
      });
    },
    activeCellEqual,
  );

  return () => {
    unsubCatalog();
    unsubSelection();
    unsubFocus();
  };
}
