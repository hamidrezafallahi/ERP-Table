import type { IBaseDto } from '@services/base/type';

export interface ISaleTeam extends IBaseDto {
  SaleTeamId: number;
  SaleTeamCode: string;
}

export interface IRequest {
  config: string;
}
