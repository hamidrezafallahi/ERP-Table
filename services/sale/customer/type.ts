import type { IBaseDto } from "@services/base/type";

export interface ICustomer extends IBaseDto {
  CustomerId: number;
  CustomerCode?: string;
  CustomerDesc?: string;
  CreateUserId?: number;
  PlaceId?: number;
  GroupId: number;
  ManagmentAccountId?: number;
  FullName: string;
  IsAnonymous?: boolean;
  CreditValue?: number;
  StartDate?: string;
  EndDate?: string;
  CurrencyId?: number;
}

export interface IRequest {
  config: string;
}
