import { describe, expect, it } from 'vitest';

import {
  columnStateStorageKey,
  columnStatesEqual,
  parseColumnState,
  serializeColumnState,
  sortModelFromColumnState,
} from '../dataOps/columnState';

describe('columnState (PR-115)', () => {
  it('serializes and parses round-trip', () => {
    const state = [
      {
        colId: 'name',
        width: 120,
        hide: false,
        order: 0,
        pinned: 'start' as const,
        sort: 'asc' as const,
        sortIndex: 0,
      },
      {
        colId: 'amount',
        width: 80,
        hide: true,
        order: 1,
        pinned: null,
        sort: null,
        sortIndex: null,
      },
    ];
    const raw = serializeColumnState(state);
    expect(parseColumnState(raw)).toEqual(state);
    expect(columnStatesEqual(state, parseColumnState(raw)!)).toBe(true);
  });

  it('rejects invalid JSON', () => {
    expect(parseColumnState(undefined)).toBeNull();
    expect(parseColumnState('{')).toBeNull();
    expect(parseColumnState('[]')).toBeNull();
    expect(parseColumnState('{"colId":"x"}')).toBeNull();
  });

  it('builds sort model from sortIndex order', () => {
    const model = sortModelFromColumnState([
      { colId: 'b', width: 1, hide: false, order: 1, sort: 'desc', sortIndex: 1 },
      { colId: 'a', width: 1, hide: false, order: 0, sort: 'asc', sortIndex: 0 },
      { colId: 'c', width: 1, hide: false, order: 2, sort: null },
    ]);
    expect(model).toEqual([
      { colId: 'a', sort: 'asc' },
      { colId: 'b', sort: 'desc' },
    ]);
  });

  it('storage key is namespaced', () => {
    expect(columnStateStorageKey('invoice-grid')).toBe(
      'pdg:columnState:invoice-grid',
    );
  });
});
