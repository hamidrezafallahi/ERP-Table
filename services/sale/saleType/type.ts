import type { IBaseDto } from '@services/base/type';

export interface ISaleType extends IBaseDto {
  SalTypeId: number;
  SalTypeDesc: string;
  SalTypeCode: string;
}

export interface IRequest {
  config: string;
}
