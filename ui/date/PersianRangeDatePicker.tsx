/**
 * Internal Jalali date / range picker (PR-140).
 * Zero external calendar dependencies — uses `infrastructure/date` math.
 *
 * @example
 * ```tsx
 * import { PersianRangeDateCell } from 'persian-data-grid/date-picker-jalali';
 * <DataGrid components={{ date: PersianRangeDateCell }} />
 * ```
 */

"use client";

import React, { useEffect, useId, useRef, useState } from 'react';

import { jalaliAdapter } from '../../infrastructure/date/jalaliAdapter';
import type { DateRangeValue } from '../../infrastructure/date/jalaliCalendarModel';
import type { CellRenderContext } from '../cellRenderer/cellRenderContext';
import { useDateAdapter, useERPTableTheme, useTranslations } from '../host';
import { JalaliCalendar } from './JalaliCalendar';

type SingleProps = {
  mode?: 'single';
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  className?: string;
  showMask?: boolean;
  showHolidays?: boolean;
};

type RangeProps = {
  mode: 'range';
  range?: DateRangeValue;
  onRangeChange?: (range: DateRangeValue) => void;
  disabled?: boolean;
  className?: string;
  showHolidays?: boolean;
};

export type PersianRangeDatePickerProps = SingleProps | RangeProps;

function parseValue(
  value: unknown,
  adapter: typeof jalaliAdapter,
): Date | null {
  return adapter.parse(value);
}

/**
 * Cell editor (single) or standalone range picker.
 */
export function PersianRangeDatePicker(props: PersianRangeDatePickerProps) {
  const theme = useERPTableTheme();
  const t = useTranslations();
  const hostAdapter = useDateAdapter();
  const adapter =
    hostAdapter.id === 'jalali' ? hostAdapter : jalaliAdapter;
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const isRange = props.mode === 'range';

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (isRange) {
    const range = props.range ?? { start: null, end: null };
    const label =
      range.start && range.end
        ? `${adapter.format(range.start)} – ${adapter.format(range.end)}`
        : range.start
          ? `${adapter.format(range.start)} – …`
          : t('date.pickRange');

    return (
      <div
        ref={rootRef}
        className={`erp-table-date pdg-date-range ${props.className ?? ''}`}
      >
        <button
          type="button"
          className="pdg-cell-editor pdg-date-range__trigger"
          disabled={props.disabled}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          style={{ accentColor: theme.params.accentColor }}
        >
          {label}
        </button>
        {open && !props.disabled ? (
          <div id={panelId} className="pdg-date-range__popover" role="dialog">
            <JalaliCalendar
              mode="range"
              range={range}
              showHolidays={props.showHolidays !== false}
              onRangeChange={(next) => {
                props.onRangeChange?.(next);
                if (next.start && next.end) setOpen(false);
              }}
            />
          </div>
        ) : null}
      </div>
    );
  }

  const value = props.value;
  const onChange = props.onChange;
  const disabled = props.disabled;
  const parsed = parseValue(value, adapter);
  const text = parsed ? adapter.format(parsed) : '';

  return (
    <div
      ref={rootRef}
      className={`erp-table-date pdg-date-range ${props.className ?? ''}`}
    >
      <button
        type="button"
        className="pdg-cell-editor pdg-date-range__trigger"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        style={{ accentColor: theme.params.accentColor }}
      >
        {text || t('date.pickDate')}
      </button>
      {open && !disabled ? (
        <div id={panelId} className="pdg-date-range__popover" role="dialog">
          <JalaliCalendar
            mode="single"
            value={parsed}
            showHolidays={props.showHolidays !== false}
            onSelect={(date) => {
              onChange?.(date.getTime());
              setOpen(false);
            }}
          />
          <div className="pdg-date-range__actions">
            <button
              type="button"
              className="pdg-date-range__clear"
              onClick={() => {
                onChange?.('');
                setOpen(false);
              }}
            >
              {t('date.clear')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** `components.date` adapter — receives {@link CellRenderContext}. */
export function PersianRangeDateCell(ctx: CellRenderContext) {
  const raw = ctx.value;
  const value =
    raw == null || raw === ''
      ? undefined
      : typeof raw === 'number'
        ? raw
        : new Date(raw as string).valueOf();

  return (
    <PersianRangeDatePicker
      className={ctx.meta.className}
      disabled={ctx.isDeleted || !ctx.isEditable}
      value={value}
      onChange={(v) => ctx.dispatchChangeValue(v)}
    />
  );
}

export { JalaliCalendar } from './JalaliCalendar';
export type { JalaliCalendarProps } from './JalaliCalendar';
export type { DateRangeValue } from '../../infrastructure/date/jalaliCalendarModel';

export default PersianRangeDatePicker;
