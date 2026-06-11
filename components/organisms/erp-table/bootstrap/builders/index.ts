// bootstrap/builders.ts

import {
  ApplyDynamicProjectionHandler,
  ChangeCellDisplayValueHandler,
  ChangeCellValueHandler,
  SaveDescriptionHandler,
} from '../../application/handlers/cellCommandsHandler';
import {
  AddNewRowCommandHandler,
  AddNewRowsCommandHandler,
  DeleteRowCommandHandler,
  DuplicateRowCommandHandler,
  ReorderRowCommandHandler,
} from '../../application/handlers/rowCommandsHandler';
import {
  ChangePageCommandHandler,
  ChangePageSizeCommandHandler,
  ChangeTableTypeCommandHandler,
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
  FetchRemoteApi,
} from '../../infrastructure/Repositories/fetchRemoteApi'; // اگر نیاز باشد
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
      className: col.className,
      renderType: col.fieldType,
      editable: col.computed ? false : col.fieldType === 'index' ? false : true,
      expandable: col.fieldName === 'index',
      hidden: isInitiallyHidden(col, rows),
      rules: col.rules,
      dynamicValue: col.dynamicSource,
      selectOptions: col.selectOptions,
      indexOptions: col.indexOptions,
      onChange: col.onChange,
      displayFormat: col.displayFormat,
      minWidth: col.minWidth,
      style: col.style,
      popUpWidth: col.popUpWidth,
      dynamicSelectFilterOption: col.dynamicSelectFilterOption,
      labelValue: col.labelValue,
      enableDeleteButton: col.enableDeleteButton,
      enableExpandButton: col.enableExpandButton,
      enableMoveButton: col.enableMoveButton,
      enableOptionsButton: col.enableOptionsButton,
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
  tableType: string,
  remoteApi: FetchRemoteApi
): Promise<{ rows: Map<number, Row>; table?: Table }> {
  let rowMap = new Map<number, Row>();
  // ---------- rows: ابتدا IndexedDB, fallback به ورودی ----------
  const exist = await repo.exists(store, tableKey)
  if (exist) {
    const persistedTable = await repo.getById(store, tableKey);
    rowMap = new Map<number, Row>(
      persistedTable.getRows().map(r => [r.id.value, r])
    );
    return { rows: rowMap, table: persistedTable };
  } else {
    const rows = inputRows && inputRows.length > 0 ? inputRows.sort((a, b) => a.id - b.id) : [{ id: ((1 + Math.random()) * 0x10000000000000000), RowNum: 1, values: { RowState: RowStateEnum.Added }, moreDetails: undefined, rowType: tableType }];
    for (const [idx, r] of rows.entries()) {
      const rowId = new RowId(r.id);
      const cells = new Map<string, Cell>();
      for (const [colId, schema] of columns.entries()) {
        const meta = columnMeta.get(colId);
        const hasValue = Object.prototype.hasOwnProperty.call(r.values ?? {}, colId);
        const incoming = hasValue ? (meta.returnValue?.(r.values, colId) ?? r.values?.[colId]) : null;
        const RowNum = r.values['RowNum'];
        const description = hasValue
          ? (meta.returnDisplayValue?.(r.values, colId) ?? r.values[colId.replace(/Id$/, '')]?.[colId.replace(/Id$/, 'Desc')])
          : undefined;
        let value = meta.fieldType === 'index' ? RowNum ?? idx + 1 : incoming ?? null;
        let display = meta.fieldType === 'index' ? RowNum ?? idx + 1 : description ?? incoming;
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
      const visibilityCondition = new Object() as Record<string, boolean>;
      rowMap.set(
        rowId.value,
        new Row(
          rowId,
          cells,
          new RowState(inputRows?.length > 0 ? RowStateEnum.Unchanged : RowStateEnum.Added),
          new Set(),
          r.moreDetails,
          visibilityCondition,
          r.rowType,
          false
        )
      );
    }
    return { rows: rowMap };
  }
}

export function createPermissionPolicy(
  config: CreateERPTableConfig,
  columnMeta: Map<string, IDetailColumnConfig>,
  table: Table,
  repo: TableRepository,
  audit: AuditLogger
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
  const applyDynamicProjection = new ApplyDynamicProjectionHandler(repo, audit, permissionPolicy, { columnMeta, remoteApi });
  const changeCellDisplayHandler = new ChangeCellDisplayValueHandler(repo, audit, permissionPolicy);
  const saveDescriptionHandler = new SaveDescriptionHandler(repo, audit, permissionPolicy);
  const addNewRowHandler = new AddNewRowCommandHandler(repo, audit, permissionPolicy);
  const addNewRowsHandler = new AddNewRowsCommandHandler(repo, audit, permissionPolicy);
  const duplicateRowHandler = new DuplicateRowCommandHandler(repo, audit, permissionPolicy);
  const deleteRowHandler = new DeleteRowCommandHandler(repo, audit, permissionPolicy);
  const deleteTableHandler = new DeleteTableCommandHandler(repo, audit, permissionPolicy);
  const resetTableHandler = new ResetTableCommandHandler(repo, audit, permissionPolicy);
  const reorderRowHandler = new ReorderRowCommandHandler(repo, audit, permissionPolicy);
  const unitLevelHandler = new ChangeUnitLevelHandler(repo, audit, { columnMeta, remoteApi });
  const setPageSize = new ChangePageSizeCommandHandler(repo, audit);
  const setPage = new ChangePageCommandHandler(repo, audit);
  const changeTableType = new ChangeTableTypeCommandHandler(repo, audit);

  return new TableAppService(
    changeCellHandler,
    changeCellDisplayHandler,
    saveDescriptionHandler,
    addNewRowHandler,
    addNewRowsHandler,
    duplicateRowHandler,
    deleteRowHandler,
    reorderRowHandler,
    unitLevelHandler,
    setPageSize,
    setPage,
    changeTableType,
    deleteTableHandler,
    resetTableHandler,
    applyDynamicProjection
  );
}
