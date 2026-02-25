import type { IBaseDto } from "@services/base/type";

export interface IInvoice extends IBaseDto {
  CustomerId: number;
  VoucherTypeId: number;
  VoucherNumber: number;
  ReferNumber: number;
  VoucherDesc: string;
  VoucherDate: string;
  IsReserveInventory: boolean;
  SaleTypeId: number;
  PaymentWayId: number;
  ExpireDate: string;
  TaxIds: number[];
  DiscountIds: number[];
  AddElementIds: number[];
  TaxRate: number;
  DiscountRate: number;
  Type: ProformaTypeEnum;
}

export interface IRequest {
  config: string;
}

export enum ProformaTypeEnum {
  ProformaInvoice = 0,
  BillingRequest = 1,
  SaleQuotation = 2,
}
