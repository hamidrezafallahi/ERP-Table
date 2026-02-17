import type { IBaseDto } from '@services/base/type';

export interface ISalesAssociate extends IBaseDto {
  SalesPartnerId: number;
  SalesPartnerDesc: string;
}

export interface IRequest {
  config: string;
}
