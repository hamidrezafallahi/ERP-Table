import type { IBaseDto } from "@services/base/type";

export interface IStockWarehouse extends IBaseDto {
  StockId: number;
  StockLocationDesc1: string;
  StockLocationDesc2: string;
  StockLocationDesc3: string;
  Quantity1: number;
  Quantity2: number;
  Quantity3: number;
  StockLocationId: number;
  StockLocationDesc: string;
}

export interface IRequest {
  config: string;
}
