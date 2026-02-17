import type { IBaseDto } from "@services/base/type";

export interface ICashDeposit extends IBaseDto {
  RpWayId?: number;
  RpWay?: {
    RPWayDesc: string;
  };
  Tafsili?: {
    TafsiliCode: string;
    TafsiliDesc: string;
  };
  TafsiliId?: number;
  FifthId?: number;
  SixthId?: number;
  SeventhId?: number;
  EightId?: number;
  NineId?: number;
  TenId?: number;
  ElevenId?: number;
  TwelveId?: number;
  ThirteenId?: number;
  Price: number;
  VoucherNumber: string;
  VoucherDate: string;
  VoucherDesc: string;
  FishNumber: string;

  CashStatementId: number;
  CashierId: number;
  Cashier?: {
    FullName: string;
  };
}

export interface IRequest {
  config: string;
}
