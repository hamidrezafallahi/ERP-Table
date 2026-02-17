import type { IBaseDto } from "@services/base/type";

export interface ITax extends IBaseDto {
  TaxId?: number;
  TaxDesc?: string;
  TaxRate?: number;
  PlaceId?: number;
  CreateDate?: string;
}

export interface IRequest {
  config: string;
}
