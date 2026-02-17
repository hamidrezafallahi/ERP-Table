import type { IBaseDto } from '@services/base/type';

export interface IInventoryType extends IBaseDto {
  InventoryDesc: string;
  InventoryId: number;
  Rate: number;
}
export interface IRequest {
  config: string;
}
