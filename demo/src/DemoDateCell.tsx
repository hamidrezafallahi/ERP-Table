import {
  PersianRangeDatePicker,
} from '../../publish/date-picker-jalali';

type Props = {
  value: unknown;
  onCommit: (isoOrEmpty: string) => void;
};

/** Jalali date cell for the demo — internal picker (PR-140). */
export function DemoDateCell({ value, onCommit }: Props) {
  return (
    <PersianRangeDatePicker
      value={value}
      onChange={(next) => {
        if (next == null || next === '') {
          onCommit('');
          return;
        }
        if (typeof next === 'number') {
          onCommit(new Date(next).toISOString().slice(0, 10));
          return;
        }
        onCommit(String(next).slice(0, 10));
      }}
    />
  );
}
