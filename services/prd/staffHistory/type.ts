import type { IBaseDto } from '@services/base/type';

export interface IStaffHistory extends IBaseDto {
  YearPlanId: number;
  DocId: number;
  FinalNumber: string;
  Year: number;
  Verson: number;
  CreateUserId: number;
  Date: string;             // یا می‌تونی Date بزاری اگر تبدیلش می‌کنی
  CreateDate: string;       // یا Date
  ModifierUserId: number;
  ModifyDate: string;       // یا Date
  PlaceId: number;
  ManagmentAccountId: number;        
  }

export interface IRequest {
  config: string;
}

