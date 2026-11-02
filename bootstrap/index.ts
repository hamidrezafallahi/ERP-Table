// bootstrap/index.ts — createGrid (sync) + deprecated createERPTable alias

import { Table } from '../domain/entities/Table';
import {
  Pagination,
  RowStateEnum,
} from '../domain/value-objects';
import { TableEngine } from '../engine/tableEngine';
import {
  CachedTableRepository,
} from '../infrastructure/Repositories/cachedTableRepository';
import {
  LocalTableRepository,
} from '../infrastructure/Repositories/localTableRepository';
import {
  isWindowedRepository,
  WindowedTableRepository,
} from '../application/ports/TableRepository';
import {
  ConsoleAuditLogger,
} from '../infrastructure/Repositories/consoleAuditLogger';
import { NoopRemoteApi } from '../infrastructure/Repositories/noopRemoteApi';
import { InMemoryEventStore } from '../infrastructure/eventStore/InMemoryEventStore';
import { IndexedDbEventStore } from '../infrastructure/eventStore/IndexedDbEventStore';
import { eventStoreDbName } from '../infrastructure/eventStore/eventStoreName';
import { trackEventStoreSubscriptions } from '../infrastructure/eventStore/trackedEventStore';
import { HistoryPanelViewModel } from '../infrastructure/history/HistoryPanelViewModel';
import { OfflineStatus } from '../application/offline/OfflineStatus';
import {
  createBrowserConnectivity,
  createLocalStorageWatermark,
} from '../infrastructure/offline';
import { ChangelogProjection } from '../infrastructure/projections/ChangelogProjection';
import { SnapshotStrategy } from '../infrastructure/snapshot/SnapshotStrategy';
import { createGridApi } from '../infrastructure/ui/createGridApi';
import { attachColumnStatePersistence } from '../infrastructure/ui/columnStatePersist';
import { UITableController } from '../infrastructure/ui/UITableController';
import {
  copyGridSelectionToClipboard,
  cutGridSelectionToClipboard,
  pasteGridFromClipboard,
} from '../infrastructure/ui/gridClipboard';
import { CellUndoStack } from '../application/undo/CellUndoStack';
import { createEngineGridQuery } from '../application/plugins/createEngineGridQuery';
import { PluginHost } from '../application/plugins/PluginHost';
import { attachServerRowModel } from '../application/rowModel/attachServerRowModel';
import { isServerRowModel } from '../application/ports/GridDatasource';
import { DefaultGridSession } from '../infrastructure/session/DefaultGridSession';
import { mapColumnSchemas } from '../infrastructure/columns/mapColumnSchema';
import {
  mapColDefOrGroups,
  mapColumnSchemasToDefs,
} from '../infrastructure/columns/mapColumnDef';
import { flattenColDefOrGroup } from '../infrastructure/columns/flattenColumnDefs';
import {
  defaultGetRowId,
  ensureIndexColumnDef,
  mapRowDataToRowInputs,
} from '../infrastructure/rows/mapRowData';
import type { EventStore } from '../application/ports/EventStore';
import {
  buildCollections,
  buildColumns,
  buildRows,
  createPermissionPolicy,
  createTableAppService,
  isInitiallyHidden,
} from './builders';
import {
  ColumnSchema,
  CreateERPTableConfig,
  CreateERPTableResult,
  CreateGridConfig,
  CreateGridResult,
  GetRowId,
  RowInput,
} from './type';
import type { ColumnDef } from '../domain/types/ColumnDef';
import {
  resolveCreateGridDefaults,
} from './defaults';

export {
  DEFAULT_GRID_ACTOR,
  DEFAULT_MEMORY_STORE,
  createGridTableKey,
  isPersistentStore,
  resolveCreateGridDefaults,
} from './defaults';

type ResolvedEventStore = {
  eventStore: EventStore;
  /** Set only when the grid itself opened the store (host stores are never closed). */
  close?: () => Promise<void>;
};

async function resolveEventStore(
  config: Pick<
    CreateERPTableConfig,
    'eventStore' | 'store' | 'eventStoreName' | 'persistence'
  >,
  persist: boolean,
): Promise<ResolvedEventStore> {
  if (config.eventStore) return { eventStore: config.eventStore };
  // Page-window mode: IndexedDB already holds the durable rows, so the audit /
  // undo log stays in memory unless the host injects its own `eventStore`.
  if (config.persistence === 'paged-idb') {
    return { eventStore: new InMemoryEventStore() };
  }
  // Durable log only when the host asked for a `store` (PR-83).
  if (persist && typeof indexedDB !== 'undefined') {
    const opened = await IndexedDbEventStore.open(
      eventStoreDbName(config.store as string, config.eventStoreName),
    );
    return { eventStore: opened, close: () => opened.close() };
  }
  return { eventStore: new InMemoryEventStore() };
}

