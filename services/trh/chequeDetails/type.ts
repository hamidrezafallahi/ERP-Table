import { IDetail } from "@services/generalType/type";

export interface IChequeDetails extends IDetail {
  CheckReceiptDetailId: number;
  CheckReceiptHeaderId: number;
  RowNum: number;
  DocumentChequeId: number;
  DetailDesc: string;
  DocumentCheque: {
    StateId: number;
    BankId: number;
    Num: string;
    MaturityDate: string;
    DocPrice: number;
    IsRegistered: boolean;
    DocumentChequeId: number;
    ReasonId: number;
    PayerId: number;
    OwnerId: number;
    ModifierUserId: number;
    ModifyDate: string;
    CreateDate: string;
    CreateUserId: number;
    PlaceId: number;
  };
}
