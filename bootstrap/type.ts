import { ReactNode } from 'react';

import { IBaseQueryResponse } from '@services/base/type';

import { AuditLogger } from '../application/ports/AuditLogger';
import { RemoteApi } from '../application/ports/RemoteApi';
import { TableRepository } from '../application/ports/TableRepository';
import { Row } from '../domain/entities/Row';
import { Table } from '../domain/entities/Table';
import {
  Actor,
  PermissionPolicy,
} from '../domain/policies';
import { IRule } from '../domain/value-objects';
import { ItemType } from '../engine/type';
import { FetchRemoteApi } from '../infrastructure/Repositories/fetchRemoteApi';
import { UITableController } from '../infrastructure/ui/UITableController';
import { UIRow } from '../ui/type';

export interface DynamicValueConfig {
  endpoint: string;
  dependsOn?: string;
  buildParams?: (row: Record<string, unknown>) => Record<string, string | number>;
}

export type FieldType = 'index' | 'text' | 'number' | 'price' | 'select' | 'selectOption' | 'date' | 'static' | 'description' | 'checkbox';

export type CollectionRowMap = Record<string, object>;

export type RowInput = {
  id: number;
  values?: Record<string, unknown>;
  collection?: string;
  rowType?: string;
}


export type ColumnVisibilityRule =
  | { kind: 'always' }
  | { kind: 'never' }
  | { kind: 'showUnitLevelConditionally'; fieldName: string }
  | { kind: 'whenFieldTruthy'; fieldName: string }
  | { kind: 'whenRemoteFlag'; sourceFieldName: string; flag: string; }
  | { kind: 'whenCollection'; collection: string }
  | { kind: 'whenTableType'; tableType: string };
export interface ResolveOnConfig<K = unknown> {
  endpoint: string;
  // flags:  string[];
  fieldName: string;
  buildParams: (row: Record<string, unknown>) => Record<string, unknown>;
  getResponse?: (response: IBaseQueryResponse<K>, row: Row) => unknown;
  mapFlags?: (response: IBaseQueryResponse<K>) => Record<string, boolean>;
}
type ColumnAccessControl = {
  allowRoles?: string[];
  denyRoles?: string[];
  rule?: (ctx: { actor: Actor; row: Row; table: Table }) => boolean;
};
export type RowAccessControl = {
  allowRoles?: string[];
  denyRoles?: string[];
  rule?: (ctx: {
    actor: Actor;
    table: Table;
    row?: Row;
  }) => boolean;
};
export interface IDependOn {
  fieldName: string;
  value: any;
}
export interface ColumnSchema<T = unknown, K = unknown> {
  fieldName: string;
  fieldCaption: string;
  fieldType: FieldType;
  fieldCollection?: string
  order?: number;
  rules?: IRule[];
  options?: DefaultOptionType[]
  editable?: boolean;
  isUnique?: boolean;
  noCache?: boolean;
  expandable?: boolean;
  returnValue?: (values: T, colId: string) => unknown
  returnDisplayValue?: (values: T, colId: string) => unknown
  enableDeleteButton?: boolean;
  enableExpandButton?: boolean;
  enableMoveButton?: boolean;
  enableOptionsButton?: boolean;
  disable?: boolean;
  colAccess?: ColumnAccessControl;
  dynamicSource?: {
    endpoint: string;
    dependsOn?: string[];
    dependOn?: IDependOn | IDependOn[];
    params?: Record<string, string>;
    [key: string]: unknown;
  };
  hidden?: boolean
  className?: string
  visibility: ColumnVisibilityRule;
  resolveOn?: ResolveOnConfig<K>;
  computed?: {
    dependsOn: readonly string[];
    compute: (
      row: Record<string, unknown>,
      remoteApi: RemoteApi
    ) => Promise<unknown>;
    children?: [] | undefined;
  };
  selectOptions?: { label: string, value: string | number }[]
  indexOptions?: (tableKey: string, rowId: number, row: UIRow, engine: UITableController) => ItemType[]
  onChange?: (tableKey: string, rowId: number, row: UIRow, engine: UITableController, value: unknown, option?: DefaultOptionType) => void
  displayFormat?: (value: unknown) => unknown;
  minWidth?: number;
  style?: React.CSSProperties;
  popUpWidth?: number
  dynamicSelectFilterOption?: (inputValue: string, option: DefaultOptionType) => boolean
  labelValue?: 'selectDisplay' | 'selectValue';
}
export type DefaultOptionType = {
  value?: string | number;
  label?: ReactNode;
  title?: string;
  [key: string]: unknown;
}
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