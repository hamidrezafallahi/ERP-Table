import { IRequestConfig } from './hostTypes';

import { FieldType } from '../bootstrap/type';
import { RowStateEnum } from '../domain/value-objects';
import { TCell } from '../engine/type';

export interface UIRow {
  id: number;
  cells: Record<string, TCell>;
  rowState: RowStateEnum;
  isExpanded: boolean;
  changeFields: readonly string[];
  visibilityCondition: Record<string, boolean>;
  /** Infinite/server placeholder row (PR-103 skeleton). */
  loading?: boolean;
  /** Synthetic group row (PR-120). Absent / `'leaf'` = normal data row. */
  rowKind?: 'group' | 'leaf';
  groupField?: string;
  groupKey?: string;
  groupChildCount?: number;
  groupExpanded?: boolean;
}

export type MultiSelectDependOn = {
  fieldName: string;
  value: unknown;
};

export interface IMultiSelectConfig {
  /**
   * Resolve `dynamicValue.dependOn` values through the host's
   * `useDependOn` hook (e.g. header-form fields) instead of the static
   * values carried by the items.
   */
  dependOnFromHost?: boolean;
  dynamicValue: IRequestConfig & {
    dependsOn?: string[];
    dependOn?: MultiSelectDependOn | MultiSelectDependOn[];
  };
  fieldKey: string;
  detailFieldKey: string;
  onAdd: (rows: Record<string, unknown>[]) => void;
  ListConfig: {
    fieldName: string;
    fieldCaption: string;
    fieldType: FieldType;
    hidden?: boolean;
    returnValue?: (row: Record<string, unknown>, colId: string) => unknown;
    returnDisplayValue?: (
      row: Record<string, unknown>,
      colId: string,
    ) => unknown;
  }[];
}
