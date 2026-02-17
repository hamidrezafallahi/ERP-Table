import type { IBaseDto } from "@services/base/type";
import type { ITax } from "@services/com/tax/type";

import type { IDiscount } from "../discount/type";

export interface IReturnSalesInvoice extends IBaseDto {
  SalesReturnHeaderId: number;
  VoucherNumber: string;
  VoucherDate: string;
  VoucherDesc: string;
  CustomerName: string;
  InvoiceHeader: {
    InvoiceHeaderId: number;
    VoucherNumber: string;
    VoucherDesc: string;

    GetEntityId: number;
  };
}

export interface IElk {
  CustomerCode: string;
  CustomerId: number;
  TaxItems: ITax[];
  DiscountItems: IDiscount[];
}

export interface IRequest {
  config: string;
}
