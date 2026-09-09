// bootstrap/createERPTable.ts

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
  ConsoleAuditLogger,
} from '../infrastructure/Repositories/consoleAuditLogger';
import { FetchRemoteApi } from '../infrastructure/Repositories/fetchRemoteApi';
import { NoopRemoteApi } from '../infrastructure/Repositories/noopRemoteApi';
import { InMemoryEventStore } from '../infrastructure/eventStore/InMemoryEventStore';
import { IndexedDbEventStore } from '../infrastructure/eventStore/IndexedDbEventStore';
import { HistoryPanelViewModel } from '../infrastructure/history/HistoryPanelViewModel';
import { ChangelogProjection } from '../infrastructure/projections/ChangelogProjection';
import { UITableController } from '../infrastructure/ui/UITableController';
import { CellUndoStack } from '../application/undo/CellUndoStack';
import { createEngineGridQuery } from '../application/plugins/createEngineGridQuery';
import { PluginHost } from '../application/plugins/PluginHost';
import { DefaultGridSession } from '../infrastructure/session/DefaultGridSession';
import { mapColumnSchemas } from '../infrastructure/columns/mapColumnSchema';
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
  RowInput,
} from './type';

async function resolveEventStore(
  config: CreateERPTableConfig,
): Promise<EventStore> {
  if (config.eventStore) return config.eventStore;
  // Browser: durable event log alongside CachedTableRepository → IndexedDB.
  if (typeof indexedDB !== 'undefined') {
    return IndexedDbEventStore.open(`erp-table-events:${config.store}`);
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

export async function createERPTable(config: CreateERPTableConfig): Promise<CreateERPTableResult> {
 
  // ---------- infra ----------
  const repo = config.repo ?? new CachedTableRepository();
  const audit = config.audit ?? new ConsoleAuditLogger();
  const remoteApi =
    config.remoteApi ??
    (typeof window !== 'undefined' ? new FetchRemoteApi() : new NoopRemoteApi());
  const eventStore = await resolveEventStore(config);
  const changelogProjection = new ChangelogProjection(eventStore);
  const historyPanelViewModel = new HistoryPanelViewModel(changelogProjection);
  const cellUndoStack = new CellUndoStack();
  await changelogProjection.start();

  // ---------- محاسبه pageSize دقیقاً مثل نسخه اولیه ----------
  const page = 1;
  const pageSize = config.tableHeight
    ? Math.floor(config.tableHeight / 40)
    : config.recordPerPage ?? 10;
  // ---------- columns & rows (با چک repo) ----------
  const activeCollection = config.activeCollection ?? config.tableType;
  const buildResult = buildColumns(config.columns, config.rows, activeCollection);
  let { columns } = buildResult;
  const { columnMeta, collectionColumns } = buildResult;
  const normalizedRows: RowInput[] =
    config.rows.length
      ? config.rows
      : createInitialRows(collectionColumns) as RowInput[];
   const { rows, table: loadedTable } = await buildRows(
    collectionColumns,
    columnMeta,
    normalizedRows,
    repo,
    config.store,
    config.tableKey,
    remoteApi);
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
    config.tableKey,
    initialCollection,
    new Pagination(page, pageSize, pageSize),
    null,
    activeCollection ?? 'default'
  );
  if (loadedTable) {
    table.setColumns(Array.from(columns.values()));
    table.setPagination(new Pagination(page, pageSize, pageSize)); await repo.save(config.store, table);
  } else {
    await repo.save(config.store, table);
  }
  // ---------- policies & app ----------
  const permissionPolicy = createPermissionPolicy(config, columnMeta, table, repo, audit);
  const app = createTableAppService(repo, audit, permissionPolicy, { columnMeta, remoteApi }, eventStore);
  app.setUndoStack(cellUndoStack);

  // ---------- engine & session & controller ----------
  const engine = new TableEngine(app, repo, config.actor, audit);
  const session = new DefaultGridSession({
    engine,
    store: config.store,
    tableKey: config.tableKey,
    audit,
    changelogProjection,
    historyPanelViewModel,
    cellUndoStack,
  });
  const controller = new UITableController(
    engine,
    config.store,
    config.tableKey,
    audit,
    changelogProjection,
    historyPanelViewModel,
    cellUndoStack,
    session,
    remoteApi,
  );
  const { definitions: columnDefinitions, bindings: columnBindings } =
    mapColumnSchemas(config.columns);
  await controller.dispatch({ type: 'TABLE_REGISTERED', storeName: config.store, table });

  const pluginHost = new PluginHost({
    tableId: config.tableKey,
    actorId: config.actor.userId,
    eventStore,
    session,
    query: createEngineGridQuery(engine),
  });
  if (config.plugins?.length) {
    pluginHost.register(config.plugins);
  }

  return {
    engine,
    controller,
    session,
    table,
    tableKey: config.tableKey,
    columnMeta,
    columnDefinitions,
    columnBindings,
    eventStore,
    changelogProjection,
    historyPanelViewModel,
    cellUndoStack,
    pluginHost,
  };
}
