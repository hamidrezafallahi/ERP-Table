import {
  Dispatch,
  SetStateAction,
} from 'react';

import type { IAccountSetting } from '@services/acc/accountSetting/type';
import type { IColumnConfig } from '@services/generalType/type';
import type { IItems } from '@slice/items/type';
import type { IToolbarMenu } from '@type/toolbar';

export interface IProps {
  data: IAccountSetting[];
  locale: string;
  rowIdField: string;
  columnsConfig: IColumnConfig[];
  actions: IToolbarMenu[];
  handleAction: (
    action: IToolbarMenu,
    item: number | number[] | null,
    PendingStatusId: number | null
  ) => Promise<void>;
  setItems: Dispatch<SetStateAction<IItems>>;
  items: number | number[];
  isLoading: boolean;
}
