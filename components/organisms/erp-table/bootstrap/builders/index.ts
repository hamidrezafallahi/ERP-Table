// bootstrap/builders.ts

import {
  FetchRemoteApi,
} from '../../adapters/infra/fetchRemoteApi'; // اگر نیاز باشد
import {
  ChangeCellDisplayValueHandler,
  ChangeCellValueHandler,
} from '../../application/handlers/cellCommandsHandler';
import {
  AddNewRowCommandHandler,
  DeleteRowCommandHandler,
  DuplicateRowCommandHandler,
  ReorderRowCommandHandler,
} from '../../application/handlers/rowCommandsHandler';
import {
  ChangePageCommandHandler,
  ChangePageSizeCommandHandler,
  ChangeUnitLevelHandler,
  DeleteTableCommandHandler,
  ResetTableCommandHandler,
} from '../../application/handlers/tableCommandHandler';
import { AuditLogger } from '../../application/ports/AuditLogger';
import { TableRepository } from '../../application/ports/TableRepository';
import { TableAppService } from '../../application/TableAppService';
import { Cell } from '../../domain/entities/Cell';
import { Row } from '../../domain/entities/Row';
import { Table } from '../../domain/entities/Table';
import {
  Actor,
  PermissionPolicy,
} from '../../domain/policies';
import {
  CellDisplay,
  CellValue,
  ColumnId,
  ColumnSchema,
  RowId,
  RowState,
  RowStateEnum,
} from '../../domain/value-objects';
import {
  CreateERPTableConfig,
  IDetailColumnConfig,
  RowInput,
} from '../type';

/* ======================================================
   helpers
   ====================================================== */

export const isInitiallyHidden = (col: IDetailColumnConfig, inputRows: RowInput[]): boolean => {
  if (inputRows.some(r => Object.keys(r.values).includes(col.fieldName))) {
    return false;
  } else if (!col.visibility || col.visibility.kind === "always") {
    return false;
  } else {
    return true;
  }
};

/* ======================================================
   builders
   ====================================================== */

export function buildColumns(
  columnsConfig: IDetailColumnConfig[],
  rows: RowInput[]
): { columns: Map<string, ColumnSchema>; columnMeta: Map<string, IDetailColumnConfig> } {
  const columns = new Map<string, ColumnSchema>();
  const columnMeta = new Map<string, IDetailColumnConfig>();
  const sortedColumns = [...columnsConfig].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const col of sortedColumns) {
    const schema: ColumnSchema = {
      id: col.fieldName,
      title: col.fieldCaption,
      renderType: col.fieldType,
      editable: col.computed ? false : col.fieldType === 'index' ? false : true,
      expandable: col.fieldName === 'index',
      hidden: isInitiallyHidden(col, rows),
      required: col.required,
      dynamicValue: col.dynamicSource,
      selectOptions: col.selectOptions,
      indexOptions: col.indexOptions,
      displayFormat: col.displayFormat,
    };
    columns.set(schema.id, schema);
    columnMeta.set(schema.id, col);
  }
  return { columns, columnMeta };
}

