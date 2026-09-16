/** Default IndexedDB database prefix (PR-80). */
export const DEFAULT_EVENT_STORE_PREFIX = 'persian-data-grid-events';

/**
 * Prefix used by `persian-data-grid@0.5.x`.
 * Pass as `eventStoreName` to keep reading existing local data.
 */
export const LEGACY_EVENT_STORE_PREFIX = 'erp-table-events';

/** Full IndexedDB name: `{prefix}:{store}`. */
export function eventStoreDbName(
  store: string,
  prefix: string = DEFAULT_EVENT_STORE_PREFIX,
): string {
  return `${prefix}:${store}`;
}
