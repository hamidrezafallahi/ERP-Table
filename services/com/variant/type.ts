import type { IBaseDto } from "@services/base/type";

export interface IVariant extends IBaseDto {
  VariantId: number;
  VariantDesc: string;
  Title: string;
  CommonTypeId: number;
  PlaceId: number;
  CreateDate: string;
  GoodsVariants: IVariant[];
}

export interface IDetailVariant {
  CommonId: number;
  CommonInfoId: number;
  CommonDesc: string;
  IsChecked: boolean;
}

export interface IRequest {
  config: string;
}
