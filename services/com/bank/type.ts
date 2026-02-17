import type { IBaseDto } from '@services/base/type';

export interface IBank extends IBaseDto {
  BankCode: string;
  BankDesc: string;
  BankId: number;
}

export interface IRequest {
  config: string;
}
