import { describe, expect, it } from 'vitest';

import {
  EVENT_CATALOG,
  getEventCatalogEntry,
  listUndoableEventTypes,
} from '../events/eventCatalog';

describe('event catalog', () => {
  it('includes core undoable cell and row events', () => {
    expect(getEventCatalogEntry('CELL_CHANGED')?.undoable).toBe(true);
    expect(getEventCatalogEntry('ROW_ADDED')?.undoable).toBe(true);
    expect(listUndoableEventTypes()).toEqual(
      expect.arrayContaining([
        'CELL_CHANGED',
        'ROW_ADDED',
        'NEW_ROW_ADDED',
        'ROW_DELETED',
        'NEW_ROW_REMOVED',
      ]),
    );
  });

  it('exposes plugin export token', () => {
    expect(getEventCatalogEntry('EXPORT_REQUESTED')?.category).toBe('plugin');
    expect(getEventCatalogEntry('PDF_EXPORT_COMPLETED')?.category).toBe('plugin');
    expect(getEventCatalogEntry('XLSX_EXPORT_COMPLETED')?.category).toBe('plugin');
  });

  it('has unique type tokens', () => {
    const types = EVENT_CATALOG.map((e) => e.type);
    expect(new Set(types).size).toBe(types.length);
  });
});
