import type { IToolbarMenu } from "@type/toolbar";

export interface IProps {
  data: any;
  locale: string;
  fieldKey: string;
  columnsList: any;
  actions: any;
  handleAction: (
    action: IToolbarMenu,
    item: number,
    PendingStatusId: number | null
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
