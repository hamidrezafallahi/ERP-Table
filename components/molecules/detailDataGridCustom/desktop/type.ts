import { HTMLAttributes } from "react";

import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { IDetailColumnConfig } from "@services/generalType/type";

import type { IAdditionalAction } from "../type";

export interface IProps<T> {
  detailInitialData: T[];
  columnsConfig: IDetailColumnConfig[];
  fieldKey: string;
  alternateKey: string;
  dragUrl: string;
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
    value: any,
    option?: any
  ) => Promise<Partial<T>>;
}

export interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}
export interface RowProps extends HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}
