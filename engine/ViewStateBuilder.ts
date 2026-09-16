// engine/ViewStateBuilder.ts

import { ColumnSchema } from '../bootstrap/type';
import { Cell } from '../domain/entities/Cell';
import { Row } from '../domain/entities/Row';
import { CollectionScope } from '../domain/entities/Table';
import { RowStateEnum } from '../domain/value-objects';
import { UIRow } from '../ui/type';
import {
  applySort,
  findSortedInsertIndex,
  type SortAccessor,
  type SortModel,
} from './dataOps/sortModel';
import {
  applyFilter,
  type FilterAccessor,
  type FilterModel,
} from './dataOps/filterModel';
import {
  applyQuickFilter,
  QuickFilterIndex,
} from './dataOps/quickFilter';
import { applyColumnGroupCollapse } from './dataOps/columnGroups';
import { isServerLoadingRow, isServerRowModel } from './dataOps/rowModel';
import {
  applyAgg,
  ColumnAggIndex,
  resolveColumnAggSpecs,
} from './dataOps/aggregation';
import {
  buildGroupedFlatIndex,
  isGroupExpanded,
  isGroupRowId,
  resolveActiveGroupField,
  type FlatGroupNode,
  type FlatUiNode,
} from './dataOps/rowGrouping';
import type { AggFunc, AggFuncName } from '../domain/types/ColumnDef';
import { EngineErrorHandler } from './EngineErrorHandler';
import { SparseRowIndex } from './SparseRowIndex';
import { TableStore } from './tableStore';
import {
  MOBILE_PAGE_SIZE,
  MobileTableViewState,
  TableSnapShot,
  TableState,
  TableViewState,
  TCell,
} from './type';

function uiRowShallowEqual(a: UIRow, b: UIRow): boolean {
  if (
    a.id !== b.id ||
    a.rowState !== b.rowState ||
    a.isExpanded !== b.isExpanded ||
    a.visibilityCondition !== b.visibilityCondition ||
    a.loading !== b.loading ||
    a.rowKind !== b.rowKind ||
    a.groupField !== b.groupField ||
    a.groupKey !== b.groupKey ||
    a.groupChildCount !== b.groupChildCount ||
    a.groupExpanded !== b.groupExpanded
  ) {
    return false;
  }
  if (a.changeFields.length !== b.changeFields.length) return false;
  for (let i = 0; i < a.changeFields.length; i += 1) {
    if (a.changeFields[i] !== b.changeFields[i]) return false;
  }
  const aKeys = Object.keys(a.cells);
  const bKeys = Object.keys(b.cells);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    const ca = a.cells[key];
    const cb = b.cells[key];
    if (
      !cb ||
      ca.value !== cb.value ||
      ca.display !== cb.display ||
      ca.originalValue !== cb.originalValue
    ) {
      return false;
    }
  }
  return true;
}

export class ViewStateBuilder {
  private readonly uiRowIndex = new SparseRowIndex<number>();
  private uiRowIndexDirty = true;
  private readonly uiRowCache = new Map<number, UIRow>();
  private cachedColumns: ColumnSchema[] | undefined;
  private columnsFingerprint: string | undefined;
  private readonly quickFilterIndex = new QuickFilterIndex();
  private quickFilterIndexDirty = true;
  private readonly columnAggs = new ColumnAggIndex();
  /** Flat group/leaf nodes for the current UI index (PR-120). */
  private flatUiNodes: FlatUiNode[] = [];
  private groupNodesById = new Map<number, FlatGroupNode>();

  constructor(
    private readonly readStore: () => TableStore<TableState> | undefined,
    private readonly err: EngineErrorHandler,
  ) { }

  invalidateUiRowIndex(): void {
    this.uiRowIndexDirty = true;
    this.columnAggs.invalidate();
  }

  /** Full rebuild of searchable blobs (row add/delete/collection change). */
  invalidateQuickFilterIndex(): void {
    this.quickFilterIndexDirty = true;
    this.uiRowIndexDirty = true;
    this.columnAggs.invalidate();
  }

