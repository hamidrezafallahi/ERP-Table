import type { IBaseDto } from '@services/base/type';

export interface IMarketingTeam extends IBaseDto {
  MarketingTeamId: number;
  MarketingTeamDesc: string;
}

export interface IRequest {
  config: string;
}
