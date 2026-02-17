import type { IBaseDto } from "@services/base/type";

export interface IPricingCircular extends IBaseDto {
  PriceOrderHeaderId: number;
  PriceOrderDesc: string;
  PriceOrderDate: string;
  CustomerId: number;
  PriceOrderNumber?: string;
  StartDate: string;
  EndDate: string;
}

export interface IRequest {
  config: string;
}
