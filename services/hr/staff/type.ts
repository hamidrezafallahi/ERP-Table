import type { IBaseDto } from '@services/base/type';

export interface IStaff extends IBaseDto {
  StaffId: number;
  ReligionId: number;
  FaithId: number;
  StaffInssuranceNumber: string;
  MilitaryStatId: number;
  MilitaryEndDate: string;
  MilitaryStartDate: string;
  MilitaryPlaceId: number;
  Staff: {
    FullName: string;
    CreateDate: string;
    GetEntityId: number;
  };
}

export interface IRequest {
  config: string;
}