  forgetUiRows(ids: readonly number[]): void {
    for (const id of ids) this.uiRowCache.delete(id);
  }

  private columnsFor(
    table: { getActiveCollectionColumns: () => ColumnSchema[] },
    collapsedColumnGroups: Record<string, true>,
  ): ColumnSchema[] {
    const cols = table.getActiveCollectionColumns();
    const fingerprint = cols
      .map(
        (c) =>
          `${c.fieldName}:${c.hidden ? 1 : 0}:${c.order ?? ''}:${c.columnDef?.pinned ?? ''}`,
      )
      .join('|') + `|cg:${Object.keys(collapsedColumnGroups).sort().join(',')}`;
    if (this.cachedColumns && this.columnsFingerprint === fingerprint) {
      return this.cachedColumns;
    }
    this.columnsFingerprint = fingerprint;
    this.cachedColumns = applyColumnGroupCollapse(cols, collapsedColumnGroups);
    return this.cachedColumns;
  }

  getUiRowIndex(): SparseRowIndex<number> {
    this.ensureUiRowIndex();
    return this.uiRowIndex;
  }

  /**
   * O(log n) insert into an already-built UI index (PR-99).
   * Falls back to full invalidate when filters reject the row or index is dirty.
   */
  insertUiRow(rowId: number): boolean {
    if (this.uiRowIndexDirty) {
      this.ensureUiRowIndex();
      return this.uiRowIndex.indexOf(rowId) >= 0;
    }
    const storeRef = this.readStore();
    if (!storeRef) return false;
    const { table, sortModel, quickFilterText, filterModel, rowModelType } =
      storeRef.getState();
    if (isServerRowModel(rowModelType)) {
      this.invalidateUiRowIndex();
      return false;
    }
    const row = table.getRow(rowId);
    if (!row || row.rowState.value === RowStateEnum.Deleted) return false;
    if (this.uiRowIndex.indexOf(rowId) >= 0) return true;

    const activeName = table.getActiveCollectionName();
    if (row.collection !== activeName) return false;

    const columns = table.getActiveCollectionColumns();
    const byId = new Map([[rowId, row] as const]);
    // Accessor needs existing rows for compare — load active collection.
    for (const r of table.getRows()) {
      if (r.collection === activeName) byId.set(r.id.value, r);
    }
    this.ensureQuickFilterIndex(byId, columns);
    const sortAccessor = this.createSortAccessor(byId, columns);
    const filterAccessor = this.createFilterAccessor(byId, sortAccessor);
    if (applyFilter([rowId], filterModel, filterAccessor).length === 0) {
      return false;
    }
    if (
      applyQuickFilter([rowId], quickFilterText, this.quickFilterIndex)
        .length === 0
    ) {
      return false;
    }

    const pos = findSortedInsertIndex(
      this.uiRowIndex.getOrderedIds(),
      rowId,
      sortModel ?? [],
      sortAccessor,
    );
    this.uiRowIndex.insertAt(pos, rowId, rowId);
    this.columnAggs.invalidate();
    return true;
  }

  /** O(n-pos) remove from UI index without full sort (PR-99). */
  removeUiRow(rowId: number): void {
    this.quickFilterIndex.removeRow(rowId);
    this.uiRowCache.delete(rowId);
    if (this.uiRowIndexDirty) {
      this.columnAggs.invalidate();
      return;
    }
    this.uiRowIndex.remove(rowId);
    this.columnAggs.invalidate();
  }

