import type { IBaseDto } from "@services/base/type";


export interface IPriceAnnouncement extends IBaseDto {
  PreInvoiceHeaderId: number;
  ReferNumber: number;
  VoucherNumber: number;
  VoucherTypeId: number;
  CustomerId: number;
  Type: ProformaTypeEnum;
  VoucherDate: string;
  VoucherDesc: string;
}


export interface IRequest {
  config: string;
}

export enum ProformaTypeEnum {
  ProformaInvoice = 0,
  BillingRequest = 1,
  SaleQuotation = 2,
}
