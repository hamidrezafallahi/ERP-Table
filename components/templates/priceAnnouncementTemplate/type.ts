import {
  Dispatch,
  SetStateAction,
} from 'react';

export interface IProps {
  caption: string;
  url: string;
  listUrl: string;
  fieldKey: string;
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


export type TableSnapshot = {
    rows: Array<{
      rowState?: any;
      changeFields?: any;
      cells: Record<string, any>;
    }>;
  };
