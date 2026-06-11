import type { IBaseDto } from '@services/base/type';

export interface IAssignmentCheck extends IBaseDto {
    CheckAssignmentHeaderId: string
}

export interface IRequest {
    config: string;
}
