import { UITableController } from '../adapters/ui/UITableController';
import { AuditLogger } from '../application/ports/AuditLogger';
import { RemoteApi } from '../application/ports/RemoteApi';
import { TableRepository } from '../application/ports/TableRepository';
import { Row } from '../domain/entities/Row';
import { Table } from '../domain/entities/Table';
import {
  Actor,
  PermissionPolicy,
} from '../domain/policies';
import {
  ItemType,
  TCell,
} from '../engine/type';

export interface DynamicValueConfig {
    endpoint: string;
    dependsOn?: string;
    buildParams?: (row: Record<string, unknown>) => Record<string, string | number>;
}

export type FieldType = 'index' | 'text' | 'number' | 'select' | 'selectOption' | 'date' | 'static';

export type RowInput = { id: number; values?: Record<string, unknown>,moreDetails:unknown };

export type ColumnVisibilityRule =
    | { kind: 'always' }
    | { kind: 'showUnitLevelConditionally'; fieldName: string }
    | { kind: 'whenFieldTruthy'; fieldName: string }
    | { kind: 'whenRemoteFlag'; sourceFieldName: string; flag: string; }
    | { kind: 'whenFlag'; sourceFieldName: string; flag: string; };
export interface ResolveOnConfig {
    endpoint: string;
    // flags:  string[];
    fieldName: string;
    buildParams: (row: Record<string, unknown>) => Record<string, string | number>;
    getResponse?: (response: any) => unknown;
    mapFlags?: (response: any) => Record<string, boolean>;
}
type ColumnAccessControl = {
  allowRoles?: string[]; 
  denyRoles?: string[];
rule?: (ctx: { actor; row; table }) => boolean;
};
type RowAccessControl = {
  allowRoles?: string[];
  denyRoles?: string[];
  rule?: (ctx: {
    actor: Actor;
    table: Table;
    row?: Row;
  }) => boolean;
};
export interface IDetailColumnConfig {
    fieldName: string;
    fieldCaption: string;
    fieldType: FieldType;
    order?: number;
    required?: boolean;
    editable?: boolean;
    colAccess?: ColumnAccessControl;
    dynamicSource?: {
        endpoint: string;
        dependsOn?: string[];
        dependOn?: { fieldName: string, value: undefined }
        params?: Record<string, string>;
        [key: string]: unknown;
    };
    hidden?: boolean
    visibility?: ColumnVisibilityRule;
    resolveOn?: ResolveOnConfig;
    computed?: {
        dependsOn: readonly string[];
        compute: (
            row: Record<string, unknown>,
            remoteApi: RemoteApi
        ) => Promise<unknown>;

        id?: number;
        name?: string;
        age?: number;
        children?: [] | undefined;
    };
    selectOptions?: { label: string, value: string }[]
    indexOptions?: (tableKey: string, rowId: number, row: { id: string | number; cells: Record<string, TCell>; isExpanded: boolean }, engine: UITableController) => ItemType[]
    displayFormat?: (value: unknown) => unknown;

}
export type CreateERPTableConfig<TMoreDetail=unknown>  = {
    store: string;
    tableKey: string;
    actor: Actor;
    rowAccess?: RowAccessControl;
    columns: IDetailColumnConfig[];
    rows?: Array<{ id: number; values?: Record<string, unknown>,moreDetails:TMoreDetail  }>;
    repo?: TableRepository;
    audit?: AuditLogger;
    permissionPolicy?: PermissionPolicy;
};