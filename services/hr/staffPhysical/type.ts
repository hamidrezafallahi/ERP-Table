import type { IBaseDto } from '@services/base/type';

export interface  IStaffPhysical extends IBaseDto {
  StaffPhysicalId:number,
  StaffId:number,
  PersonId:number,
  Height:number,
  Weight:number,
  BloodGroupId:number

}

export interface IRequest {
  config: string;
}
