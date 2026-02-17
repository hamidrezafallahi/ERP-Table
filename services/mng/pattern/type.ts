import type { IBaseDto } from "@services/base/type";

export interface IPatternItem {
  key: number;
  PatternItemId?: number;
  PatternObjectId?: number;
  PatternObjectDesc?: string;
  PatternObject?: {
    Desc: string;
  };
  Text?: string;
  Separator: string;
  Order: number;
}

export interface IPattern extends IBaseDto {
  PatternId: number;
  PatternDesc: string;
  StartNumber: number;
  EndNumber: number;
  InActive: boolean;
  ResetYear: boolean;
  IndicatorCount: number;
  IndicatorStartNo: number;
  PatternItem: IPatternItem[];
}

export interface IRequest {
  config: string;
}
