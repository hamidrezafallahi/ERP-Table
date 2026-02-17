import type { IBaseDto } from '@services/base/type';

export interface IStaffWorkHistory extends IBaseDto {
  // شناسه سابقه کاری
  StaffWorkHistoryId?: number;

  // شماره ابلاغ
  NotificationNumber?: string;
  // تاریخ ابلاغ
  NotificationDate?: string;

  // نوع استخدام
  EmploymentTypeId?: number;
  // نام شرکت
  CompanyName?: string;
  // آیا شرکت خصوصی است
  IsPrivateCompany?: boolean;
  // آیا غیرسازمانی است
  IsNonOrganizational?: boolean;

  // آخرین سمت
  LastPosition?: string;
  // آخرین حقوق
  LastSalary?: number;

  // بازه زمانی
  FromDate?: string;
  ToDate?: string;

  // مورد قبول / سنوات
  AcceptedYears?: number;
  AcceptedMonths?: number;
  AcceptedDays?: number;
  // استقرار سنوات
  SeniorityEstablishment?: boolean;

  // جمع سابقه محاسبه‌شده
  TotalYears?: number;
  TotalMonths?: number;
  TotalDays?: number;

  // ترک کار
  LeaveReason?: string;
}

export interface IRequest {
  config: string;
}
