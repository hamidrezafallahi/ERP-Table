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
  SetActiveCollectionCommandHandler,
  ChangeUnitLevelHandler,
  DeleteTableCommandHandler,
  ResetTableCommandHandler,
} from '../../application/handlers/tableCommandHandler';
import { AuditLogger } from '../../application/ports/AuditLogger';
import { TableRepository } from '../../application/ports/TableRepository';
import { TableAppService } from '../../application/TableAppService';
import { Cell } from '../../domain/entities/Cell';
import { Collection } from '../../domain/entities/Collection';
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
  RowId,
  RowState,
  RowStateEnum,
} from '../../domain/value-objects';
import {
  FetchRemoteApi,
} from '../../infrastructure/Repositories/fetchRemoteApi'; // اگر نیاز باشد
import {
  ColumnSchema,
  CreateERPTableConfig,
  RowInput,
} from '../type';

/* ======================================================
   helpers
   ====================================================== */

export const isInitiallyHidden = (
  col: ColumnSchema,
  inputRows: RowInput[] | Row[],
  activeCollection: string = "default"
): boolean => {
  // شرط ۱: همیشه نمایش داده بشه
  if (col.visibility.kind === "always") {
    return false;
  }

  // شرط ۴: ستون مختص این collection هست
  if (
    (col.visibility.kind === "whenCollection" &&
      col.visibility.collection === activeCollection) ||
    (col.visibility.kind === "whenTableType" &&
      col.visibility.tableType === activeCollection)
  ) {
    return false;
  }

  // شرط ۲ و ۳: بررسی مقدار و visibilityCondition
  const isVisibleByCondition = inputRows.some(r => {
    if (r instanceof Row) {
      const domainRow = r as Row;
      // شرط ۳: visibilityCondition با true
      if (domainRow.getVisibilityCondition()?.[col.fieldName] === true) {
        return true;
      }
      // شرط ۲: مقدار داره و activeCollection برابر default
      if (activeCollection === "default") {
        return !!domainRow.getCell(col.fieldName)?.getValue();
      }
      return false;
    } else {
      const inputRow = r as RowInput;
      // شرط ۲: مقدار داره و activeCollection برابر default
      if (activeCollection === "default") {
        return inputRow.values?.[col.fieldName] != null &&
          inputRow.values?.[col.fieldName] !== "";
      }
      return false;
    }
  });

  if (isVisibleByCondition) {
    return false;
  }

  // در غیر این صورت مخفی باشه
  return true;
};

/* ======================================================
   builders
   ====================================================== */

export function buildColumns(
  columnsConfig: ColumnSchema[],
  rows: RowInput[],
  activeCollection?: string
): {
  columns: Map<string, ColumnSchema>;
  columnMeta: Map<string, ColumnSchema>;
  collectionColumns: Map<string, Map<string, ColumnSchema>>;
} {
  const columns = new Map<string, ColumnSchema>();
  const columnMeta = new Map<string, ColumnSchema>();

  // collectionName => columns
  const collectionColumns = new Map<string, Map<string, ColumnSchema>>();

  const sortedColumns = [...columnsConfig].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  for (const col of sortedColumns) {
    const schema: ColumnSchema = {
      ...col,
      editable: col.computed
        ? false
        : col.fieldType === "index"
          ? false
          : col.editable ?? true,
      fieldCollection: col.fieldCollection ?? "default",
      expandable: col.fieldName === "index" && col.expandable,
      hidden: isInitiallyHidden(col, rows, activeCollection),
    };
    const collectionName = schema.fieldCollection ?? "default";
    const columnKey = `${col.fieldCollection ?? 'default'}_${col.fieldName}`;
    columns.set(columnKey, schema);
    columnMeta.set(columnKey, col);
    if (!collectionColumns.has(collectionName)) {
      collectionColumns.set(collectionName, new Map());
    }

    collectionColumns.get(collectionName)!.set(schema.fieldName, schema);
  }
  return {
    columns,
    columnMeta,
    collectionColumns,
  };
}

