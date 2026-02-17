import type { IBaseDto } from "@services/base/type";

export interface ISalesCircular extends IBaseDto {
  SaleRuleId: number;

  SourceType: any;

  RuleType: RuleTypeEnum;
  CustomerRules: ICustomerRules[];
  CustomerGroupRules: ICustomerGroupRules[];
  GoodsRules: IGoodsRules[];
  GoodsCategoryRules: IGoodsCategoryRules[];
  SaleRuleNumber: string;
  SaleRuleDate: string;
  StartDate: string;
  EndDate: string;
}

export enum RuleTypeEnum {
  // percent = 1,
  // amount = 2,

  Normal = 0,
  StopSelling = 1,
  StopDiscounts = 2,
  StopTaxes = 3,
  OutOfQuantity = 4,
  NotReady = 5,
}

interface ICustomerGroupRules {
  CustomerGroupDiscountId: number;
  CustomerGroupId: number;
  CustomerGroupName: string;
}

interface ICustomerRules {
  CustomerDiscountId: number;
  CustomerId: number;
  CustomerName: string;
}

interface IGoodsCategoryRules {
  GoodsCategoryDiscountId: number;
  GoodsCategoryId: number;
  GoodsCategoryName: string;
}

interface IGoodsRules {
  GoodsDiscountId: number;
  GoodsId: number;
  GoodsName: string;
}

export interface IRequest {
  config: string;
}
