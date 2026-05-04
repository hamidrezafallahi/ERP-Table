// bootstrap/createERPTable.ts

import { Table } from '../domain/entities/Table';
import {
  ColumnSchema,
  Pagination,
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
  const page = 1;
  const pageSize = config.tableHeight
    ? Math.floor(config.tableHeight / 40)
    : config.recordPerPage ?? 10;
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
      const visibilityValues = loadedTable.getRows().map(r => r.visibilityCondition?.[col.fieldName]);
      const isVisible = visibilityValues.some(v => v === true);
      const hasValue = loadedTable.getRows().some(r => r.getCell(col.fieldName)?.getValue()?.value) || isVisible;
      columns.set(col.fieldName, {
        id: col.fieldName,
        title: col.fieldCaption,
        renderType: col.fieldType,
        editable: col.editable ?? true,
        expandable: col.fieldName === 'index' && loadedTable.getRows().some(row => row.getMoreDetails()),
        hidden: col.visibility?.kind !== 'always' && !hasValue,
        rules: col.rules ?? [],
        dynamicValue: col.dynamicSource,
        selectOptions: col.selectOptions,
        indexOptions: col.indexOptions,
        onChange: col.onChange,
        displayFormat: col.displayFormat,
        width:col.width,
        popUpWidth:col.popUpWidth,
        labelValue:col.labelValue

      });
    }
  }
  // ---------- table ----------
  const table = loadedTable || new Table(config.tableKey, rows, columns, new Pagination(page, pageSize, pageSize),null); if (loadedTable) {
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
  const controller = new UITableController(engine, config.store, config.tableKey);
  await controller.dispatch({ type: 'TABLE_REGISTERED', storeName: config.store, table });
  return { engine, controller, table, tableKey: config.tableKey, columnMeta };
}