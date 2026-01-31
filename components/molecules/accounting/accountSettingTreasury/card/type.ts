import type { IAccountSetting } from "@services/acc/accountSetting/type";
import type { IColumnConfig } from "@services/generalType/type";
import type { IToolbarMenu } from "@type/toolbar";

export interface IProps {
  data: IAccountSetting[];
  columnsConfig: IColumnConfig[];
  actions: IToolbarMenu[];
  staticData: string;
  onActionClick: (
    action: IToolbarMenu,
    item: number | number[] | null,
    PendingStatusId: number | null
  ) => void;
  rowIdField: string;
}
