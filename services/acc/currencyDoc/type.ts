import type { IBaseDto } from '@services/base/type';

export interface ICurrencyDoc extends IBaseDto {
    CostConversionId?: number
    ToDate?: string
    CurrencyRate?: number
    AccountDesc?: string
    AccountId?: number;
    CurrencyDesc?: string;
    CurrencyId?: number;

}

export interface IRequest {
    config?: string;
}
