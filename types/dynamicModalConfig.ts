import { IRequestConfig } from "./elementType";
import { IMenu } from "./toolbar";

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

interface IFormDynamicModalConfig {
  fields: FormField[];
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
  selectUrlSide?: string;
  transform?: (item: any) => any;
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
