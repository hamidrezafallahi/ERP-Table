import { type IIncreasingAndDecreasingFactors } from "@services/sale/increasingAndDecreasingFactors/type";
import type { ISelectOption } from "@type/elementType";

export interface IData extends ISelectOption {
  AddElement: IIncreasingAndDecreasingFactors;
}

export interface IAdditionalInfo {
  ElementType?: number;
  AddElementCode?: string;
  AddElementDesc?: string;
  AddElementId?: number;
  BaseValue?: number;
  IsMandatory?: boolean;
  PricePercent?: boolean;
  Discountable?: boolean;
  Taxable?: boolean;
}
