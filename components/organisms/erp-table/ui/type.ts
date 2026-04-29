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