import type { IBaseDto } from '@services/base/type';

export interface IStock extends IBaseDto {
  StockId: number;
  StockDesc: string;
}

export interface IRequest {
  config: string;
}
