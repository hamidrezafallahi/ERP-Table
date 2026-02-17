import type { IBaseDto } from "@services/base/type";

export interface ICurrencyRate extends IBaseDto {
  CurrencyRateId: number;
  MainCurrencyId: number;
  CurrencyId: number;
  CurrencyRate: number;
  CreateDate: string;
  MainCurrencyDesc:string;
  CurrencyDesc:string;
}

export interface IRequest {
  config: string;
}
