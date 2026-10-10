/**
 * Headless / non-React composition surface (PR-76).
 * No React chrome, themes, or injectStyles.
 *
 * `createGrid` is the sync composition root (D24 / PR-84).
 * `createERPTable` remains a deprecated async alias (`createGrid(cfg).ready`).
 */
export { createGrid, createERPTable } from '../bootstrap';
export {
  DEFAULT_GRID_ACTOR,
  DEFAULT_MEMORY_STORE,
  createGridTableKey,
  resolveCreateGridDefaults,
} from '../bootstrap';
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
} from '../bootstrap/type';
export type {
  ColumnDef,
  ColumnDefBridge,
  ColumnField,
  ColumnPinned,
  FilterDef,
  AggFunc,
  AggFuncName,
} from '../domain/types/ColumnDef';
export type {
  ColumnDefinition,
  ColumnViewBinding,
} from '../domain/types/ColumnDefinition';
export type { GridSession } from '../application/session/GridSession';
export type { ViewIntent } from '../application/session/ViewIntent';
export {
  mapColumnSchemas,
  toColumnDefinition,
  toColumnViewBinding,
} from '../infrastructure/columns/mapColumnSchema';
export {
  columnDefFieldName,
  mapColumnDefs,
  mapColumnSchemasToDefs,
  toColumnDef,
  toColumnSchema,
} from '../infrastructure/columns/mapColumnDef';
export {
  applyHostRowDataToTable,
  defaultGetRowId,
  ensureIndexColumnDef,
  mapRowDataToRowInputs,
} from '../infrastructure/rows/mapRowData';
export { InMemoryEventStore } from '../infrastructure/eventStore/InMemoryEventStore';
export { IndexedDbEventStore } from '../infrastructure/eventStore/IndexedDbEventStore';
export {
  DEFAULT_EVENT_STORE_PREFIX,
  LEGACY_EVENT_STORE_PREFIX,
  eventStoreDbName,
} from '../infrastructure/eventStore/eventStoreName';
export {
  MemoryKvDatabase,
  openIndexedDbDatabase,
} from '../infrastructure/eventStore/KvDatabase';
export type { KvDatabase, KvStore } from '../infrastructure/eventStore/KvDatabase';
export { SnapshotStrategy } from '../infrastructure/snapshot/SnapshotStrategy';
export { InMemorySnapshotStore } from '../infrastructure/snapshot/InMemorySnapshotStore';
export type {
  AggregateSnapshot,
  SnapshotStore,
} from '../application/ports/SnapshotStore';
export type { EventStore, AppendResult } from '../application/ports/EventStore';
export type { RemoteApi } from '../application/ports/RemoteApi';
export type {
  GridDatasource,
  GridDatasourceGetRowsParams,
  GridDatasourceGetRowsResult,
  RowModelType,
} from '../application/ports/GridDatasource';
export {
  isServerRowModel,
  pageWindow,
} from '../application/ports/GridDatasource';
export { NoopRemoteApi } from '../infrastructure/Repositories/noopRemoteApi';
export {
  EVENT_CATALOG,
  getEventCatalogEntry,
  listUndoableEventTypes,
} from '../application/events/eventCatalog';
export type { EventCatalogEntry } from '../application/events/eventCatalog';
export {
  CATALOG_TO_HOST_CALLBACKS,
  ROW_DATA_UPDATED_CATALOG_TYPES,
  dispatchCatalogHostEvent,
  subscribeCatalogHostEvents,
} from '../application/events/hostGridEvents';
export type {
  CellFocusedEvent,
  CellValueChangedEvent,
  RowDataUpdatedEvent,
  RowValueChangedEvent,
  SelectionChangedEvent,
} from '../application/events/hostGridEvents';
export { Viewport } from '../domain/value-objects/Viewport';
export type { VisibleRange } from '../domain/value-objects/Viewport';
export { ViewportCalculator } from '../engine/ViewportCalculator';
export type { ColumnVisibleRange } from '../engine/ColumnViewport';
export {
  calculateColumnViewport,
  buildCumulativeWidths,
} from '../engine/ColumnViewport';
export { SparseRowIndex } from '../engine/SparseRowIndex';
export {
  applyAgg,
  accumulateAdd,
  accumulateRemove,
  ColumnAggIndex,
  createAccumulator,
  isAggFuncName,
  isCustomAggFunc,
  readAccumulator,
  toMinorUnits,
  resolveColumnAggSpecs,
} from '../engine/dataOps/aggregation';
export type {
  AggAccumulator,
  ColumnAggSpec,
} from '../engine/dataOps/aggregation';
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
} from '../engine/dataOps/sortModel';
export type {
  AriaSortValue,
  CycleSortModelOptions,
  SortAccessor,
  SortDirection,
  SortModel,
  SortModelItem,
  SortValueComparator,
} from '../engine/dataOps/sortModel';
export {
  applyFilter,
  collectUniqueFilterValues,
  isColumnFilterActive,
  normalizeFilterText,
  resolveBuiltinFilterKind,
} from '../engine/dataOps/filterModel';
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
} from '../engine/dataOps/filterModel';
export {
  applyQuickFilter,
  buildQuickFilterBlob,
  normalizeQuickFilterText,
  QuickFilterIndex,
} from '../engine/dataOps/quickFilter';
export type { QuickFilterBlobAccessor } from '../engine/dataOps/quickFilter';
export {
  clickCell,
  clampColIndex,
  clampRowIndex,
  colIndex,
  createEmptyCellRangeSelection,
  ctrlClickCell,
  isCellInRange,
  mergeCellRanges,
  moveCellAddress,
  normalizeCellRange,
  rangeFromAnchorFocus,
  rangesOverlap,
  selectAllCellRanges,
  shiftArrowCell,
  shiftClickCell,
} from '../engine/selection/cellRange';
export type {
  ArrowDirection,
  CellAddress,
  CellRange,
  CellRangeBounds,
  CellRangeSelection,
} from '../engine/selection/cellRange';
export {
  cellRangeClassName,
  cellRangeEdgeAttr,
  resolveCellRangePresentation,
} from '../engine/selection/cellRangePresentation';
export type { CellRangeEdgeFlags } from '../engine/selection/cellRangePresentation';
export {
  buildClipboardPayload,
  resolveCopyRanges,
} from '../engine/selection/clipboardCopy';
export type {
  ClipboardCellSnapshot,
  ClipboardColumnMeta,
  ClipboardCopyBuildOptions,
  ClipboardPayload,
  ClipboardRowSnapshot,
  ProcessCellForClipboardParams,
} from '../engine/selection/clipboardCopy';
export {
  coercePastedCellValue,
  normalizePersianNumberText,
  parseClipboardDate,
  parseClipboardNumber,
} from '../engine/dataOps/cellValueCoercion';
export type { CoercePastedCellResult } from '../engine/dataOps/cellValueCoercion';
export {
  buildPastePlan,
  parseDelimitedClipboardText,
} from '../engine/selection/clipboardPaste';
export {
  addJalaliMonths,
  buildFillUpdates,
  detectFillSeries,
  extendSeriesValue,
  resolveFillCorner,
} from '../engine/selection/fillHandle';
export type { FillCorner, FillSeriesKind, FillTarget } from '../engine/selection/fillHandle';
export { applyFillHandleDrag } from '../infrastructure/ui/gridFillHandle';
export type {
  PasteColumnMeta,
  PastePlan,
  PasteTarget,
  SkippedPasteTarget,
} from '../engine/selection/clipboardPaste';
export {
  copyGridSelectionToClipboard,
  cutGridSelectionToClipboard,
  pasteGridFromClipboard,
  readSystemClipboardText,
  writeSystemClipboard,
} from '../infrastructure/ui/gridClipboard';
export type {
  ClipboardCopyEvent,
  ClipboardPasteEvent,
  GridClipboardRuntimeOptions,
  GridPasteRuntimeOptions,
  PasteGridResult,
} from '../infrastructure/ui/gridClipboard';
export { TableEngine } from '../engine/tableEngine';
export type {
  ItemType,
  TableSnapShot,
  ValidCell,
  TableViewState,
} from '../engine/type';
export { RowStateEnum } from '../domain/value-objects';
export type {
  GridPlugin,
  GridPluginContext,
  GridQueryPort,
  ExportSource,
} from '../application/plugins/GridPlugin';
export { PluginHost } from '../application/plugins/PluginHost';
export type {
  RequestExportOptions,
  RequestImportOptions,
} from '../application/plugins/PluginHost';
export { createEngineGridQuery } from '../application/plugins/createEngineGridQuery';
export { UITableController } from '../infrastructure/ui/UITableController';
export { createGridApi } from '../infrastructure/ui/createGridApi';
export type {
  CreateGridApiInput,
  ExportDataAsExcelOptions,
  GridApi,
  GridColumnState,
  GridRowNode,
  StartEditingCellParams,
} from '../infrastructure/ui/createGridApi';
export { GridSyncService } from '../application/sync';
export { InMemorySyncHub } from '../infrastructure/sync';
export { GridPresenceService } from '../application/presence';
export {
  InMemoryPresenceHub,
  createBroadcastChannelPresenceTransport,
} from '../infrastructure/presence';
export type {
  SyncConflict,
  SyncConflictPolicy,
  SyncConflictSide,
  SyncPort,
  SyncResult,
  SyncTransport,
  ManualResolution,
} from '../application/ports/SyncPort';
export type {
  PresencePeer,
  PresencePort,
  PresenceTransport,
  PresenceMessage,
  PresenceLocalState,
} from '../application/ports/PresencePort';
export type { PdfRenderer } from '../application/ports/PdfRenderer';

export { CallbackRemoteApi } from '../infrastructure/Repositories/callbackRemoteApi';
export type { RemoteApiRequest } from '../infrastructure/Repositories/callbackRemoteApi';

// Document-grid (header + detail) mapping — host I/O stays outside the package.
export {
  buildDocumentPayload,
  mapDetailsToRowInputs,
  mapServerHeaderToFields,
  mapSnapshotToDetails,
} from '../infrastructure/document/documentGridMapping';
export type {
  BuildDocumentPayloadOptions,
  DetailLine,
  DetailsToRowInputsOptions,
  DocumentHeaderField,
  SnapshotToDetailsOptions,
} from '../infrastructure/document/documentGridMapping';

// Page-window repositories (persistence 'paged-idb').
export { PagedCachedTableRepository } from '../infrastructure/Repositories/paged/PagedCachedTableRepository';
export { PagedIndexedDbTableRepository } from '../infrastructure/Repositories/paged/PagedIndexedDbTableRepository';
export { PagedLocalTableRepository } from '../infrastructure/Repositories/paged/PagedLocalTableRepository';
export { isWindowedRepository } from '../application/ports/TableRepository';
export type { WindowedTableRepository, PersistedRowRecord } from '../application/ports/TableRepository';
