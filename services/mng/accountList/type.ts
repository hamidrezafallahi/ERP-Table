export interface IAccountList {
  AccountId: number;
  MainPlaceId: number;
  MainUserId: number;
  AccountDesc: string;
  CreateDate: string;
  ExpireDate: string;
  Inactive: boolean;
  UserDesc: string;
}

export interface IRequest {
  config: string;
}
