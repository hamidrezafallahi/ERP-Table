
import type { IDetail } from "@services/generalType/type";


export interface IDetailPriceAnnouncement extends IDetail {
  PreInvoiceDetailId: number;
  GoodId: number;
  MeasureUnitId: number;
  Quantity: number;
  Fee: number;
}

export interface IRequest {
  config: string;
}

export enum ProformaTypeEnum {
  ProformaInvoice = 0,
  BillingRequest = 1,
  SaleQuotation = 2,
}