/**
 * Ordered cleanup registry for everything `assembleGrid` creates. Disposers
 * run in reverse registration order, each isolated; `run()` is idempotent
 * (every call returns the same promise) and never rejects.
 */
type Disposer = () => void | Promise<void>;

function createDisposerRegistry(): {
  add(disposer: Disposer): void;
  run(): Promise<void>;
} {
  const disposers: Disposer[] = [];
  let running: Promise<void> | undefined;
  return {
    add(disposer) {
      disposers.push(disposer);
    },
    run() {
      if (!running) {
        running = (async () => {
          for (const disposer of disposers.splice(0).reverse()) {
            try {
              await disposer();
            } catch {
              // One failing disposer must not leak the rest.
            }
          }
        })();
      }
      return running;
    },
  };
}

function createInitialRows(
  collectionColumns: Map<string, Map<string, ColumnSchema>>
): RowInput[] {
  const rows: RowInput[] = [];
  for (const collectionName of collectionColumns.keys()) {
    rows.push({
      id: Date.now() + Math.floor(Math.random() * 1000000),
      collection: collectionName,
      values: {
        RowState: RowStateEnum.Added,
      },
    });
  }

  return rows;
}

function resolveHostColumns<TRow>(
  config: CreateERPTableConfig<TRow>,
): ColumnSchema[] {
  if (config.columns && config.columns.length > 0) return config.columns;
  const defs = ensureIndexColumnDef(config.columnDefs ?? []);
  if (defs.length === 0) return [];
  return mapColDefOrGroups(defs);
}

function resolveHostRows<TRow>(
  config: CreateERPTableConfig<TRow>,
  columns: ColumnSchema[],
): RowInput[] | undefined {
  if (config.rows && config.rows.length > 0) return config.rows;
  if (config.rowData === undefined) return undefined;
  const defs: ColumnDef<TRow>[] =
    config.columnDefs && config.columnDefs.length > 0
      ? flattenColDefOrGroup(ensureIndexColumnDef(config.columnDefs))
      : (mapColumnSchemasToDefs(columns) as ColumnDef<TRow>[]);
  return mapRowDataToRowInputs(
    config.rowData,
    defs,
    (config.getRowId ?? defaultGetRowId) as GetRowId<TRow>,
  );
}

/**
 * Builds the grid; on ANY failure everything created so far (opened event
 * store, subscriptions, projections …) is released before the error is
 * rethrown. On success `controller.releaseResources()` / `dispose()` run the
 * same registry.
 */
async function assembleGrid<TRow>(
  config: CreateERPTableConfig<TRow>,
): Promise<CreateERPTableResult<TRow>> {
  const registry = createDisposerRegistry();
  try {
    return await assembleGridInner(config, registry);
  } catch (error) {
    await registry.run();
    throw error;
  }
}

