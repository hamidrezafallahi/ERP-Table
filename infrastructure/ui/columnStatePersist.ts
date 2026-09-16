/**
 * Optional column-state persistence (PR-115).
 * When `stateKey` is set: restore/save localStorage and append
 * `COLUMN_STATE_CHANGED` to the EventStore on layout changes.
 */

import type { EventStore } from '../../application/ports/EventStore';
import type { GridEvent } from '../../domain/types/GridEvent';
import {
  columnStateStorageKey,
  parseColumnState,
  serializeColumnState,
} from '../../engine/dataOps/columnState';
import type { GridApi, GridColumnState } from './createGridApi';
import type { UITableController } from './UITableController';

const PERSIST_DEBOUNCE_MS = 150;

export function loadColumnStateFromStorage(
  stateKey: string,
): GridColumnState[] | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return parseColumnState(localStorage.getItem(columnStateStorageKey(stateKey)));
  } catch {
    return null;
  }
}

export function saveColumnStateToStorage(
  stateKey: string,
  state: readonly GridColumnState[],
): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(
      columnStateStorageKey(stateKey),
      serializeColumnState(state),
    );
  } catch {
    // Quota / private mode — ignore
  }
}

export type AttachColumnStatePersistenceInput = {
  api: GridApi;
  controller: UITableController;
  tableId: string;
  actorId: string;
  /** Required to enable persist/restore (PR-115). */
  stateKey?: string;
  eventStore?: EventStore;
};

/**
 * Restore from localStorage (if `stateKey`), then subscribe to layout
 * changes and persist. No-op when `stateKey` is omitted.
 */
export async function attachColumnStatePersistence(
  input: AttachColumnStatePersistenceInput,
): Promise<() => void> {
  const { api, controller, tableId, actorId, stateKey, eventStore } = input;
  if (!stateKey) {
    return () => undefined;
  }

  let suppressed = false;
  let lastSerialized = serializeColumnState(api.getColumnState());
  let timer: ReturnType<typeof setTimeout> | undefined;

  const stored = loadColumnStateFromStorage(stateKey);
  if (stored && stored.length > 0) {
    suppressed = true;
    try {
      await api.applyColumnState(stored);
      lastSerialized = serializeColumnState(api.getColumnState());
    } finally {
      suppressed = false;
    }
  }

  const flush = () => {
    if (suppressed) return;
    const state = api.getColumnState();
    const serialized = serializeColumnState(state);
    if (serialized === lastSerialized) return;
    lastSerialized = serialized;

    saveColumnStateToStorage(stateKey, state);

    if (eventStore) {
      const streamId = `table:${tableId}`;
      const evt: GridEvent = {
        eventId: `col-state-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'COLUMN_STATE_CHANGED',
        tableId,
        streamId,
        version: 0,
        occurredAt: Date.now(),
        actorId,
        payload: { columns: state },
      };
      void eventStore.append(streamId, [evt], -1);
    }
  };

  const schedule = () => {
    if (suppressed) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, PERSIST_DEBOUNCE_MS);
  };

  const unsubscribe = controller.subscribe(schedule) ?? (() => undefined);

  return () => {
    if (timer) clearTimeout(timer);
    unsubscribe();
  };
}
