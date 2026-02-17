import type { IBaseDto } from '@services/base/type';

export interface ITransfer extends IBaseDto {}

export interface IRequest {
  config: string;
}