export async function buildRows(  collectionColumns: Map<string, Map<string, ColumnSchema>>,
  columnMeta: Map<string, ColumnSchema>,
  inputRows: RowInput[],
  repo: TableRepository,
  store: string,
  tableKey: string,
  remoteApi: FetchRemoteApi,
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
    const rows = inputRows.sort((a, b) => a.id - b.id)
    for (const [idx, r] of rows.entries()) {
      const rowId = new RowId(r.id);
      const cells = new Map<string, Cell>();
      const rowCollection = r.collection ?? r.rowType ?? "default";
      const columns = collectionColumns.get(rowCollection);
      if (!columns) {
        throw new Error(
          `Collection '${rowCollection}' not found`
        );
      }
      for (const [columnKey, schema] of columns) {
        const colKey = `${schema.fieldCollection ?? 'default'}_${schema.fieldName}`;
        const colId = schema.fieldName
        const meta = columnMeta.get(colKey);
        if (!meta) continue;
        const values = r.values ?? {};
        const incoming =
          meta.returnValue?.(values, colId) ??
          (values as Record<string, unknown>)?.[colId] ??
          null;
        const rowNum =
          (values as Record<string, unknown>)?.["RowNum"];
        const description =
          meta.returnDisplayValue?.(values, colId) ?? undefined;
        let value =
          meta.fieldType === "index"
            ? (rowNum ?? idx + 1)
            : (incoming ?? null);

        let display =
          meta.fieldType === "index"
            ? (rowNum ?? idx + 1)
            : (description ?? incoming);
        // if (meta.returnDisplayValue) {
        // console.log(colId, rowCollection, meta.returnDisplayValue, meta.fieldCollection, columnMeta, description, display)
        // }

        // 6. computed override
        if (meta?.computed?.dependsOn) {
          value = (await meta.computed.compute(values, remoteApi)) as unknown as {} | null;
          display = value;
        } else if (incoming != null && schema.displayFormat) {
          display = schema.displayFormat(incoming);
        }
        // 7. final cell creation
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
      const rowState = (r.values["RowState"] as RowStateEnum | undefined) ?? RowStateEnum.Unchanged;
      const uniqueId = new RowId(Math.floor((1 + Math.random()) * 0x10000000000000000));
      rowMap.set(
        uniqueId.value,
        new Row(
          rowId,
          cells,
          new RowState(rowState),
          new Set(),
          visibilityCondition,
          r.collection ?? r.rowType ?? rowCollection,
          false
        )
      );
    }
    return { rows: rowMap };
  }
}
export function buildCollections(
  collectionColumns: Map<string, Map<string, ColumnSchema>>,
  rows: Map<number, Row>
): Map<string, Collection> {
  const collectionMap = new Map<string, Collection>();
  for (const [collectionName, columns] of collectionColumns) {
    const collectionRows = new Map<number, Row>();
    for (const [rowId, row] of rows) {
      if (row.collection !== collectionName)
        continue;
      const cells = new Map<string, Cell>();
      for (const [, column] of columns) {
        const cell = row.getCell(column.fieldName);
        if (cell) {
          cells.set(column.fieldName, cell);
        }
      }
      collectionRows.set(
        row.id.value,
        new Row(
          row.id,
          cells,
          row.rowState,
          new Set(row.changeFields),
          row.getVisibilityCondition(),
          collectionName,
          row.isSaveDescription
        )
      );
    }
    collectionMap.set(
      collectionName,
      new Collection(
        collectionName,
        collectionRows,
        columns
      )
    );
  }
  return collectionMap;
}




export function createPermissionPolicy(
  config: CreateERPTableConfig,
  columnMeta: Map<string, ColumnSchema>,
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
  { columnMeta, remoteApi }: { columnMeta: Map<string, ColumnSchema>; remoteApi: FetchRemoteApi }
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
  const unitLevelHandler = new ChangeUnitLevelHandler(repo, audit);
  const setPageSize = new ChangePageSizeCommandHandler(repo, audit);
  const setPage = new ChangePageCommandHandler(repo, audit);
  const setActiveCollection = new SetActiveCollectionCommandHandler(repo, audit);

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
    setActiveCollection,
    deleteTableHandler,
    resetTableHandler,
    applyDynamicProjection
  );
}
