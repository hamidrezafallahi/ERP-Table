import type { IBaseDto } from '@services/base/type';

export interface IActParam extends IBaseDto {
  ActParamId: number;
  Title: string;
  Desc: string;
}

export interface IRequest {
  config: string;
}
