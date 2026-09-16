export interface GridEvent<TType extends string = string, TPayload = unknown> {
  readonly eventId: string;
  readonly type: TType;
  readonly tableId: string;
  readonly streamId: string;
  readonly version: number;
  readonly occurredAt: number;
  readonly actorId: string;
  readonly payload: TPayload;
  readonly correlationId?: string;
  readonly causationId?: string;
}

/* ── Cell payloads ──────────────────────────────────── */

export interface CellChangedPayload {
  readonly rowId: number;
  readonly columnId: string;
  readonly newValue: unknown;
  readonly previousValue: unknown;
}

export interface CellDisplayChangedPayload {
  readonly rowId: number;
  readonly columnId: string;
  readonly newValue: unknown;
}

/* ── Row payloads ───────────────────────────────────── */

export interface RowAddedPayload { readonly rowId: string; }
export interface RowDeletedPayload { readonly rowId: string; }
export interface RowRestoredPayload { readonly rowId: string; }
export interface RowReorderedPayload {
  readonly sourceIndex: number;
  readonly destIndex: number;
}
export interface ColumnReorderedPayload {
  readonly sourceIndex: number;
  readonly destIndex: number;
}
export interface RowDescriptionSavedPayload {
  readonly rowId: number;
  readonly description: boolean;
}

/* ── Table / view payloads ──────────────────────────── */

export interface PageChangedPayload { readonly page: number; }
export interface PageSizeChangedPayload { readonly pageSize: number; }
export interface ViewportChangedPayload {
  readonly scrollOffset: number;
  readonly viewportSize: number;
  readonly rowHeight: number;
  readonly overscan: number;
  readonly startIndex: number;
  readonly endIndex: number;
}
export interface ColumnStateChangedPayload {
  readonly columns: readonly {
    readonly colId: string;
    readonly width: number;
    readonly hide: boolean;
    readonly order: number;
    readonly pinned?: 'start' | 'end' | null;
    readonly sort?: 'asc' | 'desc' | null;
    readonly sortIndex?: number | null;
  }[];
}
export interface TableDeletedPayload {}
export interface TableResetPayload {}
export interface ActiveCollectionChangedPayload {}
export interface UnitColumnAddedPayload {
  readonly reason: string;
  readonly details?: unknown;
}
export interface DynamicProjectionPayload {
  readonly rowId: number;
  readonly columnId: string;
}

/* ── Plugin / export payloads ───────────────────────── */

export interface ExportRequestedPayload {
  readonly format: 'xlsx' | 'pdf' | 'csv';
  readonly collectionScope: 'active' | 'all' | string[];
  readonly fileName?: string;
  readonly sheetName?: string;
  readonly direction?: 'rtl' | 'ltr';
}

export interface ExportCompletedPayload {
  readonly format: 'xlsx' | 'pdf' | 'csv';
  readonly rowCount: number;
  readonly columnCount?: number;
  readonly blobId?: string;
}

export interface ExportFailedPayload {
  readonly format: 'xlsx' | 'pdf' | 'csv';
  readonly code: string;
  readonly message: string;
}

/* ── Plugin / import payloads ───────────────────────── */

export interface ImportRequestedPayload {
  readonly format: 'xlsx';
  readonly collectionScope: 'active' | 'all' | string[];
  readonly sheetName?: string;
  readonly byteLength?: number;
}

export interface ImportCompletedPayload {
  readonly format: 'xlsx';
  readonly rowCount: number;
  readonly columnCount?: number;
}

export interface ImportFailedPayload {
  readonly format: 'xlsx';
  readonly code: string;
  readonly message: string;
}

/* ── Typed aliases ──────────────────────────────────── */

export type CellChangedGridEvent = GridEvent<'CELL_CHANGED', CellChangedPayload>;
export type CellDisplayChangedGridEvent = GridEvent<'CELL_DISPLAY_CHANGED', CellDisplayChangedPayload>;
export type RowAddedGridEvent = GridEvent<'ROW_ADDED' | 'NEW_ROW_ADDED', RowAddedPayload>;
export type RowDeletedGridEvent = GridEvent<'ROW_DELETED' | 'NEW_ROW_REMOVED', RowDeletedPayload>;
export type RowRestoredGridEvent = GridEvent<'ROW_RESTORED', RowRestoredPayload>;
export type RowReorderedGridEvent = GridEvent<'ROW_REORDERED', RowReorderedPayload>;
export type ColumnReorderedGridEvent = GridEvent<'COLUMN_REORDERED', ColumnReorderedPayload>;
export type ColumnStateChangedGridEvent = GridEvent<'COLUMN_STATE_CHANGED', ColumnStateChangedPayload>;
export type PageChangedGridEvent = GridEvent<'PAGE_CHANGED', PageChangedPayload>;
export type PageSizeChangedGridEvent = GridEvent<'PAGE_SIZE_CHANGED', PageSizeChangedPayload>;
export type ViewportChangedGridEvent = GridEvent<'VIEWPORT_CHANGED', ViewportChangedPayload>;
export type TableDeletedGridEvent = GridEvent<'TABLE_DELETED', TableDeletedPayload>;
export type TableResetGridEvent = GridEvent<'TABLE_RESET', TableResetPayload>;
