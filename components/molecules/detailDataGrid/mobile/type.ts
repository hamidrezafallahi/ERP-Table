import { ActionDispatch, ChangeEvent, Dispatch, SetStateAction } from "react";

import { CheckboxChangeEvent } from "antd/es/checkbox";

import type { IDetailColumnConfig } from "@services/generalType/type";

import type { IActions, IAdditionalAction } from "../type";

export interface IProps<T> {
  detailInitialData: T[];
  columnsConfig?: IDetailColumnConfig[];
  fieldKey: string;
  alternateKey?: string;
  detailCaption: string;
  detailKey: string;
  isEdit: boolean;
  contentHeight?: number;
  conditionRenderer?: (
    conditionValue: any,
    fieldName: string,
    initialRenderCondition: Record<string, boolean>
  ) => Record<string, boolean>;
  currentPage?: number;
  additionalActions?: IAdditionalAction<T>[];
  additionalFunction?: (detailData: T[]) => void;
  calcIndependentValue?: (
    rowData: T,
    fieldName: string,
    newValue: any,
    option?: any
  ) => Promise<Partial<T>>;

  setShowForm?: Dispatch<SetStateAction<boolean>>;
  isLoading?: boolean;
  totalCount?: number;
  setPage?: Dispatch<SetStateAction<number>>;
}

export interface IEditRowFormProps<T> {
  recordIndex: number;
  dispatchDetailData: ActionDispatch<[action: IActions<T>]>;
  configs: IDetailColumnConfig[];
  detailData: T[];
  alternateKey?: string;
  handleSave: () => void;
  conditionRenderer?: (
    conditionValue: any,
    fieldName: string,
    initialRenderCondition: Record<string, boolean>
  ) => Record<string, boolean>;
  calcIndependentValue?: (
    rowData: T,
    fieldName: string,
    newValue: any,
    option?: any
  ) => Promise<Partial<T>>;
}

export interface IRenderFieldProps<T> {
  config: IDetailColumnConfig;
  record: T;
  recordIndex: number;
  alternateKey?: string;
  onTreeChange: (
    newValue: any,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean
  ) => void;
  onSelectChange: (
    newValue: unknown,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean,
    option?: unknown
  ) => void;
  onTextChange: (
    e: ChangeEvent<HTMLInputElement>,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean
  ) => void;
  onNumberChange: (
    value: any,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean
  ) => void;
  onPriceChange: (
    value: any,
    field: string,
    isChangeField: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean
  ) => void;
  onApply: (index: number, field: string, value: boolean) => void;
  onDateChange: (
    value: string,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean
  ) => void;
  onBooleanChange: (
    e: CheckboxChangeEvent,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean
  ) => void;
}

export interface IChildHandle {
  mobileHandleAdd: (index: number) => void;
}
