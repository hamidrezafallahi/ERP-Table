import type { IBaseDto } from '@services/base/type';

export interface IAccount extends IBaseDto {
  AccountId?: number;
  AccountFullCode?: string;
  AccountDesc?: string;
  AccountTypeId?: number;
  AccountLevel?: number;
  IsCurrency?: boolean;
  IsNumber?: boolean;
  IsFollow?: boolean;
  IsCurrencyVoucher?: boolean;
  IsError?: boolean;
  IsWarning?: boolean;
  IsBudget?: boolean;
  Accounts?: IAccount[];
  AccountFatherId?: number;
  HasTafsili: boolean;
  HasFifth: boolean;
  HasSixth: boolean;
  HasSeventh: boolean;
  HasEight: boolean;
  HasNine: boolean;
  HasTen: boolean;
  HasEleven: boolean;
  HasTwelve: boolean;
  HasThirteen: boolean;
  IsInsurance: boolean;
  IsRefer: boolean;
}

export interface IRequest {
  config?: string;
}
