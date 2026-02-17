import type { IBaseDto } from "@services/base/type";

export interface IPurchaseOrder extends IBaseDto {
  UniqueId: string;
  GoodsId: number;
  GoodsCode?: string;
  GoodsDesc?: string;
  Quantity?: number;
  MeasureUnitId?: number;
  MeasureUnit?: {
    MeasureUnitDesc?: string;
  };
  OrderAmount?: number;
}

export interface IRequest {
  config: string;
}
