import type { IBaseDto } from '@services/base/type';

export interface IBankAccount extends IBaseDto {
  BankAccountId: number;
  BankId: number;
  AccountNo: string;
  AccountName: string;
  BranchName: string;
  IsCurrency: boolean;
  TafsiliId: number;
  IsDefault: boolean;
  PendingStatusId: number;
}

export interface IRequest {
  config: string;
}
