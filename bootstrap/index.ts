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
import { UITableController } from '../infrastructure/ui/UITableController';
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
  RowInput,
} from './type';

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

export async function createERPTable(config: CreateERPTableConfig) {
 
  // ---------- infra ----------
  const repo = config.repo ?? new CachedTableRepository();
  const audit = config.audit ?? new ConsoleAuditLogger();
  const remoteApi = config.remoteApi ?? new FetchRemoteApi();

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
    for (const col of config.columns) {
      const fieldCollection = col.fieldCollection ?? 'default';
      const columnKey = `${fieldCollection}_${col.fieldName}`;
      columns.set(columnKey, {
        ...col,
        fieldCollection,
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
  const app = createTableAppService(repo, audit, permissionPolicy, { columnMeta, remoteApi });

  // ---------- engine & controller ----------
  const engine = new TableEngine(app, repo, config.actor, audit);
  const controller = new UITableController(engine, config.store, config.tableKey, audit);
  await controller.dispatch({ type: 'TABLE_REGISTERED', storeName: config.store, table });
  return { engine, controller, table, tableKey: config.tableKey, columnMeta };
}
