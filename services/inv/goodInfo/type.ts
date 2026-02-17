import type { IBaseDto } from "@services/base/type";
import { IGoodQc } from "@services/com/goodQc/type";

export interface IGoodInfo extends IBaseDto {
  GoodsId: number;
  GoodsDesc: string;
  IsHasBatchNo: boolean;
  HasInputQuality: boolean;
  MeasureUnitId: number;
  IsSerilizeable: boolean;
  Parameters: IGoodQc[];
}

export interface IRequest {
  config: string;
}
