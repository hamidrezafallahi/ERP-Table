import type { IDetail } from '@services/generalType/type';

export interface IChequeIssuanceDetail extends IDetail {
  CheckIssuanceDetailId: number;
  CheckPlaceMentDetailId: number;
  MaturityDate: string;
  DocPrice: number;
  IsForToday: boolean;
  DetailDesc: string;
}

export interface IRequest {
  config: string;
}
