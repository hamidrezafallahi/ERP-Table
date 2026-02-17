import type { IBaseDto } from '@services/base/type';

export interface IChequeReceipt extends IBaseDto {
  CheckReceiptHeaderId: number;
  VoucherDate: string;
  VoucherNumber: string;
  VoucherTypeId: number;
  VoucherType: {
    VoucherTypeDesc: string;
  };
  RpWayId: number;
  RpWay: {
    RpWayDesc: string;
  };
  Price: number;
  TafsiliId: number;
  Tafsili: {
    TafsiliDesc: string;
  };
  FifthId?: number;
  SixthId?: number;
  SeventhId?: number;
  EightId?: number;
  NineId?: number;
  TenId?: number;
  ElevenId?: number;
  TwelveId?: number;
  ThirteenId?: number;
  CashierId?: number;
  VoucherNatureId?: number;
}

export interface IRequest {
  config: string;
}
