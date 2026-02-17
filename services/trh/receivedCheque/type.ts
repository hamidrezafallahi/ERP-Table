import type { IBaseDto } from "@services/base/type";

export interface IReceivedCheque extends IBaseDto {
  CheckReceiptDetailId: number;
  CheckReceiptHeaderId: number;
  RowNum: number;
  DocumentChequeId: number;
  DetailDesc: string;
  DocumentCheque: {
    StateId: number;
    BankId: number;
    OwnerId: number;
    Num: string;
    MaturityDate: string;
    DocPrice: number;
    ModifyDate: string;
  };
  CheckReceiptHeader: {
    VoucherDate: string;
    CashierId: number;
    RpWay: {
      RPWayId: number;
      VoucherTypeId: number;
      AccountId: number;
      RPWayDesc: string;
      GetEntityId: number;
    };
    GetEntityId: number;
  };
}

export interface IRequest {
  config: string;
}
