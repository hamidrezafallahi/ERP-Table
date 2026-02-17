import type { IBaseDto } from "@services/base/type";

export interface ICheque extends IBaseDto {
  CheckPlaceMentId: number;
  BankDesc: string;
  AccountName: string;
  DisplayName: string;
}

export interface IRequest {
  config: string;
}
