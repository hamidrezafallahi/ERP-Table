import type { IBaseDto } from "@services/base/type";

export interface IUnitOfMeasurement extends IBaseDto {
  FatherId?: number;
  MeasureUnitId: number;
  MeasureUnitDesc: string;
  Factor: number;
  SubUnits: IUnitOfMeasurement[];
}

export interface IRequest {
  config?: string;
}
