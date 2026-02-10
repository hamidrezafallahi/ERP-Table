// bootstrap/createERPTable.ts

import { CachedTableRepository } from '../adapters/infra/cachedTableRepository';
import { ConsoleAuditLogger } from '../adapters/infra/consoleAuditLogger';
import { FetchRemoteApi } from '../adapters/infra/fetchRemoteApi';
import { UITableController } from '../adapters/ui/UITableController';
import {
  ChangeCellDisplayValueHandler,
  ChangeCellValueHandler,
} from '../application/handlers/cellCommandsHandler';
import {
  AddNewRowCommandHandler,
  DeleteRowCommandHandler,
  DuplicateRowCommandHandler,
  ReorderRowCommandHandler,
} from '../application/handlers/rowCommandsHandler';
import {
  ChangePageCommandHandler,
  ChangePageSizeCommandHandler,
  ChangeUnitLevelHandler,
  DeleteTableCommandHandler,
  ResetTableCommandHandler,
} from '../application/handlers/tableCommandHandler';
import { TableRepository } from '../application/ports/TableRepository';
import { TableAppService } from '../application/TableAppService';
import { Cell } from '../domain/entities/Cell';
import { Row } from '../domain/entities/Row';
import { Table } from '../domain/entities/Table';
import { PermissionPolicy } from '../domain/policies';
import {
  CellDisplay,
  CellValue,
  ColumnId,
  ColumnSchema,
  RowId,
  RowState,
  RowStateEnum,
} from '../domain/value-objects';
import { TableEngine } from '../engine/tableEngine';
import {
  CreateERPTableConfig,
  IDetailColumnConfig,
  RowInput,
} from './type';

/* ======================================================
   helpers
   ====================================================== */

const isInitiallyHidden = (col: IDetailColumnConfig, inputRows: RowInput[]): boolean => {
  if (inputRows.some(r => Object.keys(r.values).includes(col.fieldName))) {
    return false
  } else if (!col.visibility || col.visibility.kind == "always") {
    return false;
  } else {
    return true;
  }

};

export async function buildTable(
  store: string,
  tableKey: string,
  columnsConfig: IDetailColumnConfig[],
  repo: TableRepository,
  rows?: RowInput[]
): Promise<{ table: Table; columnMeta: Map<string, IDetailColumnConfig> }> {
  let rowMap = new Map<number, Row>();
  const columns = new Map<string, ColumnSchema>();
  const columnMeta = new Map<string, IDetailColumnConfig>();
  const remoteApi = new FetchRemoteApi();

  // ---------- columnMeta & ColumnSchema ----------
  const sortedColumns = [...columnsConfig].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const col of sortedColumns) {
    const schema: ColumnSchema = {
      id: col.fieldName,
      title: col.fieldCaption,
      renderType: col.fieldType,
      editable: col.computed ? false : col.fieldType === 'index' ? false : true,
      hidden: isInitiallyHidden(col, rows),
      required: col.required,
      dynamicValue: col.dynamicSource,
      selectOptions: col.selectOptions,
      indexOptions: col.indexOptions,
      displayFormat: col.displayFormat
    };
    columns.set(schema.id, schema);
    columnMeta.set(schema.id, col);
  }

  // ---------- rows: ابتدا IndexedDB, fallback به ورودی ----------
if (await repo.exists(store, tableKey)) {
  const persistedTable = await repo.getById(store, tableKey);
  rowMap = new Map<number, Row>(
    persistedTable.getRows().map(r => [r.id.value, r])
  );
} else {
  const inputRows = rows && rows.length > 0 ? rows.sort((a, b) => a.id - b.id) : [{ id: 1, values: { RowState: RowStateEnum.Added } }];

  for (const [idx, r] of inputRows.entries()) {
    const rowId = new RowId(r.id);
    const cells = new Map<string, Cell>();

    for (const [colId, schema] of columns.entries()) {
      const meta = columnMeta.get(colId);
      const incoming = r.values?.[colId];
      const RowNum = r.values['RowNum'];

      // مقدار اولیه
      let value = meta.fieldType === 'index' ? RowNum ?? idx + 1 : incoming ?? null;
      let display = meta.fieldType === 'index' ? RowNum ?? idx + 1 : incoming ?? incoming;

      // اگر ستون computed داشت، مقدار async اش را await کن
      if (meta?.computed?.dependsOn) {
        value = await meta.computed.compute(r.values, remoteApi);
        display = value;
      } else if (incoming && schema.displayFormat) {
        display = schema.displayFormat(incoming);
      }

      cells.set(
        colId,
        new Cell(
          rowId,
          new ColumnId(colId),
          new CellValue(value),
          new CellValue(value),
          new CellDisplay(display)
        )
      );
    }

    rowMap.set(
      rowId.value,
      new Row(
        rowId,
        cells,
        new RowState(rows?.length > 0 ? RowStateEnum.Unchanged : RowStateEnum.Added),
        new Set()
      )
    );
  }
}

  const table = new Table(tableKey, rowMap, columns);
  return { table, columnMeta };
}

