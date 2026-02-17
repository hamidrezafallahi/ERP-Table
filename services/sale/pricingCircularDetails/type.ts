import type { IDetail } from "@services/generalType/type";

export interface IPricingCircularDetails extends IDetail {
  PriceOrderDetailId: number;
  PriceOrderHeaderId: number;
  GoodsId: number;
  CurrencyId: number;
  Price: number;
}

export interface IPriceDetailRequest {
  config: string;
}
