// bootstrap/builders.ts

import {
  ApplyDynamicProjectionHandler,
  ApplyRowVisibilityHandler,
  ChangeCellDisplayValueHandler,
  ChangeCellValueHandler,
  SaveDescriptionHandler,
} from '../../application/handlers/cellCommandsHandler';
import {
  AddNewRowCommandHandler,
  AddNewRowsCommandHandler,
  DeleteRowCommandHandler,
  DeleteRowsCommandHandler,
  DuplicateRowCommandHandler,
  PasteRowCommandHandler,
  ReorderRowCommandHandler,
  RestoreAddedRowCommandHandler,
} from '../../application/handlers/rowCommandsHandler';
import {
  ChangePageCommandHandler,
  ChangePageSizeCommandHandler,
  ReorderColumnCommandHandler,
  SetActiveCollectionCommandHandler,
  DeleteTableCommandHandler,
  ResetTableCommandHandler,
} from '../../application/handlers/tableCommandHandler';
import { AuditLogger } from '../../application/ports/AuditLogger';
import type { EventStore } from '../../application/ports/EventStore';
import type { RemoteApi } from '../../application/ports/RemoteApi';
import {
  isWindowedRepository,
  TableRepository,
} from '../../application/ports/TableRepository';
import { TableAppService } from '../../application/TableAppService';
import { PasteCellsCommandHandler } from '../../application/handlers/pasteCellsCommandsHandler';
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
  ColumnSchema,
  CreateERPTableConfig,
  RowInput,
} from '../type';

/* ======================================================
   helpers
   ====================================================== */

/**
 * بازسازی visibilityCondition یک سطر از روی مقادیر فعلی سلول‌هایش.
 * کلیدها fieldName ستون‌های whenFieldTruthy (مقدارِ ستون منبع) و
 * whenRemoteFlag (ستون خودش) هستند — دقیقاً همان کلیدهایی که UI
 * (cellRenderer / MobileRowFormModal) و isInitiallyHidden چک می‌کنند.
 * Only rows of the column's OWN collection are consulted — no cross-collection leak.
 */
export function rebuildRowVisibilityCondition(
  row: Row,
  columnMeta: Map<string, ColumnSchema>,
): void {
  const rowCollection = row.getCollection() ?? 'default';
  const condition: Record<string, boolean> = {};
  for (const colCfg of columnMeta.values()) {
    if ((colCfg.fieldCollection ?? 'default') !== rowCollection) continue;
    const v = colCfg.visibility;
    if (v?.kind === 'whenFieldTruthy') {
      condition[colCfg.fieldName] = !!row.readValue(v.fieldName);
    } else if (v?.kind === 'whenRemoteFlag') {
      // فلگ ریموت در دسترس نیست؛ «محتوا داشتن» خودش دلیل کافی برای نمایش است.
      condition[colCfg.fieldName] = !!row.readValue(colCfg.fieldName);
    }
  }
  row.setVisibilityCondition(condition);
}

