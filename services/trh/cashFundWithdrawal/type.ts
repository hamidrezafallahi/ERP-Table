import type { IBaseDto } from '@services/base/type';

export interface ICashFundWithdrawal extends IBaseDto {
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

  TankhahStatementId: number;
  TankhahdarId: number;
  Tankhahdar?: {
    FullName: string;
  };
  TankhahStatements?: {
    TankhahStatementId: number;
    RpWayId: number;
    VoucherDate: string;
    VoucherDesc: string;
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
    Tankhahdar: {
      CreateDate: string;
      GetEntityId: number;
    };
    Tafsili: {
      TafsiliDesc: string;
      GetEntityId: number;
    };
    Fifth: {
      GetEntityId: number;
    };
    Sixth: {
      GetEntityId: number;
    };
    Seventh: {
      GetEntityId: number;
    };
    Eight: {
      GetEntityId: number;
    };
    Nine: {
      GetEntityId: number;
    };
    Ten: {
      GetEntityId: number;
    };
    Eleven: {
      GetEntityId: number;
    };
    Twelve: {
      GetEntityId: number;
    };
    RpWay: {
      RPWayId: number;
      VoucherTypeId: number;
      AccountId: number;
    };
  }[];
  TafsiliStatements: {
    RpWayId: number;
    VoucherDate: string;
    VoucherDesc: string;
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
    Tankhahdar: {
      CreateDate: string;
      GetEntityId: number;
    };
    Tafsili: {
      TafsiliDesc: string;
      GetEntityId: number;
    };
    Fifth: {
      GetEntityId: number;
    };
    Sixth: {
      GetEntityId: number;
    };
    Seventh: {
      GetEntityId: number;
    };
    Eight: {
      GetEntityId: number;
    };
    Nine: {
      GetEntityId: number;
    };
    Ten: {
      GetEntityId: number;
    };
    Eleven: {
      GetEntityId: number;
    };
    Twelve: {
      GetEntityId: number;
    };
    RpWay: {
      RPWayId: number;
      VoucherTypeId: number;
      AccountId: number;
    };
  }[];
  CashStatements: {
    CashStatementId: number;
    RpWayId: number;
    VoucherDate: string;
    VoucherDesc: string;
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
    Tankhahdar: {
      CreateDate: string;
      GetEntityId: number;
    };
    Tafsili: {
      TafsiliDesc: string;
      GetEntityId: number;
    };
    Fifth: {
      GetEntityId: number;
    };
    Sixth: {
      GetEntityId: number;
    };
    Seventh: {
      GetEntityId: number;
    };
    Eight: {
      GetEntityId: number;
    };
    Nine: {
      GetEntityId: number;
    };
    Ten: {
      GetEntityId: number;
    };
    Eleven: {
      GetEntityId: number;
    };
    Twelve: {
      GetEntityId: number;
    };
    RpWay: {
      RPWayId: number;
      VoucherTypeId: number;
      AccountId: number;
    };
  }[];
  BankStatements: {
    BankStatementId: number;
    RpWayId: number;
    VoucherDate: string;
    VoucherDesc: string;
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
    Tankhahdar: {
      CreateDate: string;
      GetEntityId: number;
    };
    Tafsili: {
      TafsiliDesc: string;
      GetEntityId: number;
    };
    Fifth: {
      GetEntityId: number;
    };
    Sixth: {
      GetEntityId: number;
    };
    Seventh: {
      GetEntityId: number;
    };
    Eight: {
      GetEntityId: number;
    };
    Nine: {
      GetEntityId: number;
    };
    Ten: {
      GetEntityId: number;
    };
    Eleven: {
      GetEntityId: number;
    };
    Twelve: {
      GetEntityId: number;
    };
    RpWay: {
      RPWayId: number;
      VoucherTypeId: number;
      AccountId: number;
    };
  }[];
}

export interface IRequest {
  config: string;
}
