import type { IBaseDto } from "@services/base/type";

export interface IDiscount extends IBaseDto {
  DiscountId?: number;
  DiscountCode?: number;
  DiscountDesc?: string;
  DiscountTypeId?: number;

  DiscountType?: boolean;
  DiscountTitle?: string;
  DiscountAmount?: number;
  MinPrice?: number;
  ExpireDate?: string;
  EffectiveDate?: string;
  DiscountTypeDesc?: string;
  GoodsDiscounts?: IGoodDiscount[];
  GoodsCategoryDiscounts?: IGoodsCategoryDiscount[];
  CustomerDiscounts?: ICustomerDiscount[];
  CustomerGroupDiscounts?: ICustomerGroupDiscount[];
  DiscountPaymentWays?: IDiscountPaymentWay[];
  DiscountSaleTeams?: IDiscountSaleTeams[];
  DiscountLocations?: IDiscountLocations[];
  DiscountSaleTypes?: IDiscountSaleTypes[];
  DiscountConditions?: IDiscountCondtions[];
}

export enum OperatorTypeEnum {
  Equal = "Equal",
  NotEqual = "NotEqual",
  LessThan = "LessThan",
  GreaterThan = "GreaterThan",
  LessThanOrEqual = " LessThanOrEqual",
  GreaterThanOrEqual = "GreaterThanOrEqual",
}

interface IDiscountCondtions {
  ConditionId?: number;
  Oprator: OperatorTypeEnum;
  Value?: number;
}

interface IDiscountPaymentWay {
  DiscountPaymentWayId: number;
  DiscountId: number;
  PaymentWayId: number;
  PaymentWayDesc: string;
  GetEntityId: number;
  IsSystem: boolean;
  DisablePending: boolean;
}

interface IDiscountSaleTeams {
  DiscountSaleTeamId: number;
  DiscountId: number;
  SaleTeamId: number;
  SaleTeamDesc: string;
  GetEntityId: number;
  IsSystem: boolean;
  DisablePending: boolean;
}

interface IDiscountLocations {
  DiscountLocationId: number;
  DiscountId: number;
  LocationId: number;
  GetEntityId: number;
  IsSystem: boolean;
  DisablePending: boolean;
}

interface IDiscountSaleTypes {
  DiscountSaleTypeId: number;
  DiscountId: number;
  SaleTypeId: number;
  GetEntityId: number;
  IsSystem: boolean;
  DisablePending: boolean;
}

interface ICustomerGroupDiscount {
  CustomerGroupDiscountId: number;
  CustomerGroupId: number;
  CustomerGroupName: string;
}

interface ICustomerDiscount {
  CustomerDiscountId: number;
  CustomerId: number;
  CustomerName: string;
}

interface IGoodsCategoryDiscount {
  GoodsCategoryDiscountId: number;
  GoodsCategoryId: number;
  GoodsCategoryName: string;
}

interface IGoodDiscount {
  GoodsDiscountId: number;
  GoodsId: number;
  GoodsName: string;
}

export interface IRequest {
  config: string;
}
