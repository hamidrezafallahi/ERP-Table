import type { IToolbarMenu } from "@type/toolbar";
import { TableProps } from "antd";

export interface IProps<T> {
  data: any;
  locale: string;
  fieldKey: string;
  columnsList: any;
  actions: any;
  handleAction: (
    action: IToolbarMenu,
    item: number,
    PendingStatusId: number | null,
    record: T,
  ) => void;
  isLoading: boolean;
  scroll?: TableProps<T>["scroll"];
  activation?: {
    url: string;
    body?: any;
  };
}
