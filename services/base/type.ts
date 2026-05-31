import type { IFilterIds } from '@slice/pages/type';

export interface IBaseQueryResponse<T> {
    Result: string;
    Error?: string;
    ErrorCode?: string;
    InnerException?: string;
    AdditionalInfo?: any;
    Data: T;
    TotalCount: number;
    ReturnCount: number;
    ReadFromCache: boolean;
    ExportFile?: string;
    ExportString?: string;
    YearPlanId?: number;
}

export interface IBaseDto {
    PendingStatusId?: PendingStatusEnum | ErrorStatusEnum;
    PendingMessage?: string;
    TagsInfo?: ITagInfo[];
    HasBookMark?: boolean;
    Inactive?: boolean;
    FormViewId?: number;
    IsAssign?: boolean;
    IsCanUpdate?: boolean;
    IsCanDelete?: boolean;
    IsCanShare?: boolean;
    ExpireDate?: string;
}

export interface ITagInfo {
    TagId: number;
    RepoTagId?: number;
    Title: string;
}
export interface ICommandResponse {
    Key: number;
    Result: "Failed" | "Success" | "Pending";
    InnerException?: string;
    PendingStatusId?: number;
    DeleteResults?: IDeleteResult[];
    Error?: string;
    TotalInputCount?: number;
    TotalOkCount?: number;
    TotalErrorCount?: number;
    Data?: any;
}

export interface IDeleteResult {
    Key: number;
    IsDelete: boolean;
    Error?: string;
}
export interface IFilters {
    FilterInfo?: IFilter[];
    ShowOnlyBookmarked?: boolean;
    TagIdsFilter?: number[];
   
}
export interface IBaseRequest<T> {
    RepoId?: number;
    ReferId?: number;
    UserId?: number;
    RoleId?: number;
    ActionId?: number;
    RefId?: number;
    SystemId?: number;
    FatherId?: number;
    InventoryId?: string;
    GoodId?: number;
    GoodsId?: number;
    PersonId?: number;
    SPlanId?: number;
    StockId?: number;
    PatternId?: number;
    Id?: number;
    ActParamId?: number;
    HeaderId?: number;
    RepoViewId?: number;
    Ids?: number[];
    PagingInfo?: IPagingInfo;
    OrderInfo?: IOrderInfo[];
    Filters?: IFilters;
    ShowMode?: ShowModeEnum;
    ShowTags?: boolean;
    ShowBookmarked?: boolean;
    FullSearchPhrase?: string;
    additional?: T;
    Next?: number;
    CategoryId?: number;
    BarCode?: number;
    SearchCommand?: string;
    DeviceToken?: string;
    AccountId?: number;
    CustomerId?: number;
    Price?: number;
    AccountIds?: number[];
    ReportId?: number;
    YearIds?: number[];
    PlaceIds?: number[];
    PlaceId?: number; // add me
    VoucherTypeId?: number;
    VoucherNumber?: number;
    StartDate?: string | Date;
    EndDate?: string | Date;
     From?: string | Date;
    FromDate?: string | Date;
    ToDate?: string | Date;
    To?: string | Date;
    VoucherDate?: string;
    VoucherDesc?: string;
    InnerFilters?: IInnerFilter[];
    IsFirstPeriod?: boolean;
    IsCurrencyCount?: boolean;
    IsReferCount?: boolean;
    IsShowMandehDar?: boolean;
    PlaceIdsCols?: number[];
    FilterIds?: null | IFilterIds[];
    FilterTypeIds?: number[];
    OnlySum?: boolean;
    MenuType?: MenuTypeEnum;
    ShowAll?: boolean;
    InvoiceHeaderId?: number;
    Type?: number;
    UserName?: string;
    MemoId?: string;
    EconumicNumber?: string;
    IsAuto?: boolean;
    AutoSendDuration?: number;
    StartNumber?: number;
    IsSendByMoatamed?: true;
    Cert?: string;
    CSR?: string;
    MoadianMoatamedId?: number;
    IsForHeader?: boolean;
    IsForDetail?: boolean;
    CalendarId?: number;
    YearPlanId?: number;
    Token?: string;
    Details?: unknown[];
    BankAccountId?: number
}

export interface IService<T, K = unknown> {
    url: string;
    body?: IBaseRequest<K>;
    skip?: boolean;
    id?: string | number;
}

export interface IOrderInfo {
    ColName?: string;
    Asc?: boolean;
}
export interface IInnerFilter {
    ColName: string;
    FilterType: string;
    Value: string;
}

export interface IFilter {
    ColName?: string;
    InnerFilterId?: number;
    FilterType?: filterTypeStringEnum | filterTypeDateEnum | filterTypeNumberEnum;
    Value?: any;
}

export interface IPagingInfo {
    PageRecordCount?: number;
    PageNumber?: number;
    OnlyTotalCount?: boolean;
    WithTotalCount?: boolean;
}

export enum filterTypeStringEnum {
    Equal = "ftEqual",
    NotEqual = "ftNotEqual",
    Contains = "ftContains",
    StartWith = "ftStartWith",
    EndWith = "ftEndWith",
    IsNull = "ftIsNull",
    NotNull = "ftNotNull",
}

export enum filterTypeDateEnum {
    Equal = "ftEqual",
    NotEqual = "ftNotEqual",
    GreaterThan = "ftGreaterThan",
    LessThan = "ftLessThan",
    GreaterThanOrEqual = "ftGreaterThanOrEqual",
    LessThanOrEqual = "ftLessThanOrEqual",
    IsNull = "ftIsNull",
    NotNull = "ftNotNull",
}
export enum filterTypeNumberEnum {
    Equal = "ftEqual",
    NotEqual = "ftNotEqual",
    GreaterThan = "ftGreaterThan",
    LessThan = "ftLessThan",
    GreaterThanOrEqual = "ftGreaterThanOrEqual",
    LessThanOrEqual = "ftLessThanOrEqual",
    IsNull = "ftIsNull",
    NotNull = "ftNotNull",
}
export enum ShowModeEnum {
    Normal = 0,
    Pending = 1,
    ErrorPending = 2,
    Deleted = 3,
    All = 10,
}

export enum PendingStatusEnum {
    Pending1 = 1,
    Pending2 = 2,
    Pending3 = 3,
}

export enum ErrorStatusEnum {
    Error100 = 100,
    Error101 = 101,
    Error102 = 102,
}

export enum MenuTypeEnum {
    SidebarMenu = 1,
    ListToolbar = 2,
    FormToolbar = 3,
    DataTableAction = 4,
}
