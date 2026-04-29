import type {
  IColumnConfig,
  IRepoViewConfig,
} from "@services/generalType/type";
import { TTheme } from "@slice/config/type";
import { IMenu, IToolbarMenu } from "@type/toolbar";
import { Ref } from "react";

export interface IProps<T> {
  data: T[];
  columnsList: IRepoViewConfig;
  actions: IToolbarMenu[] | IMenu[];
  staticKey: string;
  onActionClick: (
    action: IToolbarMenu,
    id: number | null,
    PendingStatusId: number | null,
  ) => void;
  fieldKey: string;
  activation?: {
    url: string;
    body?: any;
  };
  variant?: "collapse" | "simple";
  customMobileClassName?: string;
}

export interface CardSimpleProps<
  T extends { Inactive: boolean; PendingStatusId: number },
> {
  item: T;
  index: number;
  processedDataLength: number;
  staticKey: string;
  columnsConfig: IColumnConfig[];
  actions: IToolbarMenu[];
  fieldKey: string;
  activation: {
    url: string;
    body?: any;
  };
  mode: TTheme;
  onActionClick: (
    action: IToolbarMenu,
    id: number | null,
    PendingStatusId: number | null,
    record?: T,
  ) => void;
  ref: Ref<HTMLDivElement>;
}
