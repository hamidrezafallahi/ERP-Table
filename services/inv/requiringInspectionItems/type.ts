import type { IBaseDto } from "@services/base/type";

export interface IRequiringInspectionItems extends IBaseDto {
  InspectionId: number;
  MeasureUnitId: number;
  GoodId: number;
  StockDesc: string;
  VoucherHeaderId: number;
  InspectionDate: string;
  Description: string;
  IsAccept: boolean;
  AcceptCount: number;
  UniqueId: string;

  Items: {
    key: number;
    GoodsInspectionId: number;
    Value: number;
    MeasureUnitId: number;
    AdmissionResult: string;
  }[];
}

export interface IRequest {
  config: string;
}
