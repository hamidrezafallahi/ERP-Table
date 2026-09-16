import type { Actor } from '../domain/policies';
import type { CreateERPTableConfig } from './type';

/** Internal repo/event-store namespace when the host omits `store` (PR-83). */
export const DEFAULT_MEMORY_STORE = 'memory';

/** Actor used when the host omits `actor` — every permission check passes. */
export const DEFAULT_GRID_ACTOR: Actor = {
  userId: 'anonymous',
  roles: ['admin'],
};

export function createGridTableKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `pdg-${crypto.randomUUID()}`;
  }
  return `pdg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isPersistentStore(
  store: string | undefined,
): store is string {
  return typeof store === 'string' && store.length > 0;
}

export type ResolvedGridIdentity = {
  store: string;
  tableKey: string;
  actor: Actor;
  persist: boolean;
};

/**
 * Fill `store` / `tableKey` / `actor` when omitted.
 * When `store` is set, identity is unchanged (PR-83: do not alter that path).
 */
export function resolveCreateGridDefaults(
  config: Pick<CreateERPTableConfig, 'store' | 'tableKey' | 'actor'>,
): ResolvedGridIdentity {
  const tableKey =
    typeof config.tableKey === 'string' && config.tableKey.length > 0
      ? config.tableKey
      : createGridTableKey();
  const actor = config.actor ?? DEFAULT_GRID_ACTOR;
  if (isPersistentStore(config.store)) {
    return { persist: true, store: config.store, tableKey, actor };
  }
  return {
    persist: false,
    store: DEFAULT_MEMORY_STORE,
    tableKey,
    actor,
  };
}
