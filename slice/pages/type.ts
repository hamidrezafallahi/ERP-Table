import type {
  IFilters,
  IOrderInfo,
  IPagingInfo,
  ITagInfo,
} from '@services/base/type';
import { IInnerFilter } from '@services/base/type';
import type { IFormFieldConfig } from '@type/elementType';
import { PageTypeEnum } from '@type/enum';
import type { IToolbar } from '@type/toolbar';

import {
  HeaderTypeEnum,
  PageStateEnum,
} from './enum';

export interface IPageElement {
  fieldName: string;
  value: any;
  type: "string" | "number" | "boolean" | "date";
}
export interface IPage {
  pageOrder?: number;
  pageId?: string;
  isActive?: boolean;
  isModal?: boolean;
  parentPageId?: string;
  caption?: string;
  captionII?: string;
  pageState?: PageStateEnum;
  originalPageState?: PageStateEnum;
  RepoId: number;
  data?: Record<string, any>;
  SystemId: number;
  pageData?: IFormFieldConfig[];
  viewData?: IViewData;
  pageInfo?: IPageInfo;
  type?: PageTypeEnum;
  toolbarData?: IToolbar;
  TagsInfo?: ITagInfo[];
  icon?: string;
  listUrl?: string;
  selectedView?: number;
  selectedViewIndex?: number;
  listPageId?: string;
  Key?: number;
  withImage?: boolean;
  returnPageId?: string;
  Id?: number;
  headerType?: HeaderTypeEnum;
  gridData?: any[];
  addCaption?: string | null;
  confirmUrl?: string | null;
  deleteUrl?: string | null;
  formUrl?: string | null;
  isSelectMode?: boolean;
  renderCustomActions?: any;
  repoId?: number;
  rowFieldKey?: string;
  staticKey?: string;
  staticKeyII?: string;
  systemId?: number;
  url?: string;
  refetchGridData?: () => void;
}

export interface IStateItem {
  id: number;
  status: number;
}

export interface IViewData {
  RepoViewId?: number;
  PagingInfo?: IPagingInfo;
  OrderInfo?: IOrderInfo[];
  Filters?: IFilters;
  FullSearchPhrase?: string;
  ShowTags?: boolean;
  ShowBookmarked?: boolean;
  deletedItems?: number[];
  statusItems?: IStateItem[];
  url?: string;
  Id?: null | number;
  Ids?: null | number[];
  PageRecordCount?: number;
  PageNumber?: number;
  YearIds?: null | number[];
  PlaceIds?: null | number[];
  FromDate?: string | Date;
  ToDate?: string | Date;
  StartDate?: string | Date;
  EndDate?: string | Date;
  InnerFilters?: IInnerFilter[];
  IsFirstPeriod?: boolean;
  IsCurrencyCount?: boolean;
  IsReferCount?: boolean;
  IsShowMandehDar?: boolean;
  PlaceIdsCols?: null | number[];
  FilterIds?: null | IFilterIds[];
  FilterTypeIds?: null | number[];
  steps?: IStep[];
  lastSteps?: IStep[];
  selectedItems?: IStep[];
  Level?: number;
  AccessLevel?: number;
  AccessLevelLoading?: boolean;
  RefetchId?: null | string;
  showCurrency?: boolean;
  child?: INested | null;
  TreeView?: boolean;
  Columns?: IColumns[];
  reportType?: number;
  isShowMoeen?: boolean;
  ShowInadept?: boolean;
  ShowCreditor?: boolean;
  ShowHasRemain?: boolean;
  ShowHasNotRemain?: boolean;
  ReportMode?: number;
  ColsType?: number;
  CurrencyReportType?: number;
  GrohGroupLevel?: boolean;
  ColGroupLevel?: boolean;
  MoeenGroupLevel?: boolean;
  FourthLevelGroup?: boolean;
  FifthLevelGroup?: boolean;
  SixthLevelGroup?: boolean;
  SeventhLevelGroup?: boolean;
  EightLevelGroup?: boolean;
  NinthLevelGroup?: boolean;
  TenthLevelGroup?: boolean;
  EleventhLevelGroup?: boolean;
  TwelfthLevelGroup?: boolean;
  ThirteenthLevelGroup?: boolean;
  ReportType?: number;
}

export interface IPageInfo {
  addEndpoint: string;
  deleteEndpoint: string;
  formIdField: number | string;
  updateEndpoint: string;
}

export interface IStep {
  Level: number;
  Items: IRow[];
}
export interface IFilterIds {
  Level: number;
  Ids: number[];
}
export interface IRow {
  AccCode: string;
  AccDesc: string;
  AccId: number;
  key: number;
  children?: IRow;
  Nested: INested;
}

export interface IReport {
  url: string;
  Id?: null | number;
  RepoViewId?: null | number;
  Ids?: null | number[];
  PageRecordCount?: number;
  PageNumber?: number;
  // WithTotalCount?: boolean;
  YearIds?: null | number[];
  PlaceIds?: null | number[];
  FromDate?: number;
  ToDate?: number;
  InnerFilters?: IInnerFilter[];
  IsFirstPeriod?: boolean;
  IsCurrencyCount?: boolean;
  IsReferCount?: boolean;
  IsShowMandehDar?: boolean;
  PlaceIdsCols?: null | number[];
  FilterIds?: null | IFilterIds[];
  FilterTypeIds?: null | number[];
  steps?: IStep[];
  lastSteps?: IStep[];
  selectedItems?: IStep[] | [];
  Level?: number;
  AccessLevel?: number;
  AccessLevelLoading?: boolean;
  RefetchId?: null | string;
  showCurrency: boolean;
  child?: INested | null;
  TreeView?: boolean;
  Filters?: null | IFilters;
  Columns?: IColumns[];
  OrderInfo?: any;
  PagingInfo?: any;
}
export interface INested {
  Level: number;
  Id: number;
  Nested: INested;
}
export interface IColumns {
  fieldName: string;
  fieldCaption: string;
  fieldType: string;
}

export interface IData {
  key: string;
  AccId: number;
  AccCode: string;
  AccDesc: string;
  SumBed: number;
  SumBes: number;
  MandBed: number;
  MandBes: number;
  children: IData;
  Nested: INested;
}
export interface ICol {
  title: string;
  dataIndex: string;
  key: string;
}
export interface IReportResponse {
  TotalCount: number;
  ReturnCount: number;
  Data: IData[];
  columns: ICol[];
}
