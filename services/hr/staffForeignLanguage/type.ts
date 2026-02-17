import type { IBaseDto } from '@services/base/type';

export interface IStaffForeignLanguage extends IBaseDto {
  StaffLanguageId: number;
  StaffId: number;
  PersonId: number;
  LanguageId: number;
  DominanceId: number;
  Score: number;
}

export interface IRequest {
  config: string;
}