export const isInitiallyHidden = (
  col: ColumnSchema,
  inputRows: RowInput[] | Row[],
  activeCollection: string = "default"
): boolean => {
  // شرط ۱: همیشه نمایش داده بشه (مگر ColumnDef.hide / schema.hidden صریح)
  if (col.visibility.kind === "always") {
    return col.hidden === true;
  }

  if (col.visibility.kind === "never") {
    return true;
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

  // شرط ۲ و ۳: بررسی مقدار و visibilityCondition — فقط بین سطرهای کالکشن خودِ ستون.
  // A dependent column that holds data becomes visible ONLY in its OWN
  // collection (fieldCollection, falling back to the active collection).
  // The value scan must never cross collections: a value in one tab must
  // not unhide the same-named column in other tabs.
  const scopeCollection = col.fieldCollection ?? activeCollection ?? "default";
  const isVisibleByCondition = inputRows.some(r => {
    if (r instanceof Row) {
      const domainRow = r as Row;
      // فقط سطرهای کالکشن خود ستون
      if (domainRow.getCollection() !== scopeCollection) return false;
      // شرط ۳: visibilityCondition با true
      if (domainRow.getVisibilityCondition()?.[col.fieldName] === true) {
        return true;
      }
      // whenRemoteFlag: فلگ ریموت در دسترس نیست؛ محتوا داشتنِ سلول خود ستون
      // (در کالکشن خودش) کافی است تا ستون در ویرایش نمایان شود.
      if (
        col.visibility?.kind === "whenRemoteFlag" &&
        !!domainRow.readValue(col.fieldName)
      ) {
        return true;
      }
      // شرط ۲: مقدار داره
      return !!domainRow.readValue(col.fieldName);
    } else {
      const inputRow = r as RowInput;
      // فقط سطرهای کالکشن خود ستون
      const rowCollection = inputRow.collection ?? inputRow.rowType ?? "default";
      if (rowCollection !== scopeCollection) return false;
      // شرط ۲: مقدار داره
      return inputRow.values?.[col.fieldName] != null &&
        inputRow.values?.[col.fieldName] !== "";
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
  remoteApi: RemoteApi,
  options?: { skipPersistLoad?: boolean },
): Promise<{ rows: Map<number, Row>; table?: Table }> {
  let rowMap = new Map<number, Row>();
  // ---------- rows: ابتدا IndexedDB, fallback به ورودی ----------
  const exist =
    options?.skipPersistLoad ? false : await repo.exists(store, tableKey)
  if (exist) {
    const persistedTable = await repo.getById(store, tableKey);
    rowMap = new Map<number, Row>(
      persistedTable.getRows().map(r => [r.id.value, r])
    );
    // سطرهای بازخوانی‌شده از IndexedDB با visibilityCondition خالی از ذخیره‌ی
    // ران قبل می‌آیند (ویرایش): visibilityCondition هر سطر باید از روی مقادیر
    // فعلی خودش بازسازی شود تا ستون‌های شرطیِ whenFieldTruthy / whenRemoteFlag
    // که محتوا دارند در بارگذاری اولیه نمایان شوند — قرارداد: ستون وابسته‌ای
    // که محتوا دارد فقط در کالکشن خودش قابل رویت است.
    for (const row of rowMap.values()) {
      rebuildRowVisibilityCondition(row, columnMeta);
    }
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

      // PR-101: host `rowData` path — keep values on `r.data`, only allocate index.
      const rowStateEarly =
        ((r.values ?? {})["RowState"] as RowStateEnum | undefined) ??
        RowStateEnum.Unchanged;
      const canLazyHost =
        r.data != null &&
        typeof r.data === 'object' &&
        rowStateEarly === RowStateEnum.Unchanged;
      if (canLazyHost) {
        let needsEager = false;
        for (const [, schema] of columns) {
          const colKey = `${schema.fieldCollection ?? 'default'}_${schema.fieldName}`;
          const meta = columnMeta.get(colKey);
          if (
            (meta?.computed?.dependsOn &&
              meta.computed.dependsOn.length > 0) ||
            meta?.columnDef?.valueGetter
          ) {
            needsEager = true;
            break;
          }
        }
        if (!needsEager) {
          const indexValue =
            (r.values as Record<string, unknown> | undefined)?.index ??
            (r.values as Record<string, unknown> | undefined)?.RowNum ??
            idx + 1;
          cells.set(
            'index',
            new Cell(
              rowId,
              ColumnId.for('index'),
              indexValue,
              indexValue,
              indexValue,
            ),
          );
          rowMap.set(
            rowId.value,
            new Row(
              rowId,
              cells,
              new RowState(rowStateEarly),
              new Set(),
              {},
              r.collection ?? r.rowType ?? rowCollection,
              false,
              r.data,
              r.sourceId ?? String(r.id),
            ),
          );
          continue;
        }
      }

      for (const [columnKey, schema] of columns) {
        const colKey = `${schema.fieldCollection ?? 'default'}_${schema.fieldName}`;
        const colId = schema.fieldName
        const meta = columnMeta.get(colKey);
        if (!meta) continue;
        const values = r.values ?? {};
        const hostData = r.data ?? values;
        const getter = meta.columnDef?.valueGetter;
        const incoming = getter
          ? getter({ data: hostData })
          : meta.returnValue?.(values, colId) ??
            (values as Record<string, unknown>)?.[colId] ??
            (hostData && typeof hostData === 'object'
              ? (hostData as Record<string, unknown>)[colId]
              : null) ??
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
          value = (await meta.computed.compute(values, remoteApi)) as unknown as
            | {}
            | null;
          display = value;
        } else if (meta.columnDef?.valueFormatter) {
          display = meta.columnDef.valueFormatter({
            value,
            data: hostData,
          });
        } else if (incoming != null && schema.displayFormat) {
          display = schema.displayFormat(incoming) as {} | null;
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
      const rowState =
        ((r.values ?? {})["RowState"] as RowStateEnum | undefined) ??
        RowStateEnum.Unchanged;
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
          false,
          r.data,
          r.sourceId ?? String(r.id),
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
      // PR-101: do not call getCell here — that would materialize every host
      // field. Reuse the existing cell map (index-only for lazy rowData).
      const cells = new Map(
        (row as { cells: Map<string, Cell> }).cells.entries(),
      );
      void columns;
      collectionRows.set(
        row.id.value,
        new Row(
          row.id,
          cells,
          row.rowState,
          new Set(row.changeFields),
          row.getVisibilityCondition(),
          collectionName,
          row.isSaveDescription,
          row.data,
          row.sourceId,
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
  config: Pick<CreateERPTableConfig, 'rowAccess'>,
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
    const { allowRoles, denyRoles, rule } = meta.colAccess;
    if (!checkRoleAccess(actor, allowRoles, denyRoles)) {
      return false;
    }
    if (rule) {
      // Page-window: bootstrap `table` may be stale after loadPage
      const row = table.getRow(rowId);
      if (!row) return true;
      return rule({ actor, row, table });
    }
    return true;
  };

  const resolveRowAccess = (
    actor: Actor,
    rowId?: number
  ): boolean => {
    const rowAccess = config.rowAccess;

    if (!rowId) {
      if (!rowAccess) return true;
      const { allowRoles, denyRoles, rule } = rowAccess;
      if (!checkRoleAccess(actor, allowRoles, denyRoles)) {
        return false;
      }
      if (rule) {
        return rule({ actor, table });
      }
      return true;
    }

    // Page-window: `table` closed over at bootstrap may be a stale page snapshot
    // after loadPage. Do NOT deny solely because the row isn't on that snapshot.
    if (!rowAccess) return true;

    const { allowRoles, denyRoles, rule } = rowAccess;
    if (!checkRoleAccess(actor, allowRoles, denyRoles)) {
      return false;
    }
    if (rule) {
      const row = table.getRow(rowId);
      if (!row) {
        // Roles already passed; row may live on another page / newer Table instance
        return true;
      }
      return rule({ actor, row, table });
    }
    return true;
  };

  return {
    canChangeCell: ({ actor, rowId, columnId }) => resolveColumnAccess(actor, rowId, columnId),
    canEdit: ({ actor, rowId, columnId }) => resolveColumnAccess(actor, rowId, columnId),
    canAddRow: ({ actor }) => resolveRowAccess(actor),
    canCopyRow: ({ actor, rowId }) => resolveRowAccess(actor, rowId),
    canDeleteRow: ({ actor, rowId }) => resolveRowAccess(actor, rowId),
    canReorderRow: ({ actor, rowId }) => resolveRowAccess(actor, rowId),
    canReorderColumn: ({ actor }) => resolveRowAccess(actor),
  };
}

export function createTableAppService(
  repo: TableRepository,
  audit: AuditLogger,
  permissionPolicy: PermissionPolicy,
  { columnMeta, remoteApi }: { columnMeta: Map<string, ColumnSchema>; remoteApi: RemoteApi },
  eventStore?: EventStore
): TableAppService {
  const changeCellHandler = new ChangeCellValueHandler(repo, audit, permissionPolicy, { columnMeta, remoteApi });
  const applyDynamicProjection = new ApplyDynamicProjectionHandler(repo, audit, permissionPolicy, { columnMeta, remoteApi });
  const applyRowVisibility = new ApplyRowVisibilityHandler(repo, audit, permissionPolicy, { columnMeta, remoteApi });
  const changeCellDisplayHandler = new ChangeCellDisplayValueHandler(repo, audit, permissionPolicy);
  const saveDescriptionHandler = new SaveDescriptionHandler(repo, audit, permissionPolicy);
  const addNewRowHandler = new AddNewRowCommandHandler(repo, audit, permissionPolicy);
  const addNewRowsHandler = new AddNewRowsCommandHandler(repo, audit, permissionPolicy);
  const duplicateRowHandler = new DuplicateRowCommandHandler(repo, audit, permissionPolicy);
  const pasteRowHandler = new PasteRowCommandHandler(repo, audit, permissionPolicy);
  const pasteCellsHandler = new PasteCellsCommandHandler(
    repo,
    audit,
    permissionPolicy,
  );
  const deleteRowHandler = new DeleteRowCommandHandler(repo, audit, permissionPolicy);
  const restoreAddedRowHandler = new RestoreAddedRowCommandHandler(
    repo,
    audit,
    permissionPolicy,
  );
  const deleteRowsHandler = isWindowedRepository(repo)
    ? new DeleteRowsCommandHandler(repo, audit, permissionPolicy)
    : undefined;
  const deleteTableHandler = new DeleteTableCommandHandler(repo, audit, permissionPolicy);
  const resetTableHandler = new ResetTableCommandHandler(repo, audit, permissionPolicy);
  const reorderRowHandler = new ReorderRowCommandHandler(repo, audit, permissionPolicy);
  const reorderColumnHandler = new ReorderColumnCommandHandler(repo, audit, permissionPolicy);
  const setPageSize = new ChangePageSizeCommandHandler(repo, audit);
  const setPage = new ChangePageCommandHandler(repo, audit);
  const setActiveCollection = new SetActiveCollectionCommandHandler(repo, audit);

  const appService = new TableAppService(
    changeCellHandler,
    changeCellDisplayHandler,
    saveDescriptionHandler,
    addNewRowHandler,
    addNewRowsHandler,
    duplicateRowHandler,
    deleteRowHandler,
    reorderRowHandler,
    setPageSize,
    setPage,
    setActiveCollection,
    deleteTableHandler,
    resetTableHandler,
    applyDynamicProjection,
    pasteCellsHandler,
    restoreAddedRowHandler,
    pasteRowHandler,
    reorderColumnHandler,
    applyRowVisibility,
    deleteRowsHandler,
  );

  appService.setRepository(repo);

  if (eventStore) {
    appService.setEventStore(eventStore);
  }

  return appService;
}
