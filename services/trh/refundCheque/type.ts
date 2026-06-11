import type { IBaseDto } from '@services/base/type';

export interface IRefundCheque extends IBaseDto {
    checkReversalHeaderId: string
}

export interface IRequest {
    config: string;
}
