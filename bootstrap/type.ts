import { AuditLogger } from '../application/ports/AuditLogger';
import { TableRepository } from '../application/ports/TableRepository';
import type {
  ColumnSchema,
} from '../domain/types/ColumnSchema';
export type {
  ColumnSchema,
  ColumnVisibilityRule,
  DefaultOptionType,
  DynamicValueConfig,
  FieldType,
  IDependOn,
  ResolveOnConfig,
} from '../domain/types/ColumnSchema';
import type { Row } from '../domain/entities/Row';
import type { Table } from '../domain/entities/Table';
import type {
  Actor,
  PermissionPolicy,
} from '../domain/policies';
import type { RemoteApi } from '../application/ports/RemoteApi';
import type { TableEngine } from '../engine/tableEngine';
import type { UITableController } from '../infrastructure/ui/UITableController';
import type { EventStore } from '../application/ports/EventStore';
import type { ChangelogProjection } from '../infrastructure/projections/ChangelogProjection';
import type { HistoryPanelViewModel } from '../infrastructure/history/HistoryPanelViewModel';
import type { CellUndoStack } from '../application/undo/CellUndoStack';
import type { GridSession } from '../application/session/GridSession';
import type { GridPlugin } from '../application/plugins/GridPlugin';
import type { PluginHost } from '../application/plugins/PluginHost';
import type {
  ColumnDefinition,
  ColumnViewBinding,
} from '../domain/types/ColumnDefinition';

export type CollectionRowMap = Record<string, object>;

export type RowInput = {
  id: number;
  values?: Record<string, unknown>;
  collection?: string;
  rowType?: string;
}

export type RowAccessControl = {
  allowRoles?: string[];
  denyRoles?: string[];
  rule?: (ctx: {
    actor: Actor;
    table: Table;
    row?: Row;
  }) => boolean;
};
export type CreateERPTableConfig = {
  store: string;
  tableKey: string;
  activeCollection?: string;
  tableType?: string;
  actor: Actor;
  rowAccess?: RowAccessControl;
  columns: ColumnSchema[];
  rows: RowInput[];
  repo?: TableRepository;
  audit?: AuditLogger;
  permissionPolicy?: PermissionPolicy;
  tableHeight?: number;
  recordPerPage?: number;
  remoteApi?: RemoteApi;
  /** Override default InMemoryEventStore (e.g. IndexedDbEventStore). */
  eventStore?: EventStore;
  /** Optional plugins (Excel/PDF export, …) registered at composition root. */
  plugins?: readonly GridPlugin[];
};

export type CreateERPTableResult = {
  engine: TableEngine;
  controller: UITableController;
  session: GridSession;
  table: Table;
  tableKey: string;
  columnMeta: Map<string, ColumnSchema>;
  columnDefinitions: ColumnDefinition[];
  columnBindings: ColumnViewBinding[];
  eventStore: EventStore;
  changelogProjection: ChangelogProjection;
  historyPanelViewModel: HistoryPanelViewModel;
  cellUndoStack: CellUndoStack;
  pluginHost: PluginHost;
};