import type { IBaseDto } from '@services/base/type';

export interface IJobType extends IBaseDto {
  JobTypeId: number;
  JobTypeDesc: string;
}

export interface IRequest {
  config: string;
}
