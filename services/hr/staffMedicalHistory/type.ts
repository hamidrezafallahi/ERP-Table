import type { IBaseDto } from '@services/base/type';

export interface  IStaffMedicalHistory extends IBaseDto {
  StaffMedicalId:number,
  StaffId:number,
  StartDate: string,
  EndDate: string,
  PersonId:number,
  IllnessId:number,

}

export interface IRequest {
  config: string;
}
