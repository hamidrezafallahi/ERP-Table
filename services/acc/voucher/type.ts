import type { IBaseDto } from '@services/base/type';

export interface IVoucher extends IBaseDto {
  VoucherHeaderId: number;
  VoucherStatId: number;
  VoucherTypeId: number;
  VoucherDate: string;
  VoucherNumber: string;
  SerialNumber: number;
  ReferNumber: number;
  VoucherDesc: string;
  SourceId: number;
  SystemId: number;
  CreateUserId: number;
  CreateDate: string;
}

export enum VoucherSortTypeEnum {
  ByCreateTime = 1,
  ByVoucherDate = 2,
  ByDateThenCreateTime = 3,
}

export interface IRequest {
  config: string;
}
