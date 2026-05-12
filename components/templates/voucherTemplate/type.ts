import {
  Dispatch,
  SetStateAction,
} from 'react';

import { FormInstance } from 'antd';

export interface IProps {
  form:FormInstance<any>;
  setIsFormSubmitting:(boolean)=>void
  caption: string;
  captionII?: string;
  listUrl: string;
  headerFieldKey: string;
  detailFieldKey: string;
  headerGetUrl: string;
  detailGetUrl: string;
  addUrl: string;
  updateUrl: string;
  tableTitle: string;
  titleKey: string;
  pageIcon?: string;
  conditionalActions?: {
    conditionalProperty: string;
    conditionallyAction?: string;
  }[];
  isModal?: boolean;
  parentPageId?: string;
  mutationSystemId?: number;
  conditionalFields?: any[] | boolean;
  setConditionalFields?: Dispatch<SetStateAction<any[]>>;
  extraFunction?: (x: any) => void;
  withImage?: boolean;
}

export interface IRequestMeta {
  requestKey?: string;
  ignoreOnSubmit?: boolean;
}
