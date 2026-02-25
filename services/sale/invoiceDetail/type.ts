import type { IDetail } from "@services/generalType/type";

export interface IDetailInvoice extends IDetail {
  RowNum: number;
  GoodsId: number;
  MeasureUnitId: number;
  Quantity: number;
  Fee: number;
  TaxIds: number[];
  DiscountIds: number[];
  AddElementDetailIds: number[];
  TaxRate: number;
  DiscountRate: number;
}

export interface IRequest {
  config: string;
}

export enum ProformaTypeEnum {
  ProformaInvoice = 0,
  BillingRequest = 1,
  SaleQuotation = 2,
}
