import {
  QueryActionCreatorResult,
  QueryDefinition,
} from "@reduxjs/toolkit/query";
import { IBaseQueryResponse, IBaseRequest } from "@services/base/type";
import type { IRequestConfig } from "@type/elementType";
import type { IMenu } from "@type/toolbar";
import { FormInstance } from "antd";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";

export interface IProps {
  id: number;
  sourceKey: string | number;
  additionalId?: number;
  additionalFieldKey?: string;
  config: IDynamicModalConfig;
}

export interface IDynamicModalConfig {
  fieldKey?: string;
  sourceFieldKey?: string;
  staticKey?: string;
  deleteUrl?: string;
  deleteUrlSide?: string;
  confirmUrl?: string;
  createUrlSide?: string;
  updateUrlSide?: string;
  createUrl?: string;
  updateUrl?: string;
  listConfig?: IListDynamicModalConfig;
  formConfig?: IFormDynamicModalConfig;
  actions?: IMenu[];
  idFieldName?: string;
  idFieldKeyUpdate?: string;
  idFieldKeyUpdateSide?: string;
}

export interface ListColumn {
  fieldName: string;
  fieldCaption: string;
  fieldType: "string" | "boolean" | "date" | "price" | "number";
  width?: number;
}

interface IListDynamicModalConfig {
  repoViewId: number;
  RepoId: number;
  body?: any;
  selectUrl: string;
  column: ListColumn[];
  IsDefault: boolean;
  IsDisableAutoRefresh: boolean;
  IsDisableCommentCount: boolean;
  IsDisableSidebarStats: boolean;
  IsDisableCount: boolean;
  selectUrlSide?: string;
  transform?: (item: any) => any;
}

interface IFormDynamicModalConfig {
  fields: FormField[];
}

interface FieldRule {
  required?: boolean;
  message?: string;
  type?: "string" | "boolean" | "number";
  len?: any;
  pattern?: any;
}

interface FormField {
  name: string;
  caption?: string;
  help?: string;
  type:
    | "selectOption"
    | "text"
    | "checkbox"
    | "date"
    | "number"
    | "treeOption"
    | "price";
  showId?: boolean;
  rules?: FieldRule[];
  selectEndpoint?: IRequestConfig;
  placeHolder?: string;
  order?: number;
  defaultValue?: boolean;
}

export default interface IResponseItem {
  Desc: string;
  Inactive: boolean;
  PendingStatusId: number;
}

export type ReloadType = () => QueryActionCreatorResult<
  QueryDefinition<
    {
      url: string;
      body: IBaseRequest<any>;
      id: number | string;
    },
    (args: any, api: any, extra: any) => Promise<any>,
    string,
    IBaseQueryResponse<any>,
    "apiService"
  >
>;

export type TFunction = ReturnType<typeof useTranslations>;



export type RecordType = {
  Desc?: string;
  [key: string]: string | number | boolean | object | undefined;
};

export type CustomFormComponentProps = CustomFormBaseProps;
export interface CustomFormBaseProps {
  typeId: number;
  form: FormInstance<any>;
  config: IDynamicModalConfig;
  editingRecord: RecordType;
  setEditingRecord: Dispatch<SetStateAction<RecordType>>;
  refetchCard: ReloadType;
  refetchTable: ReloadType;
}
