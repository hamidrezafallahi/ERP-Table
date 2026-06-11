import { DefaultOptionType } from 'antd/es/select';

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
import {
  ItemType,
  TCell,
} from '../engine/type';
import { UITableController } from '../infrastructure/ui/UITableController';

export interface DynamicValueConfig {
    endpoint: string;
    dependsOn?: string;
    buildParams?: (row: Record<string, unknown>) => Record<string, string | number>;
}

export type FieldType = 'index' | 'text' | 'number' | 'price' | 'select' | 'selectOption' | 'date' | 'static' | 'description' | 'checkbox';

export type RowInput = { id: number; values?: Record<string, unknown>, moreDetails?: unknown, rowType: string };

export type ColumnVisibilityRule =
    | { kind: 'always' }
    | { kind: 'never' }
    | { kind: 'showUnitLevelConditionally'; fieldName: string }
    | { kind: 'whenFieldTruthy'; fieldName: string }
    | { kind: 'whenRemoteFlag'; sourceFieldName: string; flag: string; }
    | { kind: 'whenTableType'; tableType: string };
export interface ResolveOnConfig {
    endpoint: string;
    // flags:  string[];
    fieldName: string;
    buildParams: (row: Record<string, unknown>) => Record<string, unknown>;
    getResponse?: (response: any, row: Row) => unknown;
    mapFlags?: (response: any) => Record<string, boolean>;
}
type ColumnAccessControl = {
    allowRoles?: string[];
    denyRoles?: string[];
    rule?: (ctx: { actor; row; table }) => boolean;
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
export interface IDetailColumnConfig {
    fieldName: string;
    fieldCaption: string;
    fieldType: FieldType;
    order?: number;
    rules?: IRule[];
    editable?: boolean;
    returnValue?: (values: Record<string, unknown>, colId: string) => unknown
    returnDisplayValue?: (values: Record<string, unknown>, colId: string) => unknown
    enableDeleteButton?: boolean;
    enableExpandButton?: boolean;
    enableMoveButton?: boolean;
    enableOptionsButton?: boolean;
    disable?: boolean;
    colAccess?: ColumnAccessControl;
    dynamicSource?: {
        endpoint: string;
        dependsOn?: string[];
        dependOn?: { fieldName: string, value: unknown }
        params?: Record<string, string>;
        [key: string]: unknown;
    };
    hidden?: boolean
    className?: string
    visibility: ColumnVisibilityRule;
    resolveOn?: ResolveOnConfig;
    computed?: {
        dependsOn: readonly string[];
        compute: (
            row: Record<string, unknown>,
            remoteApi: RemoteApi
        ) => Promise<unknown>;
        children?: [] | undefined;
    };
    selectOptions?: { label: string, value: string | number }[]
    indexOptions?: (tableKey: string, rowId: number, row: { id: string | number; cells: Record<string, TCell>; isExpanded: boolean }, engine: UITableController) => ItemType[]
    onChange?: (tableKey: string, rowId: number, row: { id: string | number; cells: Record<string, TCell>; isExpanded: boolean }, engine: UITableController) => void
    displayFormat?: (value: unknown) => unknown;
    minWidth?: number;
    style?: React.CSSProperties;
    popUpWidth?: number
    dynamicSelectFilterOption?: (inputValue: string, option?: DefaultOptionType) => boolean
    labelValue?: 'selectDisplay' | 'selectValue';
}


export type CreateERPTableConfig = {
    store: string;
    tableKey: string;
    tableType?: string;
    actor: Actor;
    rowAccess?: RowAccessControl;
    columns: IDetailColumnConfig[];
    rows?: Array<{ id: number; values?: Record<string, unknown>, moreDetails?: Record<string, unknown>, rowType: string }>;
    repo?: TableRepository;
    audit?: AuditLogger;
    permissionPolicy?: PermissionPolicy;
    tableHeight?: number;
    recordPerPage?: number;
};