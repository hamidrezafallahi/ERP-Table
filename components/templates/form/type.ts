import { Dispatch, FC, ReactNode, SetStateAction } from "react";

import { CheckboxOptionType } from "antd";

export interface FieldType {
  type?: boolean;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  personCode?: string;
  fatherName?: string;
  identifyNumber?: string;
  shCode?: string;
  birthday?: string;
  tooltip?: ReactNode;
}

export interface FieldData {
  name: string | number | (string | number)[];
  value?: any;
  touched?: boolean;
  validating?: boolean;
  errors?: string[];
}

export interface CustomizedPageProps {
  config: {
    pageId: string;
    pageIndex: number;
  };
  onChange: (fields: FieldData[]) => void;
  fields: FieldData[];
}
export interface IRadioOptions extends CheckboxOptionType {
  default: boolean;
  name: string;
}

export interface IProps {
  caption: string;
  url: string;
  listUrl: string;
  fieldKey: string;
  titleKey?: string[] | string;
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
  Component?: any;
  hasReload?: boolean;
}
export interface IMasterProps {
  fieldKey: string;
  caption: string;
  captionII: string;
  addUrl: string;
  updateUrl: string;
  listUrl: string;
  pageIcon: string;
  tableTitle: string;
  titleKey: string;
  detailFieldKey: string;
  headerFieldKey: string;
  headerGetUrl: string;
  detailGetUrl: string;
  Component: FC<any>;
}
