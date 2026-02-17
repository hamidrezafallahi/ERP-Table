import type { IBaseDto } from "@services/base/type";

export interface IPrice extends IBaseDto {
  PriceListHeaderId: number;
  PriceListHeaderDesc: string;
}

export interface IRequest {
  config: string;
}
