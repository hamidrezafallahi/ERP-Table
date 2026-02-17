import type { IBaseDto } from "@services/base/type";

export interface IDiscountType extends IBaseDto {
  CommonId: number;
  CommonDesc: string;
}

export interface IRequest {
  config: string;
}
