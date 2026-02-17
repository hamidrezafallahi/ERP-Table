import type { IAdditionalInfo } from "@components/molecules/salesAndPurchase/salesInvoice/increasingAndDecreasingFactors/type";
import type { IBaseDto } from "@services/base/type";
import type { ITax } from "@services/com/tax/type";

import type { IDiscount } from "../discount/type";

export interface IStandardSalesInvoice extends IBaseDto {
  InvoiceHeaderId: number;
  CustomerId: number;
  VoucherTypeId: number;
  VoucherNumber: string;
  ReferNumber: number;
  VoucherDate: string;
  SaleTypeId: number;
  SaleType: {
    SalTypeDesc: string;
  };
  TaxItems: ITax[];
  DiscountItems: IDiscount[];
  PureAmount: number;
  IsNotPaid: boolean;
  RemainingAmount: number;
  TotalRowAfterDiscount: number;
  VoucherDesc: string;
  ReferDate: string;
  VoucherStatId: number;
  YearId: number;
  AddElementIds: number[];
  Currency: {
    CurrencyDesc: string;
  };
  PayOfTypeId?: number; // روش تسویه
  LondAmount?: number; // مبلغ نسیه
  CashPaymentAmount?: number; // مبلغ پرداختی نقدی
  eInvoicePatternTypeOne?: InvoicePatternTypeOneEnum; //الگوی صورت حساب الکترونیکی شماره یک
  eInvoicePatternTypeTwo?: InvoicePatternTypeTwoEnum; //الگوی صورت حساب الکترونیکی شماره دو

  BillOfLadingNumber?: number; // شماره بارنامه
  OriginCountryId?: number; // کشور مبدا
  OriginCityId?: number; // شهر مبدا
  DestinationCountryId?: number; // کشور مقصد
  DestinationCityId?: number; // شهر مقصد
  BillOfLadingType?: number; // نوع بارنامه/نوع حمل
  FleetNumber?: string; // شماره ناوگان
  ReceiverNationalId?: string; // شماره ملی گیرنده
  DriverNationalId?: string; // شماره ملی راننده
  ReferenceBillOfLadingNumber?: string; // شماره بارنامه مرجع

  FlightType?: number; // نوع پرواز

  SalesNoticeNumber?: string; // شماره اعلامیه فروش
  SalesNoticeDate?: string; // تاریخ اعلامیه فروش

  InsurancePolicyUniqueId?: string; // شناسه یکتای بیمه نامه
  EndorsementUniqueId?: string; // شناسه یکتای الحاقیه
  ContractorAgreementNumber?: number; // شماره قرارداد پیمانکاری

  SubscriberNumber: string; // شماره اشتراک / شناسه قبض بهره بردار
}

export enum InvoicePatternTypeOneEnum {
  SaleWithCustomer = 1,
  SellingCurrency = 2,
  JewelryWithBuyer = 3,
  ContractingAgreement = 4,
  Bills = 5,
  PlaneTicket = 6,
  Export = 7,
  LandingBill = 8,
  StockExchange = 11,
  InsuranceServiceWithBuyer = 13,
}
export enum InvoicePatternTypeTwoEnum {
  SaleWithoutCustomer = 1,
  JewelryWithoutBuyer = 3,
  InsuranceServiceWithoutBuyer = 13,
}

export interface IElk {
  CustomerCode: string;
  CustomerId: number;
  TaxItems: ITax[];
  DiscountItems: IDiscount[];
  AddElementDetailItems: IAdditionalInfo[];
}

export interface IRequest {
  config: string;
}
