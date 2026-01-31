import type { IFormFieldConfig } from '@type/elementType';

export interface IProps {
  config: IFormFieldConfig;
}

export interface ISelectHeaderReturnInvoice {
  Id: number;
  VoucherDate: string;
  VoucherDesc: string;
  DetailCount: number;
  TotalAddition: number;
  TotalDeduction: number;
  TotalTax: number;
  TotalDiscount: number;
  TotalAmount: number;
  CustomerName: string;
  VoucherNumber: number;
}
