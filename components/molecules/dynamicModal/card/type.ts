import type { IRepoViewConfig } from "@services/generalType/type";
import { IToolbarMenu } from "@type/toolbar";

export interface IProps<T> {
  data: T[];
  columnsList: IRepoViewConfig;
  actions: IToolbarMenu[];
  staticKey: string;
  onActionClick: (
    action: IToolbarMenu,
    id: number | null,
    PendingStatusId: number | null
  ) => void;
  fieldKey: string;
  activation?: {
    url: string;
    body?: any;
  };
}
