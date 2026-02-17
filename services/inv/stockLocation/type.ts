import type { IBaseDto } from '@services/base/type';

export interface IStockLocation extends IBaseDto {
  StockLocationId: number;
  StockLocationDesc: string;
}

export interface IRequest {
  config: string;
}
