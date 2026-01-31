import { Dispatch, SetStateAction } from "react";

import { ElementTypeEnum } from "@services/sale/increasingAndDecreasingFactors/type";

import type { IAdditionalInfo } from "./increasingAndDecreasingFactors/type";

export interface IState extends IAdditionalInfo {
  id: number;
  title: number;
  percent: number;
  pricePercent: boolean;
  amount: number;
  type: ElementTypeEnum;
  deletable?: boolean;
  taxable?: boolean;
  discountable?: boolean;
  desc?: string;
}

export interface ICardProps {
  type?: "JEWELRY";
  headerId: number;
  fieldKey: string;
  detailRequiredValue?: number;
  totalDetailAmount: number;
  beforeTaxAmount?: number;
  vatBaseAmount?: number;
  setTotalOtherValues: Dispatch<
    SetStateAction<{
      otherDecreasing: number;
      otherIncreasing: number;
      taxes: number;
      discounts: number;
    }>
  >;
}
