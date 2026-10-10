"use client";

import React from 'react';
import { DatePicker, type DatePickerValue } from 'react-persian-range-picker';

import type { DateAdapter } from '../../application/ports/DateAdapter';
import { useDateAdapter, useERPTableTheme } from '../host';

type Props = {
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  className?: string;
  showMask?: boolean;
  /** Optional override; defaults to host `dateAdapter` (decides jalali / gregorian). */
  adapter?: DateAdapter;
};

/** Dark surfaces get the same muted highlight the arianERP host passes. */
function isDarkBackground(color: string): boolean {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim())?.[1];
  if (!hex) return false;
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

/**
 * Date cell editor. Renders `DatePicker` from `react-persian-range-picker`
 * (required peer dependency) — the same component the arianERP host uses.
 * Calendar type follows the host {@link DateAdapter}: `jalali` for the
 * default `fa` locale, `gregorian` otherwise.
 *
 * Value contract (unchanged): timestamp in ms in, timestamp in ms (or
 * `null` when cleared) out.
 */
export function NewDatePicker({
  value,
  onChange,
  disabled,
  className,
  showMask,
  adapter: adapterProp,
}: Props) {
  const hostAdapter = useDateAdapter();
  const adapter = adapterProp ?? hostAdapter;
  const theme = useERPTableTheme();
  const dark = isDarkBackground(theme.params.backgroundColor);

  return (
    <DatePicker
      value={
        typeof value === 'number' || typeof value === 'string'
          ? (value as DatePickerValue)
          : null
      }
      onChange={(next) => onChange?.(next)}
      className={`pdg-date-picker ${disabled ? 'is-disabled' : ''} ${className ?? ''}`}
      Style={{ width: '100%' }}
      showMask={showMask}
      disabled={disabled}
      isTodaySelectPreset={false}
      highlightColor={dark ? '#676767' : undefined}
      calendarType={adapter.id === 'gregory' ? 'gregorian' : 'jalali'}
    />
  );
}
