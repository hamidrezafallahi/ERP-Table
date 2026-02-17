import type { IBaseDto } from "@services/base/type";

export interface ITafsili extends IBaseDto {
  TafsiliId?: number;
  TafsiliCode?: string;
  TafsiliDesc?: string;
  TafsiliTypeId?: number;
}

export interface IRequest {
  config: string;
}
