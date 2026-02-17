import { IRequestConfig } from "@type/elementType";

export interface IComment {
  CommentId: number;
  CommentDesc: string;
  CreateDate: string;
  RepoId: number;
  ReferId: number;
  CreateUserId: number;
  User: {
    FullName: string;
  };
  ReplyCount: number;
  UsedCount: number;
}

export interface IRepoViewConfig {
  column?: IColumnConfig[];
  IsDefault?: boolean;
  IsDisableAutoRefresh?: boolean;
  IsDisableCommentCount?: boolean;
  IsDisableCount?: boolean;
  IsDisableSidebarStats?: boolean;
}

export interface IDetail {
  RowNum: number;
  RowState?: RowStateEnum;
  key: number;
  addedPage?: number;
  Inactive?: boolean;
}

export enum RowStateEnum {
  Add = "Add",
  Update = "Update",
  Delete = "Delete",
  None = "None",
}
export enum BadgeTypeEnum {
  "Secondary" = 0,
  "Success" = 1,
  "Error" = 2,
}

export interface IColumnConfig {
  fieldName: string;
  fieldCaption: string;
  fieldType:
    | "date"
    | "price"
    | "conditional"
    | "badge"
    | "string"
    | "number"
    | "boolean"
    | string;
  conditionalConfig?: {
    title: string;
    value: number;
    badgeType?: BadgeTypeEnum;
  }[];
  badgeType?: BadgeTypeEnum;
  renderFunction?: (record: any) => any;
  order?: number;
}
export interface IDetailColumnConfig {
  sticky?: "leftCustom" | "rightCustom";
  render?: (row: any, index?: number) => React.ReactNode;
  fieldName: string;
  fieldCaption: string;
  fieldIcon?: string;
  mobileRender?: boolean;
  isChangeField?: string;
  isApplyField?: string;
  applyTooltip?: string;
  conditionKey?: string;
  limitation?: {
    max: number;
  };
  order?: number;
  fieldType:
    | "text"
    | "number"
    | "treeOption"
    | "selectOption"
    | "index"
    | "date"
    | "price"
    | "changeablePrice"
    | "unChangeablePrice"
    | "boolean"
    | "static";
  dynamicValue?: IRequestConfig;
  staticConfig?: StaticConfig;
  calcIndependent?: boolean;
  independentValue?: boolean;
  width?: number;
  showIdInDesc?: boolean;
}

interface IFunctionConfig {
  mode: "function";
  valueType: "price" | "number" | "date";
  config: (rowData: any) => any;
  className?: string;
}

interface IStaticOptionConfig {
  mode: "staticOption";
  className?: string;
  valueType: "staticOption";
  config: {
    title: string;
    value: number;
  }[];
}

type StaticConfig = IFunctionConfig | IStaticOptionConfig;
