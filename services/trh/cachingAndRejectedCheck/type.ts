import type { IBaseDto } from '@services/base/type';

export interface ICachingAndRejectedCheck extends IBaseDto {
    headerId: string
}

export interface IRequest {
    config: string;
}
