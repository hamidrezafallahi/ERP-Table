import { DatePicker, type DatePickerValue } from 'react-persian-range-picker';

type Props = {
  value: unknown;
  onCommit: (isoOrEmpty: string) => void;
};

/** Jalali DatePicker with keyboard mask for the demo date column. */
export function DemoDateCell({ value, onCommit }: Props) {
  const parsed: DatePickerValue =
    value == null || value === ''
      ? null
      : typeof value === 'number'
        ? value
        : String(value);

  return (
    <DatePicker
      calendarType="jalali"
      exportType="IsoString"
      showMask
      allowClear
      value={parsed}
      onChange={(next) => {
        onCommit(next == null ? '' : String(next).slice(0, 10));
      }}
      primaryColor="#1a6b55"
      highlightColor="#e8f5f0"
    />
  );
}
