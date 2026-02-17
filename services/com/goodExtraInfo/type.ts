import type { IBaseDto } from "@services/base/type";

export interface IGoodExtraInfo extends IBaseDto {
  GoodsExtraInfoGoodsId: number;
  GoodsId: number;
  GoodsExtraInfoId: number;
  GoodsExtraInfoValue: string;
  GoodsExtraInfo: {
    GoodsExtraInfoId: number;
    GoodsExtraInfoDesc: string;
  };
  CreateDate: string;
  CreateUserId: number;
}

export interface IRequest {
  config: string;
}

export interface IGoodExtraInfoSelect extends IBaseDto {
  GoodsExtraInfoId: number;
  GoodsExtraInfoDesc: string;
  Type: number;
}
