import type { IBaseDto } from "@services/base/type";

export interface IBuyRequest extends IBaseDto {
  BuyRequestHeaderId: number;
  DocId: number;
  VoucherTypeId: number;
  VoucherNumber: number;
  VoucherDate: string;
  VoucherDesc: string;
}

export interface IRequest {
  config: string;
}
