import type { IBaseDto } from '@services/base/type';

export interface IRpWay extends IBaseDto {
  RPWayId: number;
  VoucherTypeId: number;
  AccountId: number;
  _SelectId: number;
  _SelectDisplay: string;
  _SelectValue: string;
}

export interface IRequest {
  config: string;
}
