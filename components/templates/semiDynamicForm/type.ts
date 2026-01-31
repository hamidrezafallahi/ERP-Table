import type { IDetailColumnConfig } from "@services/generalType/type";

export interface IProps {
  listUrl: string;
  caption: string;
  getUrl: string;
  getDetailUrl: string;
  detailsRepoViewId: number;
  repoViewId: number;
  titleKey: string;
  componentName: string;
  info: any;
  toolbarData: any;
  formData: any;
  columnsConfig: IDetailColumnConfig[];
  detailKey: string;
  detailCaption: string;
  id: string | null;
  fieldKey: string;
}
