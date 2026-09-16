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
  ConsoleAuditLogger,
} from '../infrastructure/Repositories/consoleAuditLogger';
import { NoopRemoteApi } from '../infrastructure/Repositories/noopRemoteApi';
import { InMemoryEventStore } from '../infrastructure/eventStore/InMemoryEventStore';
import { IndexedDbEventStore } from '../infrastructure/eventStore/IndexedDbEventStore';
import { eventStoreDbName } from '../infrastructure/eventStore/eventStoreName';
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

async function resolveEventStore(
  config: Pick<CreateERPTableConfig, 'eventStore' | 'store' | 'eventStoreName'>,
  persist: boolean,
): Promise<EventStore> {
  if (config.eventStore) return config.eventStore;
  // Durable log only when the host asked for a `store` (PR-83).
  if (persist && typeof indexedDB !== 'undefined') {
    return IndexedDbEventStore.open(
      eventStoreDbName(config.store as string, config.eventStoreName),
    );
  }
  return new InMemoryEventStore();
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

async function assembleGrid<TRow>(
  config: CreateERPTableConfig<TRow>,
): Promise<CreateERPTableResult<TRow>> {
  const { store, tableKey, actor, persist } = resolveCreateGridDefaults(config);
  const resolved: CreateERPTableConfig<TRow> = {
    ...config,
    store,
    tableKey,
    actor,
  };

  // ---------- infra ----------
  const repo =
    config.repo ??
    (persist ? new CachedTableRepository() : new LocalTableRepository());
  const audit = config.audit ?? new ConsoleAuditLogger();
  const remoteApi = config.remoteApi ?? new NoopRemoteApi();
  const eventStore = await resolveEventStore(resolved, persist);
  const changelogProjection = new ChangelogProjection(eventStore);
  const historyPanelViewModel = new HistoryPanelViewModel(changelogProjection);
  const cellUndoStack = new CellUndoStack();
  await changelogProjection.start();

  const offlineStatus = new OfflineStatus({
    tableId: tableKey,
    connectivity: config.connectivity ?? createBrowserConnectivity(),
    watermark: createLocalStorageWatermark(`pdg-sync-watermark:${store}:${tableKey}`),
  });
  await offlineStatus.start(eventStore);

  const engineRef: { current?: TableEngine } = {};
  const snapshotStrategy = config.snapshotStore
    ? new SnapshotStrategy(
        config.snapshotStore,
        eventStore,
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
    { skipPersistLoad: usingRowData || !persist },
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
  const table = loadedTable || new Table(
    tableKey,
    initialCollection,
    new Pagination(page, pageSize, pageSize),
    null,
    activeCollection ?? 'default'
  );
  if (loadedTable) {
    table.setColumns(Array.from(columns.values()));
    table.setPagination(new Pagination(page, pageSize, pageSize)); await repo.save(store, table);
  } else {
    await repo.save(store, table);
  }
  // ---------- policies & app ----------
  const permissionPolicy = createPermissionPolicy(resolved, columnMeta, table, repo, audit);
  const app = createTableAppService(repo, audit, permissionPolicy, { columnMeta, remoteApi }, eventStore);
  app.setUndoStack(cellUndoStack);
  if (snapshotStrategy) {
    app.setSnapshotStrategy(snapshotStrategy);
  }

  // ---------- engine & session & controller ----------
  const engine = new TableEngine(app, repo, actor, audit);
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

  let syncPort: import('../application/ports/SyncPort').SyncPort | undefined;
  if (config.syncTransport) {
    const { GridSyncService } = await import('../application/sync/GridSyncService');
    syncPort = new GridSyncService({
      tableId: tableKey,
      eventStore,
      offlineStatus,
      transport: config.syncTransport,
      policy: config.syncConflictPolicy,
      applyCellValue: (rowId, columnId, value) =>
        controller.applySyncedCellValue(rowId, columnId, value),
    });
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
  }

  if (snapshotStrategy) {
    await snapshotStrategy.loadWithCatchUp(`table:${tableKey}`);
  }

  const pluginHost = new PluginHost({
    tableId: tableKey,
    actorId: actor.userId,
    eventStore,
    session,
    query: createEngineGridQuery(engine),
  });
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

  await attachColumnStatePersistence({
    api,
    controller,
    tableId: tableKey,
    actorId: actor.userId,
    stateKey: config.stateKey,
    eventStore,
  });

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

  const ready: Promise<CreateGridResult<TRow>> = assembleGrid(resolved).then(
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
