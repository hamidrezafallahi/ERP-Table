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
import type { FetchRemoteApi } from '../infrastructure/Repositories/fetchRemoteApi';
import type { TableEngine } from '../engine/tableEngine';
import type { UITableController } from '../infrastructure/ui/UITableController';
import type { EventStore } from '../application/ports/EventStore';
import type { ChangelogProjection } from '../infrastructure/projections/ChangelogProjection';
import type { HistoryPanelViewModel } from '../infrastructure/history/HistoryPanelViewModel';

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
  remoteApi?: FetchRemoteApi
};

export type CreateERPTableResult = {
  engine: TableEngine;
  controller: UITableController;
  table: Table;
  tableKey: string;
  columnMeta: Map<string, ColumnSchema>;
  eventStore: EventStore;
  changelogProjection: ChangelogProjection;
  historyPanelViewModel: HistoryPanelViewModel;
};