import type { IBaseDto } from '@services/base/type';

export interface IChequeIssuance extends IBaseDto {
  CheckIssuanceHeaderId: number;
  BankAccountId: number;
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
  VoucherNatureId?: number;
}

export interface IRequest {
  config: string;
}
