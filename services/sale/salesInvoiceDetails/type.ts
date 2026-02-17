import {
  IState,
} from '@components/molecules/salesAndPurchase/salesInvoice/type';
import type { ITax } from '@services/com/tax/type';
import type { IDetail } from '@services/generalType/type';

import type { IDiscount } from '../discount/type';

export interface ISalesInvoiceDetails extends IDetail {
  InvoiceDetailId: number;
  InvoiceHeaderId: number;
  GoodsId: number;
  Quantity1: number;
  Unit1Id: number;
  Quantity2?: number;
  Unit2Id?: number;
  Quantity3?: number;
  Unit3Id?: number;
  Fee: number;
  DetailDesc: string;
  DeductionCost: number;
  AdditionCost: number;
  TotalRowAmount: number;
  FinalQuantity: number;
  FinalUnitId: number;
  TaxItems: ITaxState[];
  DiscountItems: IDiscountState[];
  DiscountIds?: any;
  AddElementDetailItems: IState[];
  AddElementDetailIds?: any;
  TaxIds?: any;
  LegalFundsAmount?: number;
  TaxFundsAmount?: number;
  
  // CurrencyAmount?: number; // میزان ارز
  CurrencyTypeId?: number; // نوع ارز

  CurrencyToRialRate?: number; //  نرخ فروش ارز

  CommissionContractNumber?: number; // شماره قرارداد حق‌العمل کاری

  NetWeight?: number; // وزن خالص
  // GoodsRialValue?: number; //ارزش ریالی کالا
  GoodsCurrencyValue?: number; // ارزش ارزی کالا

  CurrencyPurchaseRate?: number; // نرخ خرید ارز
  VATBaseAmount?: number; // ماخذ مالیات بر ارزش افزوده

  ConstructionCost?: number; // اجرت ساخت
  SellerProfit?: number; // سود فروشنده
  Commission?: number; // حق العمل
  Purity?: number; // عیار

  LegalFundsRate?: number; // نرخ وجوه قانونی
  LegalFunds?: boolean; // نرخ وجوه قانونی
  TaxFunds?: boolean; // نرخ سایر مالیات و عوارض
  TaxFundsRate?: number; // نرخ سایر مالیات و عوارض
}

export interface ITaxState extends ITax {
  deletable?: boolean;
  id?: number;
  amount?: number;
  elementAmount?: number;
  totalAmount?: number;
}
export interface IDiscountState extends IDiscount {
  deletable?: boolean;
  id?: number;
  amount?: number;
  elementAmount?: number;
  totalAmount?: number;
}

export interface IRequest {
  config: string;
}
