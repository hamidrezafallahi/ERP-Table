import type { IBaseDto } from '@services/base/type';

export interface IProject extends IBaseDto {
  ProjectCode: string;

  ProjectDesc: string;
  ProjectFatherId: number;
  ProjectId: number;
}

export interface IRequest {
  config: string;
}
