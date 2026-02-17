import { IDate } from 'react-persian-range-picker';

import type { IBaseDto } from '@services/base/type';

export interface ICalendar extends IBaseDto {
  CalendarId: number;
  CalendarDesc: string;
  StartTime: string;
  EndTime: string;
  StartDayWeek: number;
  Sat: boolean;
  Sun: boolean;
  Mon: boolean;
  Tue: boolean;
  Wed: boolean;
  Thu: boolean;
  Fri: boolean;
  CalendarExceptions: [];
  StartWeekDay: string;
  StartAndEndDate: string;
  WorkDays: string;
  CalendarName: string;
}

export interface IRequest {
  config: string;
}
export interface IExceptionCalendar {
  CalendarExceptionId: number
  CalendarId: number
  Date: string|IDate
  EndTime: string
  IsHoliday: boolean
  StartTime: string
}