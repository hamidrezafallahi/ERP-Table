import type { IBaseDto } from '@services/base/type';
import { IPerson } from '@services/com/person/type';

export interface IUser extends IBaseDto {
  UserId:number,
Person:IPerson,
}

export interface IRequest {
  config: string;
}
