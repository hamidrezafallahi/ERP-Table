import { IColumnConfig } from "@services/generalType/type";
import type { IRequestConfig } from "@type/elementType";
import type { IToolbarMenu } from "@type/toolbar";

export interface IProps {
  id: number;
  sourceKey: string | number;
  additionalId?: number;
  additionalFieldKey?: string;
  config: IDynamicModalConfig;
  pageCount?: number;
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
  actions: IToolbarMenu[];
  activation?: {
    url: string;
    body?: any;
  };
}

interface IListDynamicModalConfig {
  repoViewId: number;
  body?: any;
  selectUrl: string;
  column: IColumnConfig[];
  IsDefault: boolean;
  IsDisableAutoRefresh: boolean;
  IsDisableCommentCount: boolean;
  IsDisableSidebarStats: boolean;
  IsDisableCount: boolean;
}

interface IFormDynamicModalConfig {
  // fields: IFormFieldConfig[];
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
    | "time"
    | "price";
  showId?: boolean;
  rules?: FieldRule[];
  selectEndpoint?: IRequestConfig;
  placeHolder?: string;
  order?: number;
  defaultValue?: boolean;
}
