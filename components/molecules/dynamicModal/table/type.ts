import type { IToolbarMenu } from "@type/toolbar";

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
  scroll?: {
    x?: number;
    y?: number;
  };
  activation?: {
    url: string;
    body?: any;
  };
}
