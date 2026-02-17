import type { IDetail } from "@services/generalType/type";

export interface IBuyRequestDetails extends IDetail {
  BuyRequestDetailId: number;
  BuyRequestHeaderId: number;
  GoodId: number;
  MeasureUnitId: number;
  Qty: number;
  MeasureUnit: {
    MeasureUnitDesc: string;
  };
  Good: {
    GoodDesc: string;
  };
}

export interface IRequest {
  config: string;
}
