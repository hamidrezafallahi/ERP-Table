import type { IBaseDto } from '@services/base/type';

export interface IYear extends IBaseDto {
  YearDesc: string;
  StartDate: string;
  EndDate: string;
  YearId: number;
}

export interface IRequest {
  config: string;
}
