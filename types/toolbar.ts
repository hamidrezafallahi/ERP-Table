import { ReportTypeEnum } from "@services/mng/report/type";

import type { IRequestConfig } from "./elementType";
import { PageTypeEnum } from "./enum";
import { ReactNode } from "react";

export interface IToolbar {
  GridMenu: IToolbarMenu[];
  MoreMenu: IToolbarMenu[];
  GroupMenu: IToolbarMenu[];
  List: IToolbarListConfig;
  ReportPosition?: IReportPosition[];
}

export interface IReportPosition {
  Id: number;
  ReportId: number;
  FromViewId: number;
  RepoViewId: number;
  FormViewName: string;
  RepoViewName: string;
  Type: ReportTypeEnum;
}

export interface IToolbarMenu {
  key: string;
  condition?: string | number;
  MenuId?: number;
  ActionId?: number;
  ActionIds?: number[];
  LevelNum?: number;
  MenuDesc?: string;
  Icon?: string | ReactNode;
  FatherId?: number;
  OrderNum?: number;
  MenuType?: number;
  WebLink?: string;
  AppLink?: string;
  loggedInUserId: number;
  LSubMenus?: IToolbarMenu[];
  Config?: string;
}
export interface IMenu {
  key: string;
  condition?: string | number;
  MenuId?: number;
  ActionId?: number;
  ActionIds?: number[];
  LevelNum?: number;
  MenuDesc?: string;
  Icon?:  ReactNode;
  FatherId?: number;
  OrderNum?: number;
  MenuType?: number;
  WebLink?: string;
  AppLink?: string;
  loggedInUserId: number;
  LSubMenus?: IToolbarMenu[];
  Config?: string;
}

export interface IToolbarList {
  key?: number;
  Id?: number;
  Desc?: string;
  Config?: string;
  Url?: string;
  Type?: PageTypeEnum;
  icon?: string;
  label?: any;
}
export interface IToolbarListConfig {
  Config: string;
  ListProp: IToolbarList[];
}

export interface IToolbarDetailConfig {
  fieldName: string;
  fieldCaption: string;
  fieldType: string;
  inFilter: boolean;
  inQuickFilter: boolean;
  inSort: boolean;
  valueOption: IRequestConfig;
}
