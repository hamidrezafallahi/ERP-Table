import { IInitialPage } from '@slice/init/type';

import { HistoryTypeEnum } from './enum';

export interface IHistory {
  initConfig?: IInitialPage;
  key?: string | number;
  type: HistoryTypeEnum;
  pageName: string;
  pageIcon?: string;
  name: string;
}
