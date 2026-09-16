/**
 * Optional Jalali UI powered by `react-persian-range-picker` (PR-128).
 * Peer dependency — not bundled into `.`.
 *
 * @example
 * ```tsx
 * import { PersianRangeDatePicker } from 'persian-data-grid/date-picker-jalali';
 * <DataGrid components={{ date: PersianRangeDatePicker }} />
 * ```
 */

import React from 'react';
import { DatePicker as PersianDatePicker } from 'react-persian-range-picker';

import { useLocale, useERPTableTheme } from '../host';

type Props = {
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  className?: string;
  showMask?: boolean;
};

export function PersianRangeDatePicker({
  value,
  onChange,
  disabled,
  className,
  showMask = true,
}: Props) {
  const locale = useLocale();
  const theme = useERPTableTheme();
  const parsed =
    value == null || value === ''
      ? null
      : typeof value === 'number'
        ? value
        : String(value);

  return (
    <div className={`erp-table-date ${className ?? ''}`}>
      <PersianDatePicker
        calendarType={locale === 'fa' ? 'jalali' : 'gregorian'}
        exportType="timeStamp"
        showMask={showMask && !disabled}
        allowClear
        disabled={disabled}
        value={parsed}
        onChange={(next) => {
          onChange?.(next == null ? '' : next);
        }}
        primaryColor={theme.params.accentColor}
        highlightColor={theme.params.rowStripeColor}
        isTodaySelectPreset={false}
      />
    </div>
  );
}

export default PersianRangeDatePicker;
