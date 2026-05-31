import { Dispatch, FC, SetStateAction } from "react";

export interface IProps {
  detailFieldKey?: string;
  headerFieldKey?: string;
  tableTitle?: string;
  addUrl?: string;
  updateUrl?: string;
  headerGetUrl?: string;
  caption: string;
  fieldKey: string;
  titleKey: string | string[];
  listUrl: string;
  url: string;
  detailGetUrl?: string;
  pageIcon?: string;
  conditionalActions?: {
    conditionalProperty: string;
    conditionallyAction?: string;
    opposite?: boolean;
  }[];
  isModal?: boolean;
  parentPageId?: string;
  mutationSystemId?: number;
  conditionalFields?: any[] | boolean;
  setConditionalFields?: Dispatch<SetStateAction<any[]>>;
  extraFunction?: (x: any) => void;
  withImage?: boolean;
  submitCaption?: string;
  withSubmitButton?: boolean;
  hasShorthandFormToolbar?: boolean;
  Component?: FC<any> | undefined;
  fromIndexedDb?: boolean;
  saveAsDraft?: boolean;
  hasReload?: boolean;
}
export interface IResponse<T = unknown> {
  Data: T;
}
export interface IRequest {
  config: string;
}