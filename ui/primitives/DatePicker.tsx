"use client";

import React from 'react';
import { DatePicker as PersianDatePicker } from 'react-persian-range-picker';

import { useLocale } from '../host';

type Props = {
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  className?: string;
  showMask?: boolean;
};

export function NewDatePicker({
  value,
  onChange,
  disabled,
  className,
  showMask = true,
}: Props) {
  const locale = useLocale();
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
        value={parsed as any}
        onChange={(next) => {
          onChange?.(next == null ? '' : next);
        }}
        primaryColor="#0e0e0e"
        highlightColor="#ddecfd"
        isTodaySelectPreset={false}
      />
    </div>
  );
}
