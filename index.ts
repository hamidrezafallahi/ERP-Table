// index.tsx – نقطه خروجی کامپوننت

export { DataGrid, ERPTable } from './ui';
export { CellRenderer, resolveCustomCellNode, resolveBoundCellNode, resolveRegisteredCellNode } from './ui/cellRenderer';
export type { CellRenderContext, CellComponent, CellComponentMap } from './ui/cellRenderer';
export { DEFAULT_CELL_COMPONENTS, mergeCellComponents, TextAreaCell } from './ui/cellRenderer';
export type {
  FilterComponent,
  FilterComponentContext,
  FilterComponentMap,
} from './ui/filters';
export { resolveFilterComponent } from './ui/filters';
export {
  highlightIfCurrentSearch,
  highlightSearchText,
} from './ui/gridSearch/highlightText';
export { shouldSkipGridNavigation } from './ui/keyboard/skipGridNavigation';
export {
  GridTheme,
  themeDefault,
  themeDark,
  themeErp,
  themeErpDark,
} from './ui/theme';
export type { ThemeCssVars, ThemeParams } from './ui/theme';
export { useERPTableTheme } from './ui/host';
export { useGrid, useERPTable } from './ui/useERPTable';
export type { UseGridResult, UseERPTableResult } from './ui/useERPTable';
export type { UITableController } from './infrastructure/ui/UITableController';
export { createGridApi } from './infrastructure/ui/createGridApi';
export type {
  CreateGridApiInput,
  ExportDataAsExcelOptions,
  GridApi,
  GridColumnState,
  GridRowNode,
  StartEditingCellParams,
} from './infrastructure/ui/createGridApi';
export { bindGridHostEvents } from './ui/host/bindGridHostEvents';
export type { UIRow, IMultiSelectConfig } from './ui/type';
export type { DataGridProps, ERPTableProps } from './ui';
export type { GridReadyEvent } from './ui';
export type { ItemType, TableSnapShot } from './engine/type';
export { RowStateEnum } from './domain/value-objects';
export { NoopRemoteApi } from './infrastructure/Repositories/noopRemoteApi';
export type {
  GridDatasource,
  GridDatasourceGetRowsParams,
  GridDatasourceGetRowsResult,
  RowModelType,
} from './application/ports/GridDatasource';
export {
  isServerRowModel,
  pageWindow,
} from './application/ports/GridDatasource';
export { TableEngine } from './engine/tableEngine';
export { VirtualList, useVirtualWindow, buildVirtualWindow } from './ui/virtual';
export type { VirtualListProps, UseVirtualWindowResult, VirtualWindowModel } from './ui/virtual';

