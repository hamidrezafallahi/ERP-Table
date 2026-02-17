import type { IDetail } from "@services/generalType/type";

export interface IPriceDetail extends IDetail {
  PriceListDetailId: number;
  PriceListHeaderId: number;
  GoodsId: number;
  Price: number;
}

export interface IPriceDetailRequest {
  config: string;
}
