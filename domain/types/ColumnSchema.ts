import type { RemoteApi } from '../../application/ports/RemoteApi';
import type {
  Actor,
} from '../policies';
import type { Row } from '../entities/Row';
import type { Table } from '../entities/Table';
import type { IRule } from '../value-objects';

export interface DynamicValueConfig {
  endpoint: string;
  dependsOn?: string;
  buildParams?: (row: Record<string, unknown>) => Record<string, string | number>;
}

export type FieldType =
  | 'index'
  | 'text'
  | 'number'
  | 'price'
  | 'select'
  | 'selectOption'
  | 'date'
  | 'static'
  | 'description'
  | 'checkbox';

export type ColumnVisibilityRule =
  | { kind: 'always' }
  | { kind: 'never' }
  | { kind: 'showUnitLevelConditionally'; fieldName: string }
  | { kind: 'whenFieldTruthy'; fieldName: string }
  | { kind: 'whenRemoteFlag'; sourceFieldName: string; flag: string }
  | { kind: 'whenCollection'; collection: string }
  | { kind: 'whenTableType'; tableType: string };

export interface ResolveOnConfig<K = unknown, TResponse = unknown> {
  endpoint: string;
  fieldName: string;
  buildParams: (row: Record<string, unknown>) => Record<string, unknown>;
  getResponse?: (response: TResponse, row: Row) => unknown;
  mapFlags?: (response: TResponse) => Record<string, boolean>;
}

type ColumnAccessControl = {
  allowRoles?: string[];
  denyRoles?: string[];
  rule?: (ctx: { actor: Actor; row: Row; table: Table }) => boolean;
};

export interface IDependOn {
  fieldName: string;
  value: any;
}

export type DefaultOptionType = {
  value?: string | number;
  label?: any;
  title?: string;
  [key: string]: unknown;
};

export interface ColumnSchema<T = unknown, K = unknown> {
  fieldName: string;
  fieldCaption: string;
  fieldType: FieldType;
  fieldCollection?: string;
  order?: number;
  rules?: IRule[];
  options?: DefaultOptionType[];
  editable?: boolean;
  isUnique?: boolean;
  noCache?: boolean;
  expandable?: boolean;
  returnValue?: (values: T, colId: string) => unknown;
  returnDisplayValue?: (values: T, colId: string) => unknown;
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
  hidden?: boolean;
  className?: string;
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
  selectOptions?: { label: string; value: string | number }[];
  indexOptions?: (...args: any[]) => any[];
  onChange?: (...args: any[]) => void;
  displayFormat?: (value: unknown) => unknown;
  minWidth?: number;
  style?: any;
  popUpWidth?: number;
  dynamicSelectFilterOption?: (inputValue: string, option: any) => boolean;
  labelValue?: 'selectDisplay' | 'selectValue';
}
