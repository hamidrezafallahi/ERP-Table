import type { IBaseDto } from '@services/base/type';
import { RowStateEnum } from '@services/generalType/type';

export interface IBankWithdrawal extends IBaseDto {
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
  BankStatementId: number;
  BankAccountId: number;
  BankAccount?: {
    AccountName: string;
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
    RowNum: number;
    RowState?: RowStateEnum;
    key: number;
    addedPage?: number;
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
    RowNum: number;
    RowState?: RowStateEnum;
    key: number;
    addedPage?: number;
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
    RowNum: number;
    RowState?: RowStateEnum;
    key: number;
    addedPage?: number;
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
    RowNum: number;
    RowState?: RowStateEnum;
    key: number;
    addedPage?: number;
  }[];
}

export interface IRequest {
  config: string;
}
