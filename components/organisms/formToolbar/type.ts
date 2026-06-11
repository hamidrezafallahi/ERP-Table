import {
  Dispatch,
  SetStateAction,
} from 'react';

import type { FormInstance } from 'antd';

export interface MasterToolbar{
  setMasterForm?: Dispatch<
    SetStateAction<{
      loading: boolean;
      action: "save" | "saveAndNew" | "saveAndClose";
    }>
  >;
  masterForm?: { loading: boolean, action: "save" | "saveAndNew" | "saveAndClose" }
}

export interface IProps extends MasterToolbar {
  toolbarData: any;
  isEdit: boolean;
  id: number;
  fieldKey: string | number;
  listUrl: string;
  listPageId?: string;
  getUrl?: string;
  conditionalActions?: {
    conditionalProperty: string;
    conditionallyAction?: string;
    opposite?: boolean;
  }[];
  form?: FormInstance;
  statusHandler?: (e: boolean) => void;
  selectedView?: number;
  mutationSystemId?: number;
  submitCaption?: string;
  withSubmitButton?: boolean;
  hasShorthandFormToolbar?: boolean;
  saveAsDraft?: boolean;
  
}
