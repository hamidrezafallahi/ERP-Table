// bootstrap/createERPTable.ts

import { CachedTableRepository } from '../adapters/infra/cachedTableRepository';
import { ConsoleAuditLogger } from '../adapters/infra/consoleAuditLogger';
import { FetchRemoteApi } from '../adapters/infra/fetchRemoteApi';
import { UITableController } from '../adapters/ui/UITableController';
import { Table } from '../domain/entities/Table';
import {
  ColumnSchema,
  Pagination,
} from '../domain/value-objects';
import { TableEngine } from '../engine/tableEngine';
import {
  buildColumns,
  buildRows,
  createPermissionPolicy,
  createTableAppService,
} from './builders';
import { CreateERPTableConfig } from './type';

export async function createERPTable(config: CreateERPTableConfig) {
  // ---------- infra ----------
  const repo = config.repo ?? new CachedTableRepository();
  const audit = config.audit ?? new ConsoleAuditLogger();
  const remoteApi = new FetchRemoteApi();

  // ---------- محاسبه pageSize دقیقاً مثل نسخه اولیه ----------

  // ---------- columns & rows (با چک repo) ----------
  let { columns, columnMeta } = buildColumns(config.columns, config.rows);
  let { rows, table: loadedTable } = await buildRows(
    columns,
    columnMeta,
    config.rows,
    repo,
    config.store,
    config.tableKey,
    remoteApi
  );
  if (loadedTable) {
    columns = new Map<string, ColumnSchema>();
    for (const col of config.columns) {
      const hasValue = loadedTable.getRows().some(r=>r.getCell(col.fieldName)?.getValue()?.value);
      columns.set(col.fieldName, {
        id: col.fieldName,
        title: col.fieldCaption,
        renderType: col.fieldType,
        editable: col.editable ?? true,
        expandable: col.fieldName === 'index' && loadedTable.getRows().some(row => row.getMoreDetails()),
        hidden: col.visibility?.kind !== 'always' && !hasValue,
        required: col.required ?? false,
        dynamicValue: col.dynamicSource,
        selectOptions: col.selectOptions,
        indexOptions: col.indexOptions,
        displayFormat: col.displayFormat,
      });
    }
  }

  // ---------- table ----------
  const table = loadedTable || new Table(config.tableKey, rows, columns, new Pagination(config.page, config.pageSize, config.totalRecords));
  if (loadedTable) {
    table.setColumns(Array.from(columns.values()));
    table.setPagination(new Pagination(config.page, config.pageSize, config.totalRecords));
    await repo.save(config.store, table);
  } else {
    await repo.save(config.store, table);
  }
  // ---------- policies & app ----------
  const permissionPolicy = createPermissionPolicy(config, columnMeta, table);
  const app = createTableAppService(repo, audit, permissionPolicy, { columnMeta, remoteApi });

  // ---------- engine & controller ----------
  const engine = new TableEngine(app, repo, config.actor, audit);
  const controller = new UITableController(engine, config.store, config.tableKey);
  await controller.dispatch({ type: 'TABLE_REGISTERED', storeName: config.store, table });
  return { engine, controller, table, tableKey: config.tableKey, columnMeta };
}