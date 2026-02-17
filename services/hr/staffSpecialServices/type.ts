import type { IBaseDto } from '@services/base/type';

export interface IStaffSpecialServices extends IBaseDto {
  StaffSpecialServiceId?: number;
  ServiceTypeId?: string;
  StartDate?: string;
  EndDate?: string;
  ConfirmationNumber?: string;
  ConfirmationDate?: string;
  ConfirmingAuthority?: string;
  DurationInMonths?: number;
  LocationOfOccurrence?: string;
  DisabilityPercentage?: number;
  SacrificeScore?: number;
  SacrificeDate?: string;
  Score?: number;
}

export interface IRequest {
  config: string;
}
