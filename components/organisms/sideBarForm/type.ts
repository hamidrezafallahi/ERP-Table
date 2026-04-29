import {
  QueryActionCreatorResult,
  QueryDefinition,
} from "@reduxjs/toolkit/query";
import { IBaseQueryResponse, IBaseRequest } from "@services/base/type";
import type { IRequestConfig } from "@type/elementType";
import type { IMenu } from "@type/toolbar";
import { useTranslations } from "next-intl";

export interface IProps {
  id: number;
  sourceKey: string | number;
  additionalId?: number;
  additionalFieldKey?: string;
  config: IDynamicModalConfig;
}

export interface IDynamicModalConfig {
  fieldKey: string;
  sourceFieldKey?: string;
  staticKey: string;
  deleteUrl: string;
  confirmUrl?: string;
  createUrl: string;
  updateUrl: string;
  listConfig: IListDynamicModalConfig;
  formConfig: IFormDynamicModalConfig;
  actions: IMenu[];
  idFieldName: string;
  idFieldKeyUpdate?: string;
}

interface ListColumn {
  fieldName: string;
  fieldCaption: string;
  fieldType: "string" | "boolean" | "date" | "price" | "number";
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

export default interface IVoucherTypeItem {
  Desc: string;
  VocherTypeDescId: number;
  VocherTypeDescItemId: number;
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

export type RefetchType = () => QueryActionCreatorResult<
  QueryDefinition<
    {
      url: string;
      body: IBaseRequest<any>;
      id: number | string;
    },
    (args: any, api: any, extraOptions: any) => Promise<any>,
    string,
    IBaseQueryResponse<any>,
    "apiService"
  >
>;

export type RecordType = {
  Desc?: string;
  VocherTypeDescId?: number;
  VocherTypeDescItemId?: number;
};
