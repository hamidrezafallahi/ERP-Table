import { IRequestConfig } from '@type/elementType';

import { FieldType } from '../bootstrap/type';
import { RowStateEnum } from '../domain/value-objects';
import { TCell } from '../engine/type';

export interface IRow {

    id: number;
    cells: Record<string, TCell>;
    rowState: RowStateEnum;
    isExpanded: boolean;
    changeFields: readonly string[];
    moreDetails: unknown
    visibilityCondition: Record<string, boolean>;

}
export interface IMultiSelectConfig {
    dynamicValue: IRequestConfig & { dependsOn?: string[] };
    fieldKey: string
    detailFieldKey: string
    onAdd: (e: any) => void

    ListConfig: {
        fieldName: string,
        fieldCaption: string,
        fieldType: FieldType
        returnValue?: (row: Record<string, unknown>[], colId: string) => unknown
        returnDisplayValue?: (row: Record<string, unknown>[], colId: string) => unknown
    }[];
}