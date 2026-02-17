import type { IBaseDto } from "@services/base/type";

export interface IInventoryVoucher extends IBaseDto {
  VoucherHeaderId: number;
  VoucherTypeId: number;
  VoucherNumber: string;
  PatternId: number;
  Series: string;
  IndicatorNo: number;
  VoucherDate: string;
  YearId: number;
  StockId: number;
  ToStockId?: number;
  TafsiliId?: number;
  VoucherDesc: string;
  CreateDate: string;
  CreateUserId: number;
  ModifierUserId: number;
  ModifyDate: string;
  ManagmentAccountId: number;
}
export interface IRequest {
  config: string;
}
