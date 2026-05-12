import { IBaseDto } from "@services/base/type";

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
  VoucherType: VoucherTypeProps;
}

interface VoucherTypeProps {
  DisablePending: boolean;
  GetEntityId: number;
  IsSystem: boolean;
  VoucherTypeDesc: string;
  VoucherTypeId: number;
}
