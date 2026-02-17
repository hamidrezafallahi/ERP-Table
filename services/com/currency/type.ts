import type { IBaseDto } from "@services/base/type";

export interface ICurrency extends IBaseDto {
  CurrencyId: number;
  CurrencyCode: string;
  CurrencyDesc: string;
  CurrencySign: string;
  IsBaseDesc: string;
  IsSystem: false;
}
export interface IAvailableCurrency {
  AvailableCurrencyId: number;
  CurrencyId: number;
  IsBase: boolean;
  IsSystem: boolean;
  Currency: ICurrency;
}

export interface IRequest {
  config: string;
}
