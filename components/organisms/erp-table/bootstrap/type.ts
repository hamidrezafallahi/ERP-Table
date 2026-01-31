import { AuditLogger } from '../application/ports/AuditLogger';
import { TableRepository } from '../application/ports/TableRepository';
import {
  Actor,
  PermissionPolicy,
} from '../domain/policies';
import { TableEngine } from '../engine/tableEngine';
import {
  ItemType,
  TCell,
} from '../engine/type';

export interface DynamicValueConfig {
    endpoint: string;
    dependsOn?: string;
    buildParams?: (row: Record<string, unknown>) => Record<string, string | number>;
}

export type FieldType = 'index' | 'text' | 'number' | 'select' | 'selectOption' | 'date'|'static' ;

export type RowInput = { id: number; values?: Record<string, unknown> };

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
    mapFlags?: (response: any) => Record<string, boolean>;
}
export interface IDetailColumnConfig {
    fieldName: string;
    fieldCaption: string;
    fieldType: FieldType;
    order?: number;
    required?: boolean;
    editable?: boolean;
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
        compute: (row: Record<string, unknown>) => unknown;
        id?: number;
        name?: string;
        age?: number;
        children?: [] | undefined;
    };
    selectOptions?:{label:string,value:string}[]
    indexOptions?:(tableId:string,rowId:number,row:{id: string|number;cells: Record<string, TCell>;isExpanded: boolean},engine:TableEngine) =>ItemType[]
    displayFormat?: (value: unknown) => unknown;

}


export type CreateERPTableConfig = {
    tableId: string;
    actor: Actor;
    columns: IDetailColumnConfig[];
    rows?: Array<{ id: number; values?: Record<string, unknown> }>;
    repo?: TableRepository;
    audit?: AuditLogger;
    permissionPolicy?: PermissionPolicy;
};