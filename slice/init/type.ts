import { PageStateEnum } from '../pages/enum';

export interface IInitialPage {
  RepoId: number;
  repoId?: number;
  SystemId: number;
  systemId?: number;
  MenuId?: number;
  url: string;
  pageId?: string;
  pageState?: PageStateEnum;
  originalPageState?: PageStateEnum;
  Id?: number;
  selectedView?: number;
  listPageId?: string;
  Key?: number;
  returnPageId?: string;
  data?: Record<string, any>;
  caption?: string;
  captionII?: string;
}
