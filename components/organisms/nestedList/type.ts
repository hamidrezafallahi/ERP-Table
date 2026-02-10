import { ReactNode } from "react";

import type { IRequestConfig } from "@type/elementType";

export interface IProps<T> {
  config: INestedListConfig;
  titleKey?:string[];
  addChildCondition?: (item: T) => boolean;
  caption: string;
  customAction?: (item: T) => ReactNode | null;
  withoutActivation?: boolean;
  conditionalActivation?: (item: T) => boolean;
}

export interface INestedListConfig {
  getUrl: string;
  createUrl: string;
  updateUrl: string;
  deleteUrl: string;
  repoViewId: number;
  pageIcon?: string;
  uniqueKey: string;
  displayKey?: string;
  fatherKey: string;
  descriptionKey: string;
  nestedKey: string;
  levelKey: string;
  tooltips?: {
    level1: string;
    level2: string;
    level3: string;
  };
  showUploadAction?: boolean;
  formConfig: INestedListFormConfig[];
  formType?: "placeDefinition" | "config";
  staticCondition?: (id, fatherId) => boolean;
  staticValues?: unknown;
}

export interface INestedListFormConfig {
  name?: string;
  caption?: string;
  help?: string;
  type:
    | "selectOption"
    | "text"
    | "checkbox"
    | "date"
    | "number"
    | "treeOption"
    | "price"
    | "group";
  groupItems?: {
    title: string;
    groupFields: INestedListFormConfig[];
  }[];
  rules?: FieldRule[];
  dynamicValue?: IRequestConfig;
  placeHolder?: string;
  order?: number;
  conditionalDynamicValue?: (level: number) => IRequestConfig;
  defaultValue?: boolean;
  renderConditionally?: (level: number) => boolean;
}

interface FieldRule {
  required?: boolean;
  message?: string;
  type?: "string" | "boolean" | "number";
  len?: any;
  pattern?: any;
}
