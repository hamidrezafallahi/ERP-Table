export interface ILoginRequest {
  DeviceToken?: string;
  DeviceType?: number;
  LangId?: number;
  IsRefreshToken?: boolean;
  UserName?: string;
  Password?: string;
  Refresh_Token?: string;
  Grant_Type?: "password" | "refresh_token";
  ManagementAccountId?: number | undefined;
  Exist?: boolean;
  InActive?: boolean;
}

export interface IDeleteResults {
  Key: number;
  IsDelete: boolean;
  Error: string;
  ErrorCode: string;
  Data: IDeleteData[];
}
export interface IDeleteData {
  TableName: string;
  RecCount: number;
  TableDesc: string;
}
export interface ILoginResponse {
  Result: string;
  status: number;
  Error: string;
  Warnings: IWarning[];
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token: string;
  scope: string;
  IsExpire: boolean;
  UserSession: UserSession;
  ManagementAccounts: ManagementAccount[];
}

interface IWarning {
  Name: string;
  Mess: string;
}

export interface IPlaceConfig {
  PlaceConfigValueId: number;
  AccLevel: number;
  SaleConfig: {
    InvoiceMeasurementUnits: number;
  };
}

export interface IMenu {
  MenuId?: number;
  Icon?: string;
  ActionType?: number;
  MenuDesc?: string;
  MenuType?: number;
  ActionId?: number;
  RepoId?: number;
  FatherId?: number;
  SystemId?: number;
  WebLink?: string;
  AppLink?: string;
  SubMenus?: IMenu[];
}
export interface UserSession {
  UserInfo: UserInfo;
  // YearInfo: YearInfo;
  RoleDto: RoleDto[];
  // LangId: number;
  // IsMMA: boolean;
  ManagementAccounts: ManagementAccount[];
}

export interface UserInfo {
  IsAdmin: boolean;
  UserName: string;
  UserPic: string;
  UserId: number;
  UserType: number;
  PackageId: number;
}

export interface YearInfo {
  // فعلاً خالیه
}

export interface RoleDto {
  IsSupporter: boolean;
  RoleId: number;
  RoleName: string;
  Places: Place[];
  isActiveRole?: boolean;
}

export interface Place {
  PlaceId: number;
  PlaceShortCut: string;
  PlaceDesc: string;
}

export interface ManagementAccount {
  ManagementAccountId: number;
  ManagementAccountDesc: string;
  InActive: boolean;
  ExpireDate: string;
  Credit: number;
}
export interface ISendOtpResponse {}
export interface ISendOtpRequest {
  UserName: string;
}
export interface ISendOtpCodeResponse {}
export interface ISendOtpCodeRequest {
  UserName: string;
  Otp: number;
  UsertDevice: string;
}
export interface ISetNewPassWordResponse {}
export interface ISetNewPassWordRequest {
  UserName: string;
  Password: string;
  token: string;
}
export interface IForgetPassWordResponse {}
export interface IForgetPassWordRequest {
  UserName: string;
  Password: string;
  token: string;
}
