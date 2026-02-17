import type { IBaseDto } from "@services/base/type";

export interface IProductCategory extends IBaseDto {
  FatherId?: number;
  GoodsCategoryDesc: string;
  GoodsCategoryId: number;
  SubCategories?: IProductCategory[];
}

export interface IRequest {
  config?: string;
}