  /**
   * Column search using ordered UI ids + QuickFilterIndex candidates (PR-99).
   * Verifies the target column text so QF false-positives are dropped.
   */
  findColumnSearchMatches(
    columnId: string,
    query: string,
  ): Array<{ rowId: number; columnId: string }> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const storeRef = this.readStore();
    if (!storeRef) return [];
    const { table } = storeRef.getState();
    const ordered = this.getUiRowIndex().getOrderedIds();
    const activeName = table.getActiveCollectionName();
    const columns = table.getActiveCollectionColumns();
    const byId = new Map(
      table
        .getRows()
        .filter((r) => r.collection === activeName)
        .map((r) => [r.id.value, r] as const),
    );
    this.ensureQuickFilterIndex(byId, columns);
    const candidates = this.quickFilterIndex.filter(ordered, query);
    const matches: Array<{ rowId: number; columnId: string }> = [];
    for (const rowId of candidates) {
      if (isGroupRowId(rowId)) continue;
      const row = byId.get(rowId);
      if (!row || row.rowState.value === RowStateEnum.Deleted) continue;
      const value = row.readValue(columnId);
      const display = row.readDisplay(columnId);
      if (value === undefined && display === undefined && !row.peekCell(columnId)) {
        continue;
      }
      const text =
        display != null && display !== ''
          ? String(display)
          : String(value ?? '');
      if (text.toLowerCase().includes(q)) {
        matches.push({ rowId, columnId });
      }
    }
    return matches;
  }

  getColumnTotals(): Record<string, number> {
    this.ensureColumnAggs();
    return this.columnAggs.toNumberRecord();
  }

  /** All configured column aggregates (PR-119). */
  getColumnAggs(): Record<string, unknown> {
    this.ensureColumnAggs();
    return this.columnAggs.toRecord();
  }

  /**
   * Aggregate for one column with an optional override (footerRows).
   * Uses the incremental index when the override matches the column spec.
   */
  getColumnAggValue(
    columnId: string,
    overrideAgg?: AggFuncName | AggFunc,
  ): unknown {
    this.ensureColumnAggs();
    const storeRef = this.readStore();
    if (!storeRef) return null;
    const { table } = storeRef.getState();
    const columns = table.getActiveCollectionColumns();
    const specs = resolveColumnAggSpecs(columns);
    const primary = specs.find((s) => s.colId === columnId);
    if (
      overrideAgg == null ||
      (primary && primary.aggFunc === overrideAgg)
    ) {
      return this.columnAggs.get(columnId);
    }
    const values = this.collectActiveColumnValues(columnId);
    return applyAgg(overrideAgg, values);
  }

  /** Patch one aggregate after a cell edit (PR-99 / PR-118). */
  patchColumnTotal(
    columnId: string,
    oldValue: unknown,
    newValue: unknown,
  ): void {
    const storeRef = this.readStore();
    if (!storeRef) return;
    const col = storeRef
      .getState()
      .table.getActiveCollectionColumns()
      .find((c) => c.fieldName === columnId);
    if (!col) return;
    const specs = resolveColumnAggSpecs(
      storeRef.getState().table.getActiveCollectionColumns(),
    );
    if (!specs.some((s) => s.colId === columnId)) return;
    if (this.columnAggs.isDirty) {
      this.ensureColumnAggs();
      return;
    }
    const ok = this.columnAggs.patch(columnId, oldValue, newValue);
    if (!ok) this.ensureColumnAggs();
  }

  private collectActiveColumnValues(columnId: string): unknown[] {
    const storeRef = this.readStore();
    if (!storeRef) return [];
    const { table } = storeRef.getState();
    const activeName = table.getActiveCollectionName();
    const out: unknown[] = [];
    for (const row of table.getRows()) {
      if (row.collection !== activeName) continue;
      if (row.rowState.value === RowStateEnum.Deleted) continue;
      out.push(row.readValue(columnId));
    }
    return out;
  }

  private ensureColumnAggs(): void {
    if (!this.columnAggs.isDirty) return;
    const storeRef = this.readStore();
    if (!storeRef) {
      this.columnAggs.clear();
      this.columnAggs.rebuild([], () => []);
      return;
    }
    const { table } = storeRef.getState();
    const columns = table.getActiveCollectionColumns();
    const specs = resolveColumnAggSpecs(columns);
    const activeName = table.getActiveCollectionName();
    const rows = table
      .getRows()
      .filter(
        (r) =>
          r.collection === activeName &&
          r.rowState.value !== RowStateEnum.Deleted,
      );
    this.columnAggs.rebuild(specs, (columnId) =>
      rows.map((row) => row.readValue(columnId)),
    );
  }

  getUiRowCount(): number {
    return this.getUiRowIndex().size;
  }

  projectVisibleUiRows(range: { startIndex: number; endIndex: number }): UIRow[] {
    const ids = this.getUiRowIndex().projectVisible(range);
    const out: UIRow[] = [];
    for (const id of ids) {
      const row = this.getRowView(id);
      if (row) out.push(row);
    }
    return out;
  }

  private ensureUiRowIndex(): void {
    if (!this.uiRowIndexDirty) return;
    this.uiRowIndex.clear();
    this.flatUiNodes = [];
    this.groupNodesById.clear();
    const storeRef = this.readStore();
    if (!storeRef) {
      this.uiRowIndexDirty = false;
      return;
    }
    const {
      table,
      sortModel,
      quickFilterText,
      filterModel,
      rowModelType,
      rowGroupColumns,
      groupDefaultExpanded,
      rowGroupExpanded,
    } = storeRef.getState();
    const activeName = table.getActiveCollectionName();
    const rows = table
      .getRows()
      .filter((row) => row.collection === activeName);
    const byId = new Map(rows.map((row) => [row.id.value, row] as const));
    const columns = table.getActiveCollectionColumns();
    const server = isServerRowModel(rowModelType);

    let orderedIds: number[];
    if (server) {
      // Host already applied sort/filter — keep table insertion order (PR-96).
      orderedIds = [...byId.keys()];
    } else {
      this.ensureQuickFilterIndex(byId, columns);
      const sortAccessor = this.createSortAccessor(byId, columns);
      const afterColumnFilter = applyFilter(
        [...byId.keys()],
        filterModel,
        this.createFilterAccessor(byId, sortAccessor),
      );
      const filteredIds = applyQuickFilter(
        afterColumnFilter,
        quickFilterText,
        this.quickFilterIndex,
      );
      orderedIds = applySort(filteredIds, sortModel ?? [], sortAccessor);

      const groupField = resolveActiveGroupField(rowGroupColumns ?? []);
      if (groupField) {
        const aggSpecs = resolveColumnAggSpecs(columns);
        const grouped = buildGroupedFlatIndex({
          orderedLeafIds: orderedIds,
          groupField,
          getGroupValue: (rowId) => byId.get(rowId)?.readValue(groupField),
          defaultExpanded: groupDefaultExpanded !== false,
          expandedByKey: rowGroupExpanded ?? {},
          aggregateColumns: aggSpecs,
          getCellValue: (rowId, colId) => byId.get(rowId)?.readValue(colId),
        });
        this.flatUiNodes = grouped.nodes;
        for (const node of grouped.nodes) {
          if (node.kind === 'group') {
            this.groupNodesById.set(node.id, node);
          }
        }
        orderedIds = grouped.orderedIds;
      }
    }
    this.uiRowIndex.replaceAll(orderedIds, (id) => id);
    this.uiRowIndexDirty = false;
  }

  private ensureQuickFilterIndex(
    byId: Map<number, Row>,
    columns: ColumnSchema[],
  ): void {
    if (this.quickFilterIndexDirty) {
      this.quickFilterIndex.rebuild([...byId.keys()], {
        getParts: (rowId) => {
          const row = byId.get(rowId);
          return row ? this.quickFilterParts(row, columns) : [];
        },
      });
      this.quickFilterIndexDirty = false;
      return;
    }
    for (const id of [...this.quickFilterIndex.rowIds()]) {
      if (!byId.has(id)) this.quickFilterIndex.removeRow(id);
    }
    for (const id of byId.keys()) {
      if (!this.quickFilterIndex.has(id)) {
        const row = byId.get(id);
        if (row) {
          this.quickFilterIndex.setRow(id, this.quickFilterParts(row, columns));
        }
      }
    }
  }

  private quickFilterParts(row: Row, columns: ColumnSchema[]): unknown[] {
    const parts: unknown[] = [];
    for (const col of columns) {
      if (col.fieldName === 'index' || col.fieldType === 'index') continue;
      // PR-101: read host data without allocating Cell objects.
      const value = row.readValue(col.fieldName);
      if (value === undefined && !row.peekCell(col.fieldName)) continue;
      parts.push(value);
      const display = row.readDisplay(col.fieldName);
      if (display != null && display !== '' && display !== value) {
        parts.push(display);
      }
    }
    return parts;
  }

  /** Patch one row after a cell edit (incremental; no full O(n) rebuild). */
  patchQuickFilterRow(rowId: number): void {
    const storeRef = this.readStore();
    if (!storeRef) return;
    const { table } = storeRef.getState();
    const row = table.getRow(rowId);
    if (!row) {
      this.quickFilterIndex.removeRow(rowId);
      return;
    }
    this.quickFilterIndex.setRow(
      rowId,
      this.quickFilterParts(row, table.getActiveCollectionColumns()),
    );
  }

  removeQuickFilterRows(ids: readonly number[]): void {
    for (const id of ids) this.quickFilterIndex.removeRow(id);
  }

  private createSortAccessor(
    byId: Map<number, Row>,
    columns: ColumnSchema[],
  ): SortAccessor {
    const colByName = new Map(columns.map((col) => [col.fieldName, col]));
    return {
      getValue: (rowId, colId) => byId.get(rowId)?.readValue(colId),
      getFieldType: (colId) => colByName.get(colId)?.fieldType,
      getComparator: (colId) => colByName.get(colId)?.columnDef?.comparator,
    };
  }

  private createFilterAccessor(
    _byId: Map<number, Row>,
    sortAccessor: SortAccessor,
  ): FilterAccessor {
    return {
      getValue: sortAccessor.getValue,
    };
  }

  private getSortModel(): SortModel {
    return this.readStore()?.getState().sortModel ?? [];
  }

  private getQuickFilterText(): string {
    return this.readStore()?.getState().quickFilterText ?? '';
  }

  private getFilterModel(): FilterModel {
    return this.readStore()?.getState().filterModel ?? {};
  }

  private getStore() {
    const store = this.readStore();

    if (!store) {
      this.err.notFound('TableStore', 'active', 'ViewStateBuilder');
    }
    return store;
  }

  private mapRowCells(
    row: Row,
    columns: ColumnSchema[],
  ): Record<string, TCell> {
    const cells: Record<string, TCell> = {};

    for (const col of columns) {
      try {
        const cell = row.getCell(col.fieldName);

        cells[col.fieldName] = {
          value: cell?.getValue() ?? null,
          originalValue: cell?.getOriginalValue()?.value ?? null,
          display: cell?.getDisplay() ?? null,
        };
      } catch (error) {
        this.err.handle(error, 'ViewStateBuilder.mapRowCells');
      }
    }

    return cells;
  }

  private sortRows(rows: Row[]): Row[] {
    if (rows.length === 0) return [];
    const server = isServerRowModel(this.readStore()?.getState().rowModelType);
    if (server) {
      return rows.slice();
    }
    const qf = this.getQuickFilterText().trim();
    const fm = this.getFilterModel();
    const hasFilter = Boolean(qf) || Object.keys(fm).length > 0;
    if (rows.length === 1 && !hasFilter) {
      return rows.slice();
    }
    const byId = new Map(rows.map((row) => [row.id.value, row] as const));
    const columns =
      this.readStore()?.getState().table.getActiveCollectionColumns() ?? [];
    this.ensureQuickFilterIndex(byId, columns);
    const sortAccessor = this.createSortAccessor(byId, columns);
    const afterColumnFilter = applyFilter(
      [...byId.keys()],
      fm,
      this.createFilterAccessor(byId, sortAccessor),
    );
    const filteredIds = applyQuickFilter(
      afterColumnFilter,
      this.getQuickFilterText(),
      this.quickFilterIndex,
    );
    const orderedIds = applySort(
      filteredIds,
      this.getSortModel(),
      sortAccessor,
    );
    const out: Row[] = [];
    for (const id of orderedIds) {
      const row = byId.get(id);
      if (row) out.push(row);
    }
    return out;
  }

  private mapRowToUIRow(
    row: Row,
    columns: ColumnSchema[],
    expandedRows: Record<string, boolean>,
  ): UIRow {
    const next: UIRow = {
      id: row.id.value,
      rowState: row.rowState.value,
      changeFields: row.getChangeFields(),
      cells: this.mapRowCells(row, columns),
      isExpanded: !!expandedRows[row.id.value],
      visibilityCondition: row.visibilityCondition,
      loading: isServerLoadingRow(row.getData()) || undefined,
    };
    const prev = this.uiRowCache.get(row.id.value);
    if (prev && uiRowShallowEqual(prev, next)) {
      return prev;
    }
    this.uiRowCache.set(row.id.value, next);
    return next;
  }

  private mapRowsToUIRows(
    rows: Row[],
    columns: ColumnSchema[],
    expandedRows: Record<string, boolean>,
  ): UIRow[] {
    return this.sortRows(rows).map((row) =>
      this.mapRowToUIRow(row, columns, expandedRows),
    );
  }

  private getRenderableMobileRows(
    rows: Row[],
    mobileEditor: TableState['mobileEditor'],
  ): Row[] {
    return this.sortRows(
      rows
        .filter((row) => row.rowState.value !== RowStateEnum.Deleted)
        .filter(
          (row) =>
            !(
              mobileEditor?.mode === 'add' &&
              row.id.value === mobileEditor.rowId
            ),
        ),
    );
  }

  getViewState(): TableViewState | undefined {
    try {
      const storeRef = this.getStore();

      if (!storeRef) return undefined;

      const store = storeRef.getState();

      const { table, expandedRows, activeCell, selectedRows, gridSearch, mobileEditor, columnWidths, sortModel, quickFilterText, filterModel, rowModelType, serverRowCount, cellRangeSelection, collapsedColumnGroups, rowGroupColumns, groupDefaultExpanded, cellEdit } = store;

      const pagination = table.getPagination();

      const activeName = table.getActiveCollectionName();
      const sortedActive = this.sortRows(
        table.getRows().filter((row) => row.collection === activeName),
      );
      const server = isServerRowModel(rowModelType);
      const totalRows = server
        ? (serverRowCount ?? sortedActive.length)
        : this.getUiRowCount();

      const totalPages = Math.max(
        1,
        Math.ceil(totalRows / pagination.pageSize),
      );

      const collapsed = collapsedColumnGroups ?? {};
      const columns = this.columnsFor(table, collapsed);
      // Server/infinite: table already holds the current page payload (PR-96).
      // Client: page from the flat UI index (sort/filter/group — PR-93/120).
      let pageRows: UIRow[];
      if (server) {
        pageRows = sortedActive.map((row) =>
          this.mapRowToUIRow(row, columns, expandedRows),
        );
      } else {
        const start = (pagination.page - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        const ids = this.getUiRowIndex().getOrderedIds().slice(start, end);
        pageRows = [];
        for (const id of ids) {
          const view = this.getRowView(id);
          if (view) pageRows.push(view);
        }
      }

      return {
        activeCell: activeCell ?? null,
        selectedRows,
        rows: pageRows,
        deletedRows: [],
        columns,
        activeCollectionColumn: columns,
        pagination: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalRows,
          totalPages,
          canPrev: pagination.page > 1,
          canNext: pagination.page < totalPages,
        },
        action: table.getTableAction(),
        gridSearch,
        mobileEditor,
        columnWidths: columnWidths ?? {},
        sortModel: sortModel ?? [],
        quickFilterText: quickFilterText ?? '',
        filterModel: filterModel ?? {},
        cellRanges: cellRangeSelection?.ranges ?? [],
        collapsedColumnGroups: collapsed,
        rowGroupColumns: rowGroupColumns ?? [],
        groupDefaultExpanded: groupDefaultExpanded !== false,
        cellEdit: cellEdit ?? null,
      };
    } catch (error) {
      this.err.handle(error, 'ViewStateBuilder.getViewState');
      return undefined;
    }
  }

  /**
   * All active-collection UI rows (no pagination slice) for virtual scroll.
   */
  getAllUIRows(): UIRow[] | null {
    try {
      const storeRef = this.getStore();
      if (!storeRef) return null;
      const ids = this.getUiRowIndex().getOrderedIds();
      const out: UIRow[] = [];
      for (const id of ids) {
        const view = this.getRowView(id);
        if (view) out.push(view);
      }
      return out;
    } catch (error) {
      this.err.handle(error, 'ViewStateBuilder.getAllUIRows');
      return null;
    }
  }

  // ViewBuilder
  getAllRows(collectionScope: CollectionScope = 'active'): Row[] | null {
    const storeRef = this.getStore();
    if (!storeRef) return null;
    const { table } = storeRef.getState();
    return this.sortRows(table.getRows(collectionScope));
  }

  getMobileViewState(): MobileTableViewState | undefined {
    try {
      const storeRef = this.getStore();
      if (!storeRef) return undefined;

      const { table, expandedRows, mobileEditor, collapsedColumnGroups } = storeRef.getState();
      const pagination = table.getPagination();
      const columns = this.columnsFor(table, collapsedColumnGroups ?? {});
      const allRows = this.getRenderableMobileRows(table.getRows('active'), mobileEditor);
      const pageSize = Math.max(MOBILE_PAGE_SIZE, pagination.pageSize);
      const visibleRows = allRows.slice(0, pageSize);
      const totalRows = allRows.length;
      const visibleCount = Math.min(pageSize, totalRows);

      return {
        rows: this.mapRowsToUIRows(visibleRows, columns, expandedRows),
        columns,
        totalRows,
        visibleCount,
        hasMore: visibleCount < totalRows,
        pageSize,
        mobileEditor,
      };
    } catch (error) {
      this.err.handle(error, 'ViewStateBuilder.getMobileViewState');
      return undefined;
    }
  }

  getRowView(rowId: number): UIRow | null {
    const storeRef = this.getStore();
    if (!storeRef) return null;

    const {
      table,
      expandedRows,
      collapsedColumnGroups,
      groupDefaultExpanded,
      rowGroupExpanded,
    } = storeRef.getState();
    const columns = this.columnsFor(table, collapsedColumnGroups ?? {});

    if (isGroupRowId(rowId)) {
      this.ensureUiRowIndex();
      const node = this.groupNodesById.get(rowId);
      if (!node) return null;
      const expanded = isGroupExpanded(
        node.key,
        groupDefaultExpanded !== false,
        rowGroupExpanded,
      );
      return this.mapGroupToUIRow(node, columns, expanded);
    }

    const row = table.getRow(rowId);

    if (!row) return null;

    return this.mapRowToUIRow(row, columns, expandedRows);
  }

  /** Flat group/leaf presentation nodes (PR-120). */
  getFlatUiNodes(): readonly FlatUiNode[] {
    this.ensureUiRowIndex();
    return this.flatUiNodes;
  }

  getGroupNode(rowId: number): FlatGroupNode | undefined {
    this.ensureUiRowIndex();
    return this.groupNodesById.get(rowId);
  }

  private mapGroupToUIRow(
    node: FlatGroupNode,
    columns: ColumnSchema[],
    expanded: boolean,
  ): UIRow {
    const cells: Record<string, TCell> = {};
    for (const col of columns) {
      if (col.fieldName === node.field) {
        cells[col.fieldName] = {
          value: node.key,
          originalValue: node.key,
          display: node.key,
        };
      } else if (
        Object.prototype.hasOwnProperty.call(node.aggregates, col.fieldName)
      ) {
        const v = node.aggregates[col.fieldName];
        cells[col.fieldName] = {
          value: v,
          originalValue: v,
          display: v,
        };
      } else {
        cells[col.fieldName] = {
          value: null,
          originalValue: null,
          display: null,
        };
      }
    }
    const next: UIRow = {
      id: node.id,
      rowState: RowStateEnum.Unchanged,
      changeFields: [],
      cells,
      isExpanded: expanded,
      visibilityCondition: {},
      rowKind: 'group',
      groupField: node.field,
      groupKey: node.key,
      groupChildCount: node.childRowIds.length,
      groupExpanded: expanded,
    };
    const prev = this.uiRowCache.get(node.id);
    if (prev && uiRowShallowEqual(prev, next)) {
      return prev;
    }
    this.uiRowCache.set(node.id, next);
    return next;
  }

  getSnapShot(collectionScope?: CollectionScope): TableSnapShot | null {
    const storeRef = this.getStore();
    if (!storeRef) return null;

    const { table } = storeRef.getState();
    const hasMeaningfulValue = (value: unknown) =>
      value !== undefined && value !== null && value !== '';

    return {
      rows: table
        .getRows(collectionScope)
        .filter(row =>
          Array.from(row.getCells().entries()).some(
            ([key, cell]) => key !== 'index' && hasMeaningfulValue(cell.getValue()),
          ),
        )
        .map(row => ({
          id: row.id.value,
          changeFields: row.getSnapshotChangeFields(),
          cells: Object.fromEntries(
            [...row.getCells()].map(([k, c]) => [k, c.getValue()]),
          ),
          rowState: row.rowState.value,
          collection: row.getCollection(),
          rowType: row.getCollection(),
          isSaveDescription: row.isSaveDescription,
        })),
    };
  }

  getExpandedRowData(
    rowId: number,
  ): Record<string, unknown> | null {
    const storeRef = this.getStore();
    if (!storeRef) return null;

    const { table } = storeRef.getState();
    const row = table.getRows().find(r => r.id.value === rowId);
    if (!row) return null;

    const rowValues: Record<string, unknown> = {};
    for (const [colId, cell] of row.getCells().entries()) {
      rowValues[colId] = cell.getValue();
    }
    return rowValues;
  }

  getActiveCell(): TableState['activeCell'] | null {
    const store = this.getStore()?.getState();
    if (!store) return null;
    return store.activeCell;
  }
  getActiveRow(): number | null {

    try {

      const store = this.getStore()?.getState();

      if (!store) return null;

      return store.activeRowId ?? null;

    } catch (error) {

      this.err.handle(error, 'ViewStateBuilder.getActiveRow');

      return null;
    }
  }

  getSelectedRows(): Record<number, boolean> | undefined {
    const store = this.getStore()?.getState();
    if (!store) return undefined;
    return store.selectedRows;
  }

  getCell(rowId: number, columnId: string): Cell | undefined {
    const store = this.getStore()?.getState();
    if (!store) return undefined;
    return store.table.getRow(rowId)?.getCell(columnId);
  }
  isActiveCell(rowId: number, columnId: string): boolean {

    try {
      const store = this.getStore();
      if (!store) return false;
      const { activeCell } = store.getState();
      return (
        !!activeCell &&
        activeCell.rowId === rowId &&
        activeCell.columnId === columnId
      );
    } catch (error) {
      this.err.handle(error, 'ViewStateBuilder.isActiveCell');
      return false;
    }
  }


  isSelectedRow(rowId: number): boolean {

    try {

      const store = this.getStore();

      if (!store) return false;

      const { selectedRows } = store.getState();

      return !!selectedRows && !!selectedRows[rowId];

    } catch (error) {

      this.err.handle(error, 'ViewStateBuilder.isSelectedRow');

      return false;
    }
  }


  isCutRow(rowId: number): boolean {
    try {
      const store = this.getStore();
      if (!store) return false;
      const { selectedRows, table } = store.getState();
      return selectedRows[rowId] && table.getTableAction() === 'cut';
    } catch (error) {
      this.err.handle(error, 'ViewStateBuilder.isCutRow');
      return false;
    }
  }


  isActiveRow(rowId: number): boolean {

    try {

      const store = this.getStore();

      if (!store) return false;

      const { activeRowId } = store.getState();

      return !!activeRowId && activeRowId === rowId;

    } catch (error) {

      this.err.handle(error, 'ViewStateBuilder.isActiveRow');

      return false;
    }
  }

}