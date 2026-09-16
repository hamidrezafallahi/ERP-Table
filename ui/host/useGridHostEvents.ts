import { useEffect, useRef } from 'react';

import type { EventStore } from '../../application/ports/EventStore';
import type { UITableController } from '../../infrastructure/ui/UITableController';
import {
  bindGridHostEvents,
  type GridHostEventHandlers,
} from './bindGridHostEvents';

export type UseGridHostEventsInput<TRow = unknown> = GridHostEventHandlers<TRow> & {
  ready: boolean;
  controller: UITableController | null;
  eventStore: EventStore | null;
  tableKey: string;
};

/**
 * ERPTable wiring for PR-85. Handlers are read from a ref so EventStore
 * subscribeAll is not torn down when the host passes inline lambdas.
 */
export function useGridHostEvents<TRow = unknown>(
  input: UseGridHostEventsInput<TRow>,
): void {
  const handlersRef = useRef<GridHostEventHandlers<TRow>>(input);
  handlersRef.current = input;

  useEffect(() => {
    if (!input.ready || !input.controller || !input.eventStore) return;
    return bindGridHostEvents<TRow>({
      eventStore: input.eventStore,
      controller: input.controller,
      tableKey: input.tableKey,
      handlers: {
        onCellValueChanged: (event) =>
          handlersRef.current.onCellValueChanged?.(event),
        onRowValueChanged: (event) =>
          handlersRef.current.onRowValueChanged?.(event),
        onRowDataUpdated: (event) =>
          handlersRef.current.onRowDataUpdated?.(event),
        onSelectionChanged: (event) =>
          handlersRef.current.onSelectionChanged?.(event),
        onCellFocused: (event) => handlersRef.current.onCellFocused?.(event),
      },
    });
  }, [input.ready, input.controller, input.eventStore, input.tableKey]);
}
