import type { IBaseDto } from "@services/base/type";

export interface IGoodQc extends IBaseDto {
  GoodInspectionId: number;
  GoodsId: number;
  ParameterName: string;
  ParameterType: ParameterTypeEnum;
  Target: number;
  UpperLimit: number;
  LowerLimit: number;
  MeasureUnitId: number;
  AdmissionRequirements: string;
}

export enum ParameterTypeEnum {
  numeric = 1,
  unNumeric = 2,
}

export interface IRequest {
  config: string;
}
