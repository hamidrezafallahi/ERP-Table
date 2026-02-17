import type { IBaseDto } from '@services/base/type';

export interface IAccountSetting extends IBaseDto {
  RPWayId: number;
  VoucherTypeId: number;
  AccountId: number;
  RPWayCode: string;
  RPWayDesc: string;
  ReferVoucherTypeId: number;
  VoucherType: {
    VoucherTypeId: number;
    VoucherTypeDesc: string;
    GetEntityId: number;
  };
}

export interface IRequest {
  config?: string;
}
