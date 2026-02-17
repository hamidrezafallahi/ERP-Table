import type { IBaseDto } from '@services/base/type';

export interface IInventoryVoucherType extends IBaseDto {
  VoucherTypeDesc: string;
  VoucherTypeId: number;
  SystemId: number;
  IsInventoryTransfer?: boolean;
  HasThirdParty?: boolean;
  TafsiliTypeId?: number;
  InOut: number;
  VoucherGroupId: number;
  NeedReference?: boolean;
  VoucherReference?: string;
  InOutTypeDesc?:string
  NeedQualityControl?:boolean
}
export interface IRequest {
  config: string;
}