export { createGrid, createERPTable } from './bootstrap';
export {
  DEFAULT_GRID_ACTOR,
  DEFAULT_MEMORY_STORE,
  createGridTableKey,
  resolveCreateGridDefaults,
} from './bootstrap';
export type {
  CollectionRowMap,
  ColumnSchema,
  CreateERPTableConfig,
  CreateERPTableResult,
  CreateGridConfig,
  CreateGridResult,
  FieldType,
  GetRowId,
  RowInput,
} from './bootstrap/type';
export type {
  ColumnDef,
  ColumnDefBridge,
  ColumnField,
  ColumnPinned,
  FilterDef,
} from './domain/types/ColumnDef';
export type {
  ColumnGroupDef,
  ColDefOrGroup,
  ColumnGroupMeta,
  ColumnGroupPathEntry,
} from './domain/types/ColumnGroupDef';
export { isColumnGroupDef } from './domain/types/ColumnGroupDef';
export type {
  ColumnDefinition,
  ColumnViewBinding,
} from './domain/types/ColumnDefinition';
export type { GridSession } from './application/session/GridSession';
export type { ViewIntent } from './application/session/ViewIntent';
export { mapColumnSchemas, toColumnDefinition, toColumnViewBinding } from './infrastructure/columns/mapColumnSchema';
export {
  columnDefFieldName,
  mapColumnDefs,
  mapColDefOrGroups,
  mapColumnSchemasToDefs,
  toColumnDef,
  toColumnSchema,
} from './infrastructure/columns/mapColumnDef';
export {
  applyHostRowDataToTable,
  defaultGetRowId,
  ensureIndexColumnDef,
  mapRowDataToRowInputs,
} from './infrastructure/rows/mapRowData';
export { InMemoryEventStore } from './infrastructure/eventStore/InMemoryEventStore';
export { IndexedDbEventStore } from './infrastructure/eventStore/IndexedDbEventStore';
export {
  DEFAULT_EVENT_STORE_PREFIX,
  LEGACY_EVENT_STORE_PREFIX,
  eventStoreDbName,
} from './infrastructure/eventStore/eventStoreName';
export { MemoryKvDatabase, openIndexedDbDatabase } from './infrastructure/eventStore/KvDatabase';
export type { KvDatabase, KvStore } from './infrastructure/eventStore/KvDatabase';
export { SnapshotStrategy } from './infrastructure/snapshot/SnapshotStrategy';
export { InMemorySnapshotStore } from './infrastructure/snapshot/InMemorySnapshotStore';
export type { AggregateSnapshot, SnapshotStore } from './application/ports/SnapshotStore';
export {
  EVENT_CATALOG,
  getEventCatalogEntry,
  listUndoableEventTypes,
} from './application/events/eventCatalog';
export type { EventCatalogEntry } from './application/events/eventCatalog';
export {
  CATALOG_TO_HOST_CALLBACKS,
  ROW_DATA_UPDATED_CATALOG_TYPES,
  dispatchCatalogHostEvent,
  subscribeCatalogHostEvents,
} from './application/events/hostGridEvents';
export type {
  CellFocusedEvent,
  CellValueChangedEvent,
  RowDataUpdatedEvent,
  RowValueChangedEvent,
  SelectionChangedEvent,
} from './application/events/hostGridEvents';
export {
  runBenchmark,
  checkBudget,
  DEFAULT_PERFORMANCE_BUDGETS,
} from './infrastructure/perf/benchmark';
export type {
  BenchmarkSample,
  PerformanceBudget,
  BenchmarkResult,
} from './infrastructure/perf/benchmark';
export { Viewport } from './domain/value-objects/Viewport';
export type { VisibleRange } from './domain/value-objects/Viewport';
export { ViewportCalculator } from './engine/ViewportCalculator';
export type { ColumnVisibleRange } from './engine/ColumnViewport';
export {
  calculateColumnViewport,
  buildCumulativeWidths,
} from './engine/ColumnViewport';
export { SparseRowIndex } from './engine/SparseRowIndex';
export {
  applySort,
  ariaSortForColumn,
  cycleSortModel,
  HEADER_SORT_CLICK_MAX_MOVE_PX,
  INDEX_COL_ID,
  isHeaderColumnSortable,
  compareSortValues,
  compareTypedValues,
  isBlankSortValue,
  normalizeDigits,
  shouldCommitHeaderSortClick,
  sortPriorityForColumn,
} from './engine/dataOps/sortModel';
export type {
  AriaSortValue,
  CycleSortModelOptions,
  SortAccessor,
  SortDirection,
  SortModel,
  SortModelItem,
  SortValueComparator,
} from './engine/dataOps/sortModel';
export {
  applyFilter,
  collectUniqueFilterValues,
  isColumnFilterActive,
  normalizeFilterText,
  resolveBuiltinFilterKind,
} from './engine/dataOps/filterModel';
export type {
  BooleanColumnFilter,
  BooleanFilterOp,
  BuiltinFilterKind,
  ColumnFilter,
  CombinedColumnFilter,
  CustomColumnFilter,
  CustomFilterFn,
  DateColumnFilter,
  DateFilterOp,
  FilterAccessor,
  FilterJoin,
  FilterModel,
  NumberColumnFilter,
  NumberFilterOp,
  SetColumnFilter,
  SetFilterOp,
  SimpleColumnFilter,
  TextColumnFilter,
  TextFilterOp,
} from './engine/dataOps/filterModel';
export {
  applyQuickFilter,
  buildQuickFilterBlob,
  normalizeQuickFilterText,
  QuickFilterIndex,
} from './engine/dataOps/quickFilter';
export type { QuickFilterBlobAccessor } from './engine/dataOps/quickFilter';
export type {
  GridPlugin,
  GridPluginContext,
  GridQueryPort,
  ExportSource,
} from './application/plugins/GridPlugin';
export { PluginHost } from './application/plugins/PluginHost';
export type {
  RequestExportOptions,
  RequestImportOptions,
} from './application/plugins/PluginHost';
export { createEngineGridQuery } from './application/plugins/createEngineGridQuery';
export type { PdfRenderer } from './application/ports/PdfRenderer';
export {
  ExcelExportPlugin,
  ExcelImportPlugin,
  exportActiveCollectionToExcel,
  buildExportTable,
  buildXlsxBlob,
  parseXlsxBlob,
  mapImportedSheet,
  applyImportedRows,
} from './packages/plugins/excel/src';
export {
  PdfExportPlugin,
  TextPdfRenderer,
  VazirmatnPdfRenderer,
} from './packages/plugins/pdf/src';
