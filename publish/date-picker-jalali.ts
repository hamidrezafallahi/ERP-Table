/**
 * Internal Jalali date / range picker (PR-140).
 * No peer dependency — calendar is built on `infrastructure/date` math.
 */
export {
  PersianRangeDatePicker,
  PersianRangeDateCell,
  JalaliCalendar,
} from '../ui/date/PersianRangeDatePicker';
export type {
  PersianRangeDatePickerProps,
  JalaliCalendarProps,
  DateRangeValue,
} from '../ui/date/PersianRangeDatePicker';
export { PersianRangeDatePicker as default } from '../ui/date/PersianRangeDatePicker';
