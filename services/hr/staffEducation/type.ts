import type { IBaseDto } from '@services/base/type';

export interface IStaffEducation extends IBaseDto {
  StaffEducationId?: number;
  PersonId?: number;
  LevelId?: number;
  FieldId?: number;
  SchoolId?: number;
  DegreeNeedId?: number;
  StartDate?: string;
  EndDate?: string;
  Average?: number;
  CountryId?: number;
  GraduationDate?: string;
  EffectiveDate?: string;
  IsStudent?: boolean;
  EducationVerified?: boolean;
  IsDegreeRecorded?: boolean;
  EducationExemptionApplied?: boolean;
  Description?: string;
}

export interface IRequest {
  config: string;
}
