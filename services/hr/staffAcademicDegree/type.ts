import type { IBaseDto } from '@services/base/type';

export interface  IStaffAcademicDegree extends IBaseDto {
  StaffEducationId:number,
  StaffId:number,
  PersonId:number,
  SchoolId:number,
  StartDate: string,
  EndDate: string,
  FieldId:number,
  LevelId:number,

}

export interface IRequest {
  config: string;
}
