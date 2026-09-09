/**
 * Package entry for `@fallahi/erp-table`.
 * Includes the React ERPTable chrome so ERP can `npm i` and render
 * the same table without host atoms / Tailwind scan.
 */
import '../ui/styles/injectStyles';

export { ERPTable } from '../ui';
export type { ERPTableProps } from '../ui';
export { CellRenderer } from '../ui/cellRenderer';
export { useERPTable } from '../ui/useERPTable';
export type { UseERPTableResult } from '../ui/useERPTable';
export type { UIRow, IMultiSelectConfig } from '../ui/type';
export { UITableController } from '../infrastructure/ui/UITableController';

export { createERPTable } from '../bootstrap';
export type {
  CollectionRowMap,
  ColumnSchema,
  CreateERPTableConfig,
  CreateERPTableResult,
  FieldType,
  RowInput,
} from '../bootstrap/type';
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
export { InMemoryEventStore } from '../infrastructure/eventStore/InMemoryEventStore';
export { IndexedDbEventStore } from '../infrastructure/eventStore/IndexedDbEventStore';
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
export { NoopRemoteApi } from '../infrastructure/Repositories/noopRemoteApi';
export { FetchRemoteApi } from '../infrastructure/Repositories/fetchRemoteApi';
export {
  EVENT_CATALOG,
  getEventCatalogEntry,
  listUndoableEventTypes,
} from '../application/events/eventCatalog';
export type { EventCatalogEntry } from '../application/events/eventCatalog';
export {
  runBenchmark,
  checkBudget,
  DEFAULT_PERFORMANCE_BUDGETS,
} from '../infrastructure/perf/benchmark';
export type {
  BenchmarkSample,
  PerformanceBudget,
  BenchmarkResult,
} from '../infrastructure/perf/benchmark';
export { Viewport } from '../domain/value-objects/Viewport';
export type { VisibleRange } from '../domain/value-objects/Viewport';
export { ViewportCalculator } from '../engine/ViewportCalculator';
export { SparseRowIndex } from '../engine/SparseRowIndex';
export { TableEngine } from '../engine/tableEngine';
export type {
  ItemType,
  TableSnapShot,
  ValidCell,
  TableViewState,
} from '../engine/type';
export { RowStateEnum } from '../domain/value-objects';
export {
  VirtualList,
  useVirtualWindow,
  buildVirtualWindow,
} from '../ui/virtual';
export type {
  VirtualListProps,
  UseVirtualWindowResult,
  VirtualWindowModel,
} from '../ui/virtual';
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
export type { PdfRenderer } from '../application/ports/PdfRenderer';
export {
  ExcelExportPlugin,
  ExcelImportPlugin,
  exportActiveCollectionToExcel,
  buildExportTable,
  buildXlsxBlob,
  parseXlsxBlob,
  mapImportedSheet,
  applyImportedRows,
} from '../packages/plugins/excel/src';
export {
  PdfExportPlugin,
  TextPdfRenderer,
} from '../packages/plugins/pdf/src';
export { ERPTableHostProvider } from '../ui/host';
export type { ERPTableHostValue, ERPTableLocale, ERPTableMessages } from '../ui/host';