async function assembleGridInner<TRow>(
  config: CreateERPTableConfig<TRow>,
  registry: ReturnType<typeof createDisposerRegistry>,
): Promise<CreateERPTableResult<TRow>> {
  const { store, tableKey, actor, persist } = resolveCreateGridDefaults(config);
  const resolved: CreateERPTableConfig<TRow> = {
    ...config,
    store,
    tableKey,
    actor,
  };

  // ---------- infra ----------
  const pagedIdb = config.persistence === 'paged-idb';
  if (pagedIdb && !persist) {
    throw new Error(
      "[createGrid] persistence 'paged-idb' requires a non-empty `store`",
    );
  }
  // The page-window kit (repositories, seed, bulk delete) is loaded lazily so
  // the default entry stays within its bundle budget (separate chunk).
  const pagedKit =
    pagedIdb || (config.repo && isWindowedRepository(config.repo))
      ? await import('../infrastructure/Repositories/paged/pagedKit')
      : undefined;
  const repo =
    config.repo ??
    (pagedKit
      ? new pagedKit.PagedCachedTableRepository()
      : persist
        ? new CachedTableRepository()
        : new LocalTableRepository());
  const windowed = isWindowedRepository(repo);
  const audit = config.audit ?? new ConsoleAuditLogger();
  const remoteApi = config.remoteApi ?? new NoopRemoteApi();
  const resolvedStore = await resolveEventStore(resolved, persist);
  const { eventStore } = resolvedStore;
  // Registered first => runs last: close the connection only after every
  // consumer stopped (and only when this grid opened it).
  if (resolvedStore.close) registry.add(resolvedStore.close);
  // Internal consumers (projections, sync, plugins) subscribe through this
  // proxy so no subscription can outlive the grid. `eventStore` itself (the
  // host-visible one) stays the raw instance.
  const tracked = trackEventStoreSubscriptions(eventStore);
  registry.add(() => tracked.release());
  const internalStore = tracked.store;
  const changelogProjection = new ChangelogProjection(internalStore);
  registry.add(() => changelogProjection.dispose());
  const historyPanelViewModel = new HistoryPanelViewModel(changelogProjection);
  const cellUndoStack = new CellUndoStack();
  await changelogProjection.start();

  const offlineStatus = new OfflineStatus({
    tableId: tableKey,
    connectivity: config.connectivity ?? createBrowserConnectivity(),
    watermark: createLocalStorageWatermark(`pdg-sync-watermark:${store}:${tableKey}`),
  });
  registry.add(() => offlineStatus.dispose());
  await offlineStatus.start(internalStore);

  const engineRef: { current?: TableEngine } = {};
  const snapshotStrategy = config.snapshotStore
    ? new SnapshotStrategy(
        config.snapshotStore,
        internalStore,
        () =>
          engineRef.current?.getSnapShot('active') ?? {
            rows: [],
          },
        { everyNEvents: config.snapshotEveryNEvents },
      )
    : undefined;

  // ---------- محاسبه pageSize دقیقاً مثل نسخه اولیه ----------
  const page = 1;
  const rowHeight = config.rowHeight ?? 40;
  const pageSize = config.tableHeight
    ? Math.floor(config.tableHeight / rowHeight)
    : config.recordPerPage ?? 10;
  // ---------- columns & rows (با چک repo) ----------
  const activeCollection = config.activeCollection ?? config.tableType;
  const hostColumns = resolveHostColumns(config);
  const hostRows = resolveHostRows(config, hostColumns);
  const usingRowData =
    config.rowData !== undefined && !(config.rows && config.rows.length > 0);
  const buildResult = buildColumns(
    hostColumns,
    hostRows ?? config.rows ?? [],
    activeCollection,
  );
  let { columns } = buildResult;
  const { columnMeta, collectionColumns } = buildResult;
  const normalizedRows: RowInput[] = usingRowData
    ? (hostRows ?? [])
    : hostRows?.length
      ? hostRows
      : createInitialRows(collectionColumns);
   const { rows, table: loadedTable } = await buildRows(
    collectionColumns,
    columnMeta,
    normalizedRows,
    repo,
    store,
    tableKey,
    remoteApi,
    { skipPersistLoad: windowed ? false : usingRowData || !persist },
  );
  const initialCollection = buildCollections(
    collectionColumns,
    rows
  );
  if (loadedTable) {
    columns = new Map<string, ColumnSchema>();
    const rowList = Array.from(rows.values());
    const collectionName = activeCollection ?? 'default';
    for (const [columnKey, col] of buildResult.columns) {
      columns.set(columnKey, {
        ...col,
        hidden: isInitiallyHidden(col, rowList, collectionName),
      });
    }
  }
  // ---------- table ----------
  // Pagination total = ACTIVE collection's own row count (windowed mode):
  // rows.size spans every collection on multi-collection pages.
  const activeRowCount = windowed
    ? initialCollection.get(activeCollection ?? 'default')?.getRows().size ??
      rows.size
    : pageSize;
  let table = loadedTable || new Table(
    tableKey,
    initialCollection,
    new Pagination(page, pageSize, activeRowCount),
    null,
    activeCollection ?? 'default'
  );
  if (windowed && pagedKit) {
    table.setPageWindow(true);
    await pagedKit.seedWindowedTable({
      repo: repo as WindowedTableRepository,
      store,
      tableKey,
      table,
      loadedTable,
      columns,
      columnMeta,
      page,
      pageSize,
      activeRowCount,
    }).then((w) => {
      table = w;
    });
  } else if (loadedTable) {
    table.setColumns(Array.from(columns.values()));
    table.setPagination(new Pagination(page, pageSize, pageSize)); await repo.save(store, table);
  } else {
    await repo.save(store, table);
  }
  // ---------- policies & app ----------
  const permissionPolicy = createPermissionPolicy(resolved, columnMeta, table, repo, audit);
  const app = createTableAppService(repo, audit, permissionPolicy, { columnMeta, remoteApi }, eventStore);
  app.setUndoStack(cellUndoStack);
  if (windowed && pagedKit) {
    app.setDeleteRowsHandler(
      new pagedKit.DeleteRowsCommandHandler(
        repo as WindowedTableRepository,
        audit,
        permissionPolicy,
      ),
    );
  }
  if (snapshotStrategy) {
    app.setSnapshotStrategy(snapshotStrategy);
  }

  // ---------- engine & session & controller ----------
  const engine = new TableEngine(app, repo, actor, audit, columnMeta);
  engineRef.current = engine;
  const session = new DefaultGridSession({
    engine,
    store,
    tableKey,
    audit,
    changelogProjection,
    historyPanelViewModel,
    cellUndoStack,
  });
  const controller = new UITableController(
    engine,
    store,
    tableKey,
    audit,
    changelogProjection,
    historyPanelViewModel,
    cellUndoStack,
    session,
    remoteApi,
    offlineStatus,
  );
  controller.setResourceTeardown(() => registry.run());

  let syncPort: import('../application/ports/SyncPort').SyncPort | undefined;
  if (config.syncTransport) {
    const { GridSyncService } = await import('../application/sync/GridSyncService');
    syncPort = new GridSyncService({
      tableId: tableKey,
      eventStore: internalStore,
      offlineStatus,
      transport: config.syncTransport,
      policy: config.syncConflictPolicy,
      applyCellValue: (rowId, columnId, value) =>
        controller.applySyncedCellValue(rowId, columnId, value),
    });
    const syncService = syncPort;
    registry.add(() => syncService.dispose?.());
    controller.setSyncPort(syncPort);
  }

  let presencePort: import('../application/ports/PresencePort').PresencePort | undefined;
  const presenceTransport =
    config.presenceTransport ??
    (config.presence
      ? (
          await import('../infrastructure/presence/broadcastChannelTransport')
        ).createBroadcastChannelPresenceTransport(
          `pdg-presence:${store}:${tableKey}`,
        )
      : undefined);
  if (presenceTransport) {
    const { GridPresenceService } = await import(
      '../application/presence/GridPresenceService'
    );
    presencePort = new GridPresenceService({
      tableId: tableKey,
      actorId: actor.userId,
      label: config.presenceLabel ?? actor.userId,
      transport: presenceTransport,
    });
    const presenceService = presencePort;
    registry.add(() => presenceService.dispose());
    controller.setPresencePort(presencePort);
  }

  const { definitions: columnDefinitions, bindings: columnBindings } =
    mapColumnSchemas(hostColumns);
  await controller.dispatch({ type: 'TABLE_REGISTERED', storeName: store, table });

  if (typeof config.quickFilterText === 'string' && config.quickFilterText.length > 0) {
    controller.setQuickFilterText(config.quickFilterText);
  }

  if (config.groupBy != null) {
    const cols =
      typeof config.groupBy === 'string'
        ? [config.groupBy]
        : [...config.groupBy];
    controller.setRowGroupColumns(cols);
  }
  if (typeof config.groupDefaultExpanded === 'boolean') {
    controller.setGroupDefaultExpanded(config.groupDefaultExpanded);
  }

  engine.setCellEditOptions({
    ...(typeof config.singleClickEdit === 'boolean'
      ? { singleClickEdit: config.singleClickEdit }
      : {}),
    ...(typeof config.stopEditingWhenCellsLoseFocus === 'boolean'
      ? { stopEditingWhenCellsLoseFocus: config.stopEditingWhenCellsLoseFocus }
      : {}),
    ...(config.editType === 'cell' || config.editType === 'fullRow'
      ? { editType: config.editType }
      : {}),
    // Page-window (document) grids keep the arianERP write-per-change
    // contract; the event-sourced grid avoids one EventStore write per key.
    commit:
      config.cellEditCommit === 'immediate' || config.cellEditCommit === 'deferred'
        ? config.cellEditCommit
        : pagedIdb
          ? 'immediate'
          : 'deferred',
    ...(config.enterNavigation === 'nextCell' || config.enterNavigation === 'down'
      ? { enterNavigation: config.enterNavigation }
      : {}),
  });

  controller.configureClipboard({
    copyFormattedValue: config.copyFormattedValue,
    copyHeadersToClipboard: config.copyHeadersToClipboard,
    copyDigitsAsLatin: config.copyDigitsAsLatin,
    processCellForClipboard: config.processCellForClipboard,
    pasteAddsRows: config.pasteAddsRows,
  });
  session.attachCopyCells(() =>
    copyGridSelectionToClipboard(engine, controller.getClipboardOptions()),
  );
  session.attachCutCells(() =>
    cutGridSelectionToClipboard(
      engine,
      store,
      tableKey,
      controller.getClipboardOptions(),
    ),
  );
  session.attachPasteCells(async () => {
    const result = await pasteGridFromClipboard(
      engine,
      store,
      tableKey,
      controller.getClipboardOptions(),
    );
    return result.applied > 0 || result.rowsAdded > 0;
  });

  let refreshServerSide: (() => Promise<void>) | undefined;
  if (
    isServerRowModel(config.rowModelType) &&
    config.datasource
  ) {
    const handle = attachServerRowModel({
      engine,
      session,
      rowModelType: config.rowModelType!,
      datasource: config.datasource,
      columnDefs: config.columnDefs,
      getRowId: config.getRowId,
      cacheBlockSize: config.cacheBlockSize ?? config.recordPerPage,
      maxBlocksInCache: config.maxBlocksInCache,
    });
    refreshServerSide = () => handle.refreshServerSide();
    registry.add(() => handle.dispose());
  }

  if (snapshotStrategy) {
    await snapshotStrategy.loadWithCatchUp(`table:${tableKey}`);
  }

  const pluginHost = new PluginHost({
    tableId: tableKey,
    actorId: actor.userId,
    eventStore: internalStore,
    session,
    query: createEngineGridQuery(engine),
    beforeRead: () => engine.flushCellEdit(),
  });
  registry.add(() => pluginHost.dispose());
  if (config.plugins?.length) {
    pluginHost.register(config.plugins);
  }

  const api = createGridApi({
    controller,
    pluginHost,
    columnDefs: config.columnDefs,
    getRowId: config.getRowId,
    refreshServerSide,
  });

  const detachColumnState = await attachColumnStatePersistence({
    api,
    controller,
    tableId: tableKey,
    actorId: actor.userId,
    stateKey: config.stateKey,
    eventStore: internalStore,
  });
  registry.add(detachColumnState);

  return {
    engine,
    controller,
    session,
    table,
    store,
    tableKey,
    columnMeta,
    columnDefinitions,
    columnBindings,
    eventStore,
    snapshotStrategy,
    changelogProjection,
    historyPanelViewModel,
    cellUndoStack,
    pluginHost,
    api,
    offlineStatus,
    syncPort,
    presencePort,
  };
}

