import type { FormInstance } from "antd";

export interface IProps {
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
  fromIndexedDb?: boolean;
  loadingFromOutsideComponents?: boolean;
  saveAsDraft?: boolean;
  hasReload?: boolean;
  handleRefreshData?: () => void;
}
