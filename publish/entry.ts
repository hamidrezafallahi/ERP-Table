/**
 * Package entry for `@fallahi/erp-table`.
 * Host-coupled React surfaces (ERPTable / CellRenderer / useERPTable) stay in
 * the monorepo `index.ts` and are not part of the published bundle.
 */
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