/**
 * Sync composition root (D24). Returns immediately; EventStore / snapshot
 * load runs in the background. Await `grid.ready` before using `engine` / `api`.
 */
export function createGrid<TRow = unknown>(
  config: CreateGridConfig<TRow> = {},
): CreateGridResult<TRow> {
  const identity = resolveCreateGridDefaults(config);
  // Do not fill the in-memory default `store` back into config — assembleGrid
  // re-resolves, and a set `store` means persist (PR-83).
  const resolved: CreateERPTableConfig<TRow> = {
    ...config,
    tableKey: identity.tableKey,
    actor: identity.actor,
    store: identity.persist ? identity.store : undefined,
  };

  const grid = {
    store: identity.store,
    tableKey: identity.tableKey,
  } as CreateGridResult<TRow>;

  // Page-window mode keys every IndexedDB record by `tableKey`; a generated
  // key would silently orphan the data on the next open.
  const missingPagedKey =
    config.persistence === 'paged-idb' &&
    !(typeof config.tableKey === 'string' && config.tableKey.length > 0);

  const ready: Promise<CreateGridResult<TRow>> = (
    missingPagedKey
      ? Promise.reject(
          new Error("[createGrid] persistence 'paged-idb' requires `tableKey`"),
        )
      : assembleGrid(resolved)
  ).then(
    (assembled) => {
      Object.assign(grid, assembled);
      return grid;
    },
  );
  Object.defineProperty(grid, 'ready', {
    value: ready,
    enumerable: true,
    configurable: false,
    writable: false,
  });
  return grid;
}

/**
 * @deprecated Prefer {@link createGrid} (D24). `await createERPTable(cfg)` is
 * equivalent to `await createGrid(cfg).ready`.
 */
export function createERPTable<TRow = unknown>(
  config: CreateERPTableConfig<TRow> = {},
): Promise<CreateGridResult<TRow>> {
  return createGrid(config).ready;
}
