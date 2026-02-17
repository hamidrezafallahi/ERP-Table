import type { IDetail } from "@services/generalType/type";

export interface IReturnSalesInvoiceDetails extends IDetail {
  SalesReturnDetailId: number;
  RowNum: number;
  GoodsId: number;
  UnitId: number;
  Quantity: number;
  Unit: {
    MeasureUnitDesc: string;
    GetEntityId: number;
  };
  Goods: {
    GoodsDesc: string;
    GetEntityId: number;
  };
}

export interface IRequest {
  config: string;
}
