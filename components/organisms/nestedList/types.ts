
import type { IRequestConfig } from "@type/elementType";

export interface IProps<T> {
  config: INestedListConfig;
  titleKey?: string[];
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
    | "group"
    | "radio";
  options?: {
    label: string;
    value: string | number | boolean;
  }[];
  groupItems?: {
    title: string;
    groupFields: INestedListFormConfig[];
  }[];
  rules?: FieldRule[];
  dynamicValue?: IRequestConfig;
  placeHolder?: string;
  order?: number;
  conditionalDynamicValue?: (level: number) => IRequestConfig;
  defaultValue?: boolean | number | null;
  renderConditionally?: (level: number) => boolean;
}

interface FieldRule {
  required?: boolean;
  message?: string;
  type?: "string" | "boolean" | "number";
  len?: any;
  pattern?: any;
}


import { IToolbarMenu } from "@type/toolbar";
import { Dispatch, ReactNode, SetStateAction } from "react";

export interface SelectionState {
  id: number | null;
  selectedId: number | null;
  fatherId: number | null;
  level: number | null;
  title: string | null;
}

export interface UIState {
  searchTerm: string;
  expandedKeys: any[];
  draggedKey: any;
}

export interface ModalsState {
  form: boolean;
  deleteDrawer: boolean;
  deleteModal: boolean;
  attachment: boolean;
  dynamic: boolean;
  credit: boolean;
  [key: string]: boolean;
}

export interface DynamicActionState {
  icon: string;
  label: string;
  actionConfig: IToolbarMenu;
}

export interface SetStates {
  setSelection?: Dispatch<SetStateAction<SelectionState>>;
  setUi?: Dispatch<SetStateAction<UIState>>;
  setModals?: Dispatch<SetStateAction<ModalsState>>;
  setDynamicAction?: Dispatch<SetStateAction<DynamicActionState | undefined>>;
}
export interface States {
  selection?: SelectionState;
  ui?: UIState;
  modals?: ModalsState;
  dynamicAction?: DynamicActionState;
}

export interface LoadingType {
  isLoading?: boolean;
  triggerIsLoading?: boolean;
  [key: string]: boolean;
}

export interface FormModalData {
  id: number | null;
  fatherId?: number | null;
  level?: number;
  title?: string;
  titleKey?: string[];
  repoId?: number;
}
export interface NestedListActions<T> {
  handleAddAction?: (
    id: number,
    fatherId: number,
    type: "addSide" | "addChild" | "firstItem",
  ) => void;
  handleDeleteConfirm?: () => Promise<void>;
  handleDropAction?: (
    dragKey: number | string,
    newFatherId: number | null,
  ) => Promise<void>;
  extractTitle?: (item: any) => string | null;
  handleDeleteAction?: (id: number) => void;
  handleEditAction?: (item: T) => void;
  handleAction?: (action: IToolbarMenu) => Promise<void>;
  toggleModal?: (
    key:
      | "form"
      | "deleteDrawer"
      | "deleteModal"
      | "attachment"
      | "dynamic"
      | "credit",
    value: boolean,
  ) => void;
}
