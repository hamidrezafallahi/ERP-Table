import type { IBaseDto } from '@services/base/type';

export interface ICashFund extends IBaseDto {
  CashId: number;
  CashCode: string;
  CashDesc: string;
  IsTankhah: boolean;
  PlaceId: number;
}

export interface IRequest {
  config: string;
}
