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
export interface RowDescriptionSavedPayload {
  readonly rowId: number;
  readonly description: boolean;
}

/* ── Table / view payloads ──────────────────────────── */

export interface PageChangedPayload { readonly page: number; }
export interface PageSizeChangedPayload { readonly pageSize: number; }
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

/* ── Typed aliases ──────────────────────────────────── */

export type CellChangedGridEvent = GridEvent<'CELL_CHANGED', CellChangedPayload>;
export type CellDisplayChangedGridEvent = GridEvent<'CELL_DISPLAY_CHANGED', CellDisplayChangedPayload>;
export type RowAddedGridEvent = GridEvent<'ROW_ADDED' | 'NEW_ROW_ADDED', RowAddedPayload>;
export type RowDeletedGridEvent = GridEvent<'ROW_DELETED', RowDeletedPayload>;
export type RowRestoredGridEvent = GridEvent<'ROW_RESTORED', RowRestoredPayload>;
export type RowReorderedGridEvent = GridEvent<'ROW_REORDERED', RowReorderedPayload>;
export type PageChangedGridEvent = GridEvent<'PAGE_CHANGED', PageChangedPayload>;
export type PageSizeChangedGridEvent = GridEvent<'PAGE_SIZE_CHANGED', PageSizeChangedPayload>;
export type TableDeletedGridEvent = GridEvent<'TABLE_DELETED', TableDeletedPayload>;
export type TableResetGridEvent = GridEvent<'TABLE_RESET', TableResetPayload>;
