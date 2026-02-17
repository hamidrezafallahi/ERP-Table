import type { IBaseDto } from "@services/base/type";

export interface ICustomerGroup extends IBaseDto {
  CustomerGroupId?: number;
  CustomerGroupDesc?: string;
  FatherId?: number;
  PlaceId?: number;
  CreateDate?: string;
  ManagmentAccountId?: number;
  ModifyDate?: string;
  CreateUserId?: number;
  ModifierUserId?: number;
  SubUnits?: ICustomerGroup[];
}

export interface IRequest {
  config?: string;
}
