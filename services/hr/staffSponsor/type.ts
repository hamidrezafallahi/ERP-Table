import type { IBaseDto } from '@services/base/type';

export interface IStaffSponsor extends IBaseDto {
  // شناسه اسپانسر
  SponsorId?: number;

  // شناسه پرسنل
  StaffId?: number;

  // شناسه محل تولد
  BirthLocationId?: number;

  // شناسه محل صدور
  ExportLocationId?: number;

  // شناسه وضعیت تاهل
  MarriageStatId?: number;

  // شناسه نوع رابطه
  RelationTypeId?: number;

  // نام کوچک اسپانسر
  SponsorFName?: string;

  // نام خانوادگی اسپانسر
  SponsorLName?: string;

  // جنسیت اسپانسر (کد)
  SponsorSex?: number;

  // تاریخ تولد اسپانسر (رشته ISO)
  SponsorshipBirthDate?: string;

  // شماره هویت / شناسنامه
  SponsorIdentityNumber?: string;

  // وضعیت اشتغال اسپانسر
  SponsorshipWorkingStat?: boolean;

  // توضیحات اضافی
  XtraDesc?: string;

  // کد ملیت
  NationalityCode?: string;

  // نام پدر
  FatherName?: string;

  // شناسه محل
  PlaceId?: number;

  // شناسه پرونده
  FileId?: number;

  // شناسه نوع اسپانسر
  SponsorTypeId?: number;
}

export interface IRequest {
  config: string;
}
