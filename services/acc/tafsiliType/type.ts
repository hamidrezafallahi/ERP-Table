import type { IBaseDto } from "@services/base/type";

export interface ITafsiliType extends IBaseDto {
  TafsiliTypeId?: number;
  TafsiliTypeDesc?: string;
  IsTafsili?: boolean;
  IsFifth?: boolean;
  IsSix?: boolean;
  IsSeven?: boolean;
  IsEight?: boolean;
  IsNine?: boolean;
  IsTen?: boolean;
  IsEleven?: boolean;
  IsTwelve?: boolean;
  IsThirteen?: boolean;
}

export interface IRequest {
  config: string;
}
