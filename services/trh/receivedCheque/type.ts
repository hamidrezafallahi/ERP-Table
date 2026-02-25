import type { IBaseDto } from "@services/base/type";

export interface IReceivedCheque extends IBaseDto {
  CheckReceiptDetailId: number;
  CheckReceiptHeaderId: number;
  RowNum: number;
  DocumentChequeId: number;
  DetailDesc: string;
  DocumentCheque: IDocumentCheque;
  CheckReceiptHeader: {
    VoucherDate: string;
    CashierId: number;
    RpWay: {
      RPWayId: number;
      VoucherTypeId: number;
      AccountId: number;
      RPWayDesc: string;
    };
  };
}

export interface IDocumentCheque {
  StateId: StateTypeEnum;
  BankId: number;
  OwnerId: number;
  Num: string;
  MaturityDate: string;
  DocPrice: number;
  ModifyDate: string;
  DocumentChequeId: 22;
  ReasonId: 3069;
  PayerId: 979;
  ModifierUserId: 12;
  CreateDate: "2026-02-18T08:38:57.62+00:00";
  CreateUserId: 12;
  PlaceId: 1;
  ManagmentAccountId: 1;
  GetEntityId: 3019;
  Deleted: false;
  IsSystem: false;
  DisablePending: false;
}

export interface IChequeHistory extends IBaseDto {
  ChequeHistoryId?: number;
  ReasonId?: number;
  StateId?: StateTypeEnum;
  OwnerId?: number;
  PayerId?: number;
  ManagmentAccountId?: number;
  PlaceId?: number;
  CreateUserId?: number;
  CreateDate?: string;
  DocumentChequeId?: number;
  PassedType?: PassedTypeEnum;
  DocumentCheque?: IDocumentCheque;
  IsReturned?: boolean;
}
export interface IChequeInfo extends IBaseDto {
  VoucherDate: string;
  VoucherDesc: string;
  BankDesc: string;
  RpWayDesc: string;
  TafsiliDesc: string;
  CashierDesc: string;
  TankhahdarDesc: string;
}

export enum StateTypeEnum {
  Bank = 1,
  CashDesk = 2,
  Collected = 3,
  Person = 4,
  Tankhah = 5,
  Returned = 6,
}

export enum PassedTypeEnum {
  DirectPassed = 1,
  CashierPassed = 2,
  TankhahDarPassed = 3,
}

export interface IRequest {
  config: string;
}