export async function buildRows(
  columns: Map<string, ColumnSchema>,
  columnMeta: Map<string, IDetailColumnConfig>,
  inputRows: RowInput[],
  repo: TableRepository,
  store: string,
  tableKey: string,
  remoteApi: FetchRemoteApi
): Promise<{ rows: Map<number, Row>; table?: Table }> {
  const rowMap = new Map<number, Row>();

  const persistedExists = await repo.exists(store, tableKey);

  let sourceRows: RowInput[];

  if (persistedExists) {
    const persistedTable = await repo.getById(store, tableKey);
    const persistedRows = persistedTable.getRows();

    for (const r of persistedRows) {
      rowMap.set(r.id.value, r);
    }

    sourceRows = inputRows;
    const builtRows = await buildRowCollection(
      sourceRows,
      columns,
      columnMeta,
      remoteApi,
      inputRows.length > 0 ? RowStateEnum.Unchanged : RowStateEnum.Added
    );

    builtRows.forEach(r => rowMap.set(r.id.value, r));
    persistedTable.addRows(builtRows);

    return { rows: rowMap, table: persistedTable };
  }

  // fallback
  sourceRows = inputRows?.length
    ? [...inputRows].sort((a, b) => a.id - b.id)
    : [{
      id: 1,
      values: { RowState: RowStateEnum.Added },
      moreDetails: undefined
    }];

  const builtRows = await buildRowCollection(
    sourceRows,
    columns,
    columnMeta,
    remoteApi,
    sourceRows.length > 0 ? RowStateEnum.Unchanged : RowStateEnum.Added
  );

  builtRows.forEach(r => rowMap.set(r.id.value, r));

  return { rows: rowMap };
}
async function buildRowCollection(
  rows: RowInput[],
  columns: Map<string, ColumnSchema>,
  columnMeta: Map<string, IDetailColumnConfig>,
  remoteApi: FetchRemoteApi,
  rowState: RowStateEnum
): Promise<Row[]> {

  return Promise.all(
    rows.map((r, idx) =>
      buildSingleRow(r, idx, columns, columnMeta, remoteApi, rowState)
    )
  );
}
async function buildSingleRow(
  r: RowInput,
  idx: number,
  columns: Map<string, ColumnSchema>,
  columnMeta: Map<string, IDetailColumnConfig>,
  remoteApi: FetchRemoteApi,
  rowState: RowStateEnum
): Promise<Row> {
  const rowId = new RowId(r.id);
  const cells = new Map<string, Cell>();

  const cellPromises = Array.from(columns.entries()).map(async ([colId, schema]) => {

    const meta = columnMeta.get(colId)!;
    const incoming = r.values?.[colId];
    const rowNum = r.values?.['RowNum'];

    let value =
      meta.fieldType === 'index'
        ? rowNum ?? idx + 1
        : incoming ?? null;

    let display = value;
    const obj = r.values[meta.fieldName.substring(0, meta.fieldName.length - 2)]
    if (meta.fieldType == 'selectOption' && obj) {
      const descKey = Object.keys(obj).find(key => key.endsWith('Desc'));
      const value = obj[descKey];
      display = schema.displayFormat ? schema.displayFormat(value) : value
    } else
      if (meta?.computed?.dependsOn) {
        value = await meta.computed.compute(r.values, remoteApi);
        display = value;
      } else if (incoming && schema.displayFormat) {
        display = schema.displayFormat(incoming);
      }

    return [
      colId,
      new Cell(
        rowId,
        new ColumnId(colId),
        new CellValue(value),
        new CellValue(value),
        new CellDisplay(display)
      )
    ] as const;
  });

  const resolvedCells = await Promise.all(cellPromises);

  resolvedCells.forEach(([colId, cell]) => {
    cells.set(colId, cell);
  });

  return new Row(
    rowId,
    cells,
    new RowState(rowState),
    new Set(),
    r.moreDetails
  );
}
export function createPermissionPolicy(
  config: CreateERPTableConfig,
  columnMeta: Map<string, IDetailColumnConfig>,
  table: Table,
): PermissionPolicy {
  const checkRoleAccess = (
    actor: Actor,
    allowRoles?: string[],
    denyRoles?: string[]
  ): boolean => {
    if (denyRoles?.some(r => actor.roles.includes(r))) {
      return false;
    }
    if (allowRoles) {
      return allowRoles.some(r => actor.roles.includes(r));
    }
    return true;
  };

  const resolveColumnAccess = (
    actor: Actor,
    rowId: number,
    columnId: string
  ): boolean => {
    const meta = columnMeta.get(columnId);
    if (!meta?.colAccess) return true;
    const row = table.getRow(rowId);
    if (!row) return false;
    const { allowRoles, denyRoles, rule } = meta.colAccess;
    if (!checkRoleAccess(actor, allowRoles, denyRoles)) {
      return false;
    }
    if (rule) {
      return rule({ actor, row, table });
    }
    return true;
  };

  const resolveRowAccess = (
    actor: Actor,
    rowId?: number
  ): boolean => {
    if (!rowId) {
      const rowAccess = config.rowAccess;
      if (!rowAccess) return true;
      const { allowRoles, denyRoles, rule } = rowAccess;
      if (!checkRoleAccess(actor, allowRoles, denyRoles)) {
        return false;
      }
      if (rule) {
        return rule({ actor, table });
      }
      return true;
    } else {
      const row = table.getRow(rowId);
      if (!row) return false;
      const rowAccess = config.rowAccess;
      if (!rowAccess) return true;
      const { allowRoles, denyRoles, rule } = rowAccess;
      if (!checkRoleAccess(actor, allowRoles, denyRoles)) {
        return false;
      }
      if (rule) {
        return rule({ actor, row, table });
      }
      return true;
    }
  };

  return {
    canChangeCell: ({ actor, rowId, columnId }) => resolveColumnAccess(actor, rowId, columnId),
    canEdit: ({ actor, rowId, columnId }) => resolveColumnAccess(actor, rowId, columnId),
    canAddRow: ({ actor }) => resolveRowAccess(actor),
    canCopyRow: ({ actor, rowId }) => resolveRowAccess(actor, rowId),
    canDeleteRow: ({ actor, rowId }) => resolveRowAccess(actor, rowId),
    canReorderRow: ({ actor, rowId }) => resolveRowAccess(actor, rowId),
  };
}

export function createTableAppService(
  repo: TableRepository,
  audit: AuditLogger,
  permissionPolicy: PermissionPolicy,
  { columnMeta, remoteApi }: { columnMeta: Map<string, IDetailColumnConfig>; remoteApi: FetchRemoteApi }
): TableAppService {
  const changeCellHandler = new ChangeCellValueHandler(repo, audit, permissionPolicy, { columnMeta, remoteApi });
  const changeCellDisplayHandler = new ChangeCellDisplayValueHandler(repo, audit, permissionPolicy);
  const addRowHandler = new AddNewRowCommandHandler(repo, audit, permissionPolicy);
  const duplicateRowHandler = new DuplicateRowCommandHandler(repo, audit, permissionPolicy);
  const deleteRowHandler = new DeleteRowCommandHandler(repo, audit, permissionPolicy);
  const deleteTableHandler = new DeleteTableCommandHandler(repo, audit, permissionPolicy);
  const resetTableHandler = new ResetTableCommandHandler(repo, audit, permissionPolicy);
  const reorderRowHandler = new ReorderRowCommandHandler(repo, audit, permissionPolicy);
  const unitLevelHandler = new ChangeUnitLevelHandler(repo, audit, { columnMeta, remoteApi });
  const setPageSize = new ChangePageSizeCommandHandler(repo, audit);
  const setPage = new ChangePageCommandHandler(repo, audit);

  return new TableAppService(
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
    resetTableHandler
  );
}