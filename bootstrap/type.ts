import type { CSSProperties, ReactNode } from 'react';

import { AuditLogger } from '../application/ports/AuditLogger';
import { TableRepository } from '../application/ports/TableRepository';
import type { ColumnDef } from '../domain/types/ColumnDef';
import type { ColDefOrGroup } from '../domain/types/ColumnGroupDef';
import type {
  ColumnSchema,
} from '../domain/types/ColumnSchema';
export type {
  ColumnSchema,
  ColumnVisibilityRule,
  DefaultOptionType,
  DynamicValueConfig,
  FieldType,
  IDependOn,
  ResolveOnConfig,
} from '../domain/types/ColumnSchema';
export type {
  ColumnDef,
  ColumnDefBridge,
  ColumnField,
  ColumnPinned,
  FilterDef,
} from '../domain/types/ColumnDef';
import type { ItemType } from '../engine/type';
import type { IBaseQueryResponse } from '../ui/hostTypes';
import type { UIRow } from '../ui/type';
import type { Row } from '../domain/entities/Row';
import type { Table } from '../domain/entities/Table';
import type {
  Actor,
  PermissionPolicy,
} from '../domain/policies';
import type { RemoteApi } from '../application/ports/RemoteApi';
import type {
  GridDatasource,
  RowModelType,
} from '../application/ports/GridDatasource';
import type { TableEngine } from '../engine/tableEngine';
import type { GridApi } from '../infrastructure/ui/createGridApi';
import type { UITableController } from '../infrastructure/ui/UITableController';
import type { EventStore } from '../application/ports/EventStore';
import type { SnapshotStore } from '../application/ports/SnapshotStore';
import type { SnapshotStrategy } from '../infrastructure/snapshot/SnapshotStrategy';
import type { ChangelogProjection } from '../infrastructure/projections/ChangelogProjection';
import type { HistoryPanelViewModel } from '../infrastructure/history/HistoryPanelViewModel';
import type { OfflineStatus } from '../application/offline/OfflineStatus';
import type { ConnectivitySource } from '../application/offline/OfflineStatus';
import type {
  SyncConflictPolicy,
  SyncPort,
  SyncTransport,
} from '../application/ports/SyncPort';
import type {
  PresencePort,
  PresenceTransport,
} from '../application/ports/PresencePort';
import type { CellUndoStack } from '../application/undo/CellUndoStack';
import type { GridSession } from '../application/session/GridSession';
import type { GridPlugin } from '../application/plugins/GridPlugin';
import type { PluginHost } from '../application/plugins/PluginHost';
import type {
  ColumnDefinition,
  ColumnViewBinding,
} from '../domain/types/ColumnDefinition';

// ---------------------------------------------------------------------------
// Public, UI-aware column contract (what hosts import as `ColumnSchema`).
//
// The domain `ColumnSchema` keeps loose, METHOD-syntax callbacks (domain must
// not know UIRow / UITableController / React). This layer re-declares the
// callbacks with their precise types so inline host callbacks are contextually
// typed. Assignability to the domain type holds through bivariant methods, so
// the engine keeps consuming the domain shape unchanged.
// ---------------------------------------------------------------------------

/** Select option with a renderable label. */
export type HostDefaultOptionType = Omit<DefaultOptionType, 'label'> & {
  label?: ReactNode;
};

/** Remote flag resolution typed with the arianERP query envelope. */
export type HostResolveOnConfig<K = unknown> = ResolveOnConfig<
  K,
  IBaseQueryResponse<K>
>;

export interface HostColumnSchema<T = unknown, K = unknown>
  extends Omit<
    ColumnSchema<T, K>,
    | 'options'
    | 'resolveOn'
    | 'indexOptions'
    | 'onChange'
    | 'dynamicSelectFilterOption'
    | 'style'
  > {
  options?: HostDefaultOptionType[];
  resolveOn?: HostResolveOnConfig<K>;
  /** Extra items of the row index menu. */
  indexOptions?: (
    tableKey: string,
    rowId: number,
    row: UIRow,
    controller: UITableController,
  ) => ItemType[];
  onChange?: (
    tableKey: string,
    rowId: number,
    row: UIRow,
    controller: UITableController,
    value: unknown,
    option?: HostDefaultOptionType,
  ) => void;
  dynamicSelectFilterOption?: (
    inputValue: string,
    option: HostDefaultOptionType,
  ) => boolean;
  style?: CSSProperties;
}


export type CollectionRowMap = Record<string, object>;

export type GetRowId<TRow = unknown> = (row: TRow, index: number) => string;

export type RowInput = {
  id: number;
  values?: Record<string, unknown>;
  collection?: string;
  rowType?: string;
  /** Host `TRow` reference (PR-82). Not deep-cloned. */
  data?: unknown;
  /** Stable id from `getRowId`. */
  sourceId?: string;
};

export type RowAccessControl = {
  allowRoles?: string[];
  denyRoles?: string[];
  rule?: (ctx: {
    actor: Actor;
    table: Table;
    row?: Row;
  }) => boolean;
};
export type CreateERPTableConfig<TRow = unknown> = {
  /**
   * Durable IndexedDB namespace. Omit for an in-memory grid (PR-83):
   * no IndexedDB, `InMemoryEventStore`.
   */
  store?: string;
  /**
   * Table id. Omit and one is generated for this `createGrid` call
   * (React: stable for the component lifetime).
   */
  tableKey?: string;
  activeCollection?: string;
  tableType?: string;
  /**
   * RBAC actor. Omit for `{ userId: 'anonymous', roles: ['admin'] }` (all access).
   */
  actor?: Actor;
  rowAccess?: RowAccessControl;
  /**
   * ERP / legacy columns. Optional when `columnDefs` is set (PR-82).
   * If both are set, `columns` wins.
   * @deprecated Prefer `columnDefs` (D14). Remains working for ERP hosts.
   */
  columns?: HostColumnSchema[];
  /**
   * ERP / legacy rows. Optional when `rowData` is set (PR-82).
   * If both are set, `rows` wins for the initial load.
   * @deprecated Prefer `rowData` (D14). Remains working for ERP hosts.
   */
  rows?: RowInput[];
  /**
   * Host objects mapped to domain `Row` (PR-82 / D14).
   * Each domain row keeps this object by reference (`row.data`).
   */
  rowData?: readonly TRow[];
  /** Generic columns or nested groups. Mapped with `toColumnSchema` when `columns` is omitted. */
  columnDefs?: ColDefOrGroup<NoInfer<TRow>>[];
  /**
   * Stable row identity. Default is the array index.
   * Pass `(row) => String(row.id)` when the host has a real key.
   */
  getRowId?: GetRowId<NoInfer<TRow>>;
  repo?: TableRepository;
  /**
   * Persistence strategy (requires `store`).
   * - `'event-sourced'` (default): whole table in RAM, durable log in the
   *   EventStore, optional virtualization, sort/filter over every row.
   * - `'paged-idb'`: arianERP document-grid mode. IndexedDB holds EVERY row
   *   (one record per row); RAM holds exactly one page window (heap is
   *   O(page), never O(rows)); pagination drives loading; delete-selected /
   *   select-all / search / save-snapshot stream from IndexedDB. Sort / filter
   *   / virtualization act on the current page only; for unbounded sets use
   *   `rowModelType: 'infinite'`.
   */
  persistence?: 'event-sourced' | 'paged-idb';
  audit?: AuditLogger;
  permissionPolicy?: PermissionPolicy;
  tableHeight?: number;
  recordPerPage?: number;
  /** Used with `tableHeight` to derive pageSize. Default 40 (D12). */
  rowHeight?: number;
  /**
   * Default `NoopRemoteApi` (D1) — no fetch, no ERP cookies.
   * arianERP hosts import `FetchRemoteApi` from `persian-data-grid/adapters/arian-erp`.
   */
  remoteApi?: RemoteApi;
  /**
   * Override event store. Default: IndexedDbEventStore in the browser,
   * InMemoryEventStore in Node/tests.
   */
  eventStore?: EventStore;
  /**
   * IndexedDB name prefix when `eventStore` is omitted (PR-80).
   * Default `persian-data-grid-events` → `{prefix}:{store}`.
   * 0.5.x databases used `erp-table-events` — pass that string (or
   * `LEGACY_EVENT_STORE_PREFIX`) to keep existing local data.
   */
  eventStoreName?: string;
  /**
   * Online/offline detection (PR-137). Default: browser `navigator.onLine`.
   * Inject a fake source in tests.
   */
  connectivity?: ConnectivitySource;
  /**
   * Optional sync transport (PR-138). When set, `GridSyncService` is wired and
   * `api.sync()` / `<GridSyncPanel />` become available.
   */
  syncTransport?: SyncTransport;
  /** Initial conflict policy when `syncTransport` is set (default lastWriteWins). */
  syncConflictPolicy?: SyncConflictPolicy;
  /**
   * Presence transport (PR-139). When set (or `presence: true` for BroadcastChannel),
   * peer cursors are tracked and `<GridPresencePanel />` works.
   */
  presenceTransport?: PresenceTransport;
  /** Shorthand: enable BroadcastChannel presence for this table. */
  presence?: boolean;
  /** Display label for local peer (default actor.userId). */
  presenceLabel?: string;
  /**
   * Opt-in aggregate snapshots (D7). Default stays dual-write repository only.
   * When set, `SnapshotStrategy` snapshots every `snapshotEveryNEvents` (default 200)
   * and `createGrid` runs catch-up on `grid.ready` (`last snapshot + events after version`).
   */
  snapshotStore?: SnapshotStore;
  /** Snapshot cadence when `snapshotStore` is set. Default 200. */
  snapshotEveryNEvents?: number;
  /** Optional plugins (Excel/PDF export+import, …) registered at composition root. */
  plugins?: readonly GridPlugin[];
  /**
   * Quick filter text (PR-93). Matching rows stay; others are hidden from the
   * UI row index / pagination. Distinct from `GridSearchPanel` find-and-navigate.
   * Updates after create: `api.setQuickFilter` / `controller.setQuickFilterText`.
   */
  quickFilterText?: string;
  /**
   * Single-level row grouping (PR-120 / RFC-002). Only the first column is
   * active in 0.12.0; API accepts `string[]` for forward compatibility.
   * Session-only — not EventStore. Updates: `api.setRowGroupColumns`.
   */
  groupBy?: string | readonly string[];
  /**
   * Whether row groups start expanded (PR-120). Default `true`.
   */
  groupDefaultExpanded?: boolean;
  /**
   * Start editing when a cell is activated (PR-126). Default `true`.
   * When `false`, use Enter / F2 / double-click / `api.startEditingCell`.
   */
  singleClickEdit?: boolean;
  /**
   * Commit the draft when the grid loses focus / `stopEditing` (PR-126).
   * Default `true`. Esc always cancels without writing EventStore.
   */
  stopEditingWhenCellsLoseFocus?: boolean;
  /**
   * `cell` (default) or `fullRow` — edit every editable column on the row (PR-126).
   * Host `onRowValueChanged` still fires per committed cell change.
   */
  editType?: import('../engine/dataOps/cellEditSession').CellEditType;
  /**
   * Row model (PR-96). Default `clientSide`.
   * `infinite` / `serverSide` skip local sort/filter and call `datasource.getRows`.
   * Full block cache is PR-102.
   */
  rowModelType?: RowModelType;
  /**
   * Server/infinite row source (PR-96). Required when `rowModelType` is not
   * `clientSide`.
   */
  datasource?: GridDatasource<NoInfer<TRow>>;
  /** Rows per server cache block (PR-102). Default 100. */
  cacheBlockSize?: number;
  /** Max blocks kept in LRU cache (PR-102). Default 10. */
  maxBlocksInCache?: number;
  /**
   * Clipboard copy uses formatted display strings when true (PR-106).
   * Default false (raw values for Excel round-trip).
   */
  copyFormattedValue?: boolean;
  /** Include column header row in clipboard output (PR-106). Default false. */
  copyHeadersToClipboard?: boolean;
  /**
   * Convert eastern digits to ASCII in clipboard text (PR-106).
   * Default true.
   */
  copyDigitsAsLatin?: boolean;
  /** Override per-cell clipboard text (PR-106). */
  processCellForClipboard?: import('../engine/selection/clipboardCopy').ClipboardCopyBuildOptions['processCellForClipboard'];
  /**
   * When true (default), clipboard paste past the last row adds rows (PR-107).
   */
  pasteAddsRows?: boolean;
  /** Fires before paste is applied; return false to cancel (PR-107). */
  onClipboardPaste?: import('../infrastructure/ui/gridClipboard').GridPasteRuntimeOptions['onClipboardPaste'];
  /**
   * Persist column layout (width, order, pin, hide, sort) to localStorage
   * under this key and restore on next create (PR-115).
   * When set, also emits `COLUMN_STATE_CHANGED` on the EventStore on change.
   */
  stateKey?: string;
};

export type CreateERPTableResult<TRow = unknown> = {
  engine: TableEngine;
  controller: UITableController;
  session: GridSession;
  table: Table;
  store: string;
  tableKey: string;
  columnMeta: Map<string, ColumnSchema>;
  columnDefinitions: ColumnDefinition[];
  columnBindings: ColumnViewBinding[];
  eventStore: EventStore;
  snapshotStrategy?: SnapshotStrategy;
  changelogProjection: ChangelogProjection;
  historyPanelViewModel: HistoryPanelViewModel;
  cellUndoStack: CellUndoStack;
  pluginHost: PluginHost;
  api: GridApi<TRow>;
  /** Online/offline + pending local mutations (PR-137). */
  offlineStatus: OfflineStatus;
  /** Cross-client sync when `syncTransport` was provided (PR-138). */
  syncPort?: SyncPort;
  /** Peer presence when `presence` / `presenceTransport` was set (PR-139). */
  presencePort?: PresencePort;
};

/** Same shape as `CreateERPTableConfig` (D24). */
export type CreateGridConfig<TRow = unknown> = CreateERPTableConfig<TRow>;

/**
 * Handle returned immediately by `createGrid`.
 * `engine` / `controller` / `session` / `api` are filled when `ready` resolves.
 */
export type CreateGridResult<TRow = unknown> = CreateERPTableResult<TRow> & {
  readonly ready: Promise<CreateGridResult<TRow>>;
};