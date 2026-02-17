import type { IDetail } from '@services/generalType/type';

export interface IInventoryVoucherDetail extends IDetail {
  VoucherDetailId: number;
  VoucherHeaderId: number;
  RowNum: number;
  GoodsId: number;
  BatchId: number;
  Unit1Id: number;
  Quantity1: number;
  Unit2Id?: number;
  Quantity2?: number;
  Unit3Id?: number;
  Quantity3?: number;
  FinalUnitId: number;
  FinalAffectiveQuantity: number;
  Fee: number;
  RowAmount: number;
  PlaceId: number;
  CreateDate: string;
  CreateUserId: number;
  ModifierUserId: number;
  ManagmentAccountId: string;
  HasLocation: boolean;
  StockLocation: any;
  HasBach: boolean;
  LocationId: number;
  Batch: {
    BachId: number;
    BachNumber: string;
    VoucherDetails: any[];
    GetEntityId: number;
    IsSystem: boolean;
    DisablePending: boolean;
    ExpireDate: string;
  };
  InventoryLocation: {
    StockLocationId: number;
    StockLocationDesc: string;
    GetEntityId: number;
    DisablePending: boolean;
  };
  Goods: {
    GoodsId: number;
    GoodsDesc: string;
    GetEntityId: number;
    IsSystem: boolean;
    DisablePending: boolean;
  };
}
export interface IRequest {
  config: string;
}
