import type { IBaseDto } from "@services/base/type";

export interface IGood extends IBaseDto {
  GoodsId: number;
  GoodsCode: number;
  GoodsDesc: string;
  GoodsCategoryId: number;
  MeasureUnitId: number;
  CreateDate: string;
  HasVariantDesc: string;
  HasVariant: boolean;
  GoodsCategory: {
    GoodsCategoryDesc: string;
  };
  GoodsBarcodes: [];
  GoodsBundles: [];
  GoodsAlternates: [];
  GoodsVariants?: [];
  Price: number;
  MeasureUnit: {
    MeasureUnitId: number;
    MeasureUnitDesc: string;
    Factor: number;
    PlaceId: number;
    CreateDate: string;
  };
  GoodsExtraInfoGoods: [];
  IsRawMaterials: boolean;
  IsProduct: boolean;
  IsSemiFinishedProduct: boolean;
  IsTools: boolean;
  IsSaleable: boolean;
  IsHasBatchNo: boolean;
  IsLocationable: boolean;
  IsAutomaticallyBatch: boolean;
  IsHasExpireDate: boolean;
  AutomaticallyBatchPattern: string;
  StockExitPolicy: number;
  HasInputQuality: boolean;
  IsSerilizeable: boolean;
  IsReversible: boolean;
  IsConsumable: boolean;
  HasMultipleOwner: boolean;
  OrderPoint: number;
  OrderAmount: number;
  IsService: boolean;
  MoadianCode: string;
}

export interface IRequest {
  config: string;
}
