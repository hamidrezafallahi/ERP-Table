/**
 * Plugin-facing event catalog (stable type tokens for subscribe / export plugins).
 * Keep in sync with `application/events` and `domain/types/GridEvent`.
 */

export type EventCatalogEntry = {
  readonly type: string;
  readonly category: 'cell' | 'row' | 'column' | 'table' | 'view' | 'dynamic' | 'error' | 'plugin';
  readonly undoable: boolean;
  readonly description: string;
};

export const EVENT_CATALOG: readonly EventCatalogEntry[] = [
  {
    type: 'CELL_CHANGED',
    category: 'cell',
    undoable: true,
    description: 'Cell value changed; payload includes previousValue and newValue.',
  },
  {
    type: 'CELL_DISPLAY_CHANGED',
    category: 'cell',
    undoable: false,
    description: 'Display-only cell text changed.',
  },
  {
    type: 'DYNAMIC_PROJECTION_DONE',
    category: 'dynamic',
    undoable: false,
    description: 'Async/dynamic projection finished for a cell.',
  },
  {
    type: 'ROW_ADDED',
    category: 'row',
    undoable: true,
    description: 'A new row was added to the active collection.',
  },
  {
    type: 'NEW_ROW_ADDED',
    category: 'row',
    undoable: true,
    description: 'Alias/variant for newly inserted row with initial values.',
  },
  {
    type: 'ROW_DELETED',
    category: 'row',
    undoable: true,
    description:
      'Soft delete for persisted rows; stacked for undo (toggle). Hard remove of Added rows uses NEW_ROW_REMOVED.',
  },
  {
    type: 'NEW_ROW_REMOVED',
    category: 'row',
    undoable: true,
    description: 'Hard-removed Added row; undo restores identity via RESTORE_ADDED_ROW.',
  },
  {
    type: 'ROW_RESTORED',
    category: 'row',
    undoable: false,
    description: 'Soft-deleted or modified row restored.',
  },
  {
    type: 'ROW_REORDERED',
    category: 'row',
    undoable: false,
    description: 'Row index/order changed.',
  },
  {
    type: 'ROW_DESCRIPTION_SAVED',
    category: 'row',
    undoable: false,
    description: 'Row description flag saved.',
  },
  {
    type: 'COLUMN_REORDERED',
    category: 'column',
    undoable: false,
    description: 'Column order changed.',
  },
  {
    type: 'UNIT_COLUMN_ADDED',
    category: 'column',
    undoable: false,
    description: 'Unit-level column added dynamically.',
  },
  {
    type: 'PAGE_CHANGED',
    category: 'view',
    undoable: false,
    description: 'Pagination page changed (view stream).',
  },
  {
    type: 'PAGE_SIZE_CHANGED',
    category: 'view',
    undoable: false,
    description: 'Page size changed (view stream).',
  },
  {
    type: 'VIEWPORT_CHANGED',
    category: 'view',
    undoable: false,
    description: 'Virtual scroll viewport moved; payload includes scrollOffset and visible range.',
  },
  {
    type: 'ACTIVE_COLLECTION_CHANGED',
    category: 'view',
    undoable: false,
    description: 'Active collection switched.',
  },
  {
    type: 'TABLE_DELETED',
    category: 'table',
    undoable: false,
    description: 'Table removed from store.',
  },
  {
    type: 'TABLE_RESET',
    category: 'table',
    undoable: false,
    description: 'Table state reset.',
  },
  {
    type: 'DYNAMIC_DATA_REQUESTED',
    category: 'dynamic',
    undoable: false,
    description: 'Remote/dynamic data requested for a column.',
  },
  {
    type: 'VALIDATION_FAILED',
    category: 'error',
    undoable: false,
    description: 'Domain validation failed; state unchanged.',
  },
  {
    type: 'EXPORT_REQUESTED',
    category: 'plugin',
    undoable: false,
    description: 'Host/plugin requested export (pdf/xlsx); typically view stream.',
  },
  {
    type: 'XLSX_EXPORT_COMPLETED',
    category: 'plugin',
    undoable: false,
    description: 'Excel plugin finished building an .xlsx blob.',
  },
  {
    type: 'XLSX_EXPORT_FAILED',
    category: 'plugin',
    undoable: false,
    description: 'Excel plugin failed to export.',
  },
  {
    type: 'PDF_EXPORT_COMPLETED',
    category: 'plugin',
    undoable: false,
    description: 'PDF plugin finished rendering a document.',
  },
  {
    type: 'PDF_EXPORT_FAILED',
    category: 'plugin',
    undoable: false,
    description: 'PDF plugin failed to export.',
  },
  {
    type: 'IMPORT_REQUESTED',
    category: 'plugin',
    undoable: false,
    description: 'Host/plugin requested import (xlsx); typically view stream.',
  },
  {
    type: 'XLSX_IMPORT_COMPLETED',
    category: 'plugin',
    undoable: false,
    description: 'Excel plugin finished importing rows into the table.',
  },
  {
    type: 'XLSX_IMPORT_FAILED',
    category: 'plugin',
    undoable: false,
    description: 'Excel plugin failed to import.',
  },
] as const;

export function getEventCatalogEntry(type: string): EventCatalogEntry | undefined {
  return EVENT_CATALOG.find((e) => e.type === type);
}

export function listUndoableEventTypes(): string[] {
  return EVENT_CATALOG.filter((e) => e.undoable).map((e) => e.type);
}
