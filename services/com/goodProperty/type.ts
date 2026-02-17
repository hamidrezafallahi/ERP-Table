import type { IBaseDto } from "@services/base/type";

export interface IGoodProperty extends IBaseDto {
  GoodsExtraInfoDesc: string;
  GoodsExtraInfoId: number;
  ExtraInfoTypeId: number;
}

export interface IRequest {
  config: string;
}
