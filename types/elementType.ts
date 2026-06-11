import {
  FC,
  ReactNode,
} from 'react';

import { FormInstance } from 'antd';
import { NamePath } from 'antd/es/form/interface';
import { HtmlProps } from 'next/dist/shared/lib/html-context.shared-runtime';

import { IDetailColumnConfig } from '@components/organisms/erp-table';
import { IMultiSelectConfig } from '@components/organisms/erp-table/ui/type';
import { MasterToolbar } from '@components/organisms/formToolbar/type';
import type { IBaseRequest } from '@services/base/type';
import { IInitialPage } from '@slice/init/type';

export interface IPageConfig {
  addEndpoint: string;
  updateEndpoint: string;
  deleteEndpoint: string;
  formIdField: number;
  fields: IFormFieldConfig[];
  repoViewId?: number;
  data?: string;
}

export interface IRequestConfig {
  addWebUrl?: string;
  addAppUrl?: string;
  form?: FormInstance;
  endpoint?: string;
  LocationTypeId?: number;
  FatherId?: number;
  repoViewId?: number;
  repoId?: number;
  RefId?: number;
  GoodId?: number;
  Id?: number;
  AccountId?: number;
  TafsiliTypeId?: number;
  InvoiceHeaderId?: number;
  VoucherTypeId?: number;
  BankAccountId?: number;
  FullSearchPhrase?: string;
  Options?: {
    caption: string;
    value: any;
  }[];
  addButton?: IInitialPage;
  Level?: number;
  OrderInfo?: IBaseRequest<null>["OrderInfo"];
  Filters?: IBaseRequest<null>["Filters"];
  type?: number;
  IsAnonymous?: boolean;
  dependOn?: {
    fieldName: string;
    value: any;
  };
  Types?: string[] | number[];
  Type?: number;
  PrommisoryType?: number;
  level?: number;
}

export interface ISelectOption {
  _SelectId: number;
  _SelectValue: string;
  _SelectDisplay: string;
}

export interface IRepoEntityData {
  RepoId: number;
  EntityId: number;
  RepoName: string;
  Title: string;
  System: number;
}
export interface ITreeSelectOption {
  _SelectId: number;
  _SelectValue: string;
  _SelectDisplay: string;
  _SubItems?: ITreeSelectOption[];
}

export interface IOption {
  label: string;
  value: number;
  title?: string;
}

export interface IFormField {
  fieldName: string;
  label: string;
  type: string;
  fieldType: string;
  valueOption: IRequestConfig;
}
export interface IRadioValue {
  caption: string;
  value: any;
}

type rulesType = "required" | "minLength" | "maxLength" | "nationalCode";
export type IRule = { rule: rulesType; condition: any; message: string };

export interface IFormFieldConfig {
  name?: string;
  caption?: string;
  help?: string;
  type?: string;
  rules?: IRule[];
  selectEndpoint?: IRequestConfig;
  placeHolder?: string;
  order?: number;
  value?: any;
  originalValue?: any;
  isTitleField?: boolean;
  radioValues?: IRadioValue[];
  colSpan?: number;
  setFieldValue?: (name: NamePath, value: any) => void;
  routing?: boolean;
  form?: FormInstance;
  langId?: string | number;
  minLength?: number;
  maxLength?: number;
  mode?: "text" | "number";
  props?: HtmlProps;
}

export interface IMenuItem {
  key: string;
  label: ReactNode;
  className: string;
  children?: IMenuItem[] | null;
}



export interface IMasterProps {

}

export interface GridContainedPageProps extends MasterToolbar {
  form: FormInstance<any>;
  caption: string;
  captionII?: string;
  listUrl: string;
  headerFieldKey: string;
  detailFieldKey: string;
  headerGetUrl: string;
  detailGetUrl: string;
  addUrl: string;
  updateUrl: string;
  tableTitle: string;
  pageIcon: string;
  DefaultDetailRepoViewId: number
  DefaultHeaderRepoViewId: number
  formHeight: number
  storeName: string
  Component: FC<any>;
  saveAsDraft?: boolean
  type?: string//CheckDocumentOperationType








  formConfig: IFormFieldConfig[]
  tableType?: string
  columnConfig: IDetailColumnConfig[]
  multiSelectConfig?: IMultiSelectConfig
  actor?: { userId: string, roles: string[] }
  recordHeight?: number
  mobileRecordsPerPage?: number
}
