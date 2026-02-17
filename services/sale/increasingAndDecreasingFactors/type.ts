import type { IBaseDto } from '@services/base/type';

export interface IIncreasingAndDecreasingFactors extends IBaseDto {
  AddElementId: number;
  AddElementDesc?: string;
  ElementTypeDesc?: string;
  ElementType?: ElementTypeEnum;
  AddElementCode?: string;
  PricePercent?: boolean;
  Discountable?: boolean;
  Taxable?: boolean;
  IsDetail?: boolean;
  BaseValue?: number;
}

export enum ElementTypeEnum {
  Neutral = 0,
  Increasing = 1,
  Decreasing = 2,
}

export interface IRequest {
  config: string;
}