/* ======================================================
   bootstrap
   ====================================================== */

export async function createERPTable(config: CreateERPTableConfig) {


  // ---------- infra ----------
  const repo = config.repo ?? new CachedTableRepository()
  const audit = config.audit ?? new ConsoleAuditLogger();
  const remoteApi = new FetchRemoteApi();

  // ---------- columnMeta ----------
  const columnMeta: Map<string, IDetailColumnConfig> = new Map(
    config.columns.map(c => [c.fieldName, c])
  );
  // ---------- table (async build + fallback) ----------
  let table: Table;
  if (await repo.exists(config.store, config.tableKey)) {
    table = await repo.getById(config.store, config.tableKey);
    const columns = new Map<string, ColumnSchema>();
    for (const col of config.columns) {
      // const hasValue = table.getRows().some(r => Object.keys(r.getCell(col.fieldName).getValue().value))
      const hasValue =  table.getRows()[0].getCell(col.fieldName).getValue().value
      columns.set(col.fieldName, {
        id: col.fieldName,
        title: col.fieldCaption,
        renderType: col.fieldType,
        editable: col.editable ?? true,
        hidden: col.visibility.kind !== 'always' && hasValue == null,
        required: col.required ?? false,
        selectOptions: col.selectOptions,
        indexOptions: col.indexOptions,
        dynamicValue: col.dynamicSource,
        displayFormat: col.displayFormat,
      });
    }
    const columnsArray: ColumnSchema[] = Array.from(columns.values());
    table.setColumns(columnsArray);
  } else {
    const built = await buildTable(config.store, config.tableKey, config.columns, repo, config.rows);
    table = built.table;
    await repo.save(config.store, table);
  }

  // ---------- policies ----------
  const permissionPolicy: PermissionPolicy =
    config.permissionPolicy ?? {
      canChangeCell: ({ actor }) => actor.roles.includes('ADMIN'),
      canAddRow: ({ actor }) => actor.roles.includes('ADMIN'),
      canDeleteRow: ({ actor }) => actor.roles.includes('ADMIN'),
      canReorderRow: ({ actor }) => actor.roles.includes('ADMIN'),
      canEdit: ({ actor }) => actor.roles.includes('ADMIN'),
    };
  // ---------- handlers ----------
  // console.log('new handlers')
  const changeCellHandler = new ChangeCellValueHandler(
    repo,
    audit,
    permissionPolicy,
    { columnMeta, remoteApi }
  );
  const changeCellDisplayHandler = new ChangeCellDisplayValueHandler(
    repo,
    audit,
    permissionPolicy,
  );
  const addRowHandler = new AddNewRowCommandHandler(repo, audit, permissionPolicy);
  const duplicateRowHandler = new DuplicateRowCommandHandler(repo, audit, permissionPolicy);
  const deleteRowHandler = new DeleteRowCommandHandler(repo, audit, permissionPolicy);
  const deleteTableHandler = new DeleteTableCommandHandler(repo, audit, permissionPolicy);
  const resetTableHandler = new ResetTableCommandHandler(repo, audit, permissionPolicy);
  const reorderRowHandler = new ReorderRowCommandHandler(repo, audit, permissionPolicy);
  const unitLevelHandler = new ChangeUnitLevelHandler(repo, audit, { columnMeta, remoteApi });
  const setPageSize = new ChangePageSizeCommandHandler(repo, audit);
  const setPage = new ChangePageCommandHandler(repo, audit);
  // ---------- application ----------
  const app = new TableAppService(
    changeCellHandler,
    changeCellDisplayHandler,
    addRowHandler,
    duplicateRowHandler,
    deleteRowHandler,
    reorderRowHandler,
    unitLevelHandler,
    setPageSize,
    setPage,
    deleteTableHandler,
    resetTableHandler,
  );
  // ---------- engine ----------
  // console.log('TableEngine')
  const engine = new TableEngine(app, repo, config.actor);
  // ---------- controller ----------
  const controller = new UITableController(engine, config.store, config.tableKey);
  await controller.dispatch({type:'TABLE_REGISTERED',storeName:config.store,table})
  return {
    engine,
    controller,
    table,
    tableKey: config.tableKey,
    columnMeta
  };
}