"use client";

import React, { useMemo, useState } from 'react';

import {
  JALALI_WEEKDAY_LABELS_FA,
  addJalaliMonths,
  buildJalaliMonthGrid,
  compareJalaliDay,
  isDateInRange,
  jalaliMonthName,
  sameJalaliDay,
  toJalaliYmd,
  type DateRangeValue,
} from '../../infrastructure/date/jalaliCalendarModel';
import { isIranHoliday } from '../../infrastructure/finance/holidays';
import { useERPTableTheme, useTranslations } from '../host';

export type JalaliCalendarProps = {
  mode?: 'single' | 'range';
  value?: Date | null;
  range?: DateRangeValue;
  onSelect?: (date: Date) => void;
  onRangeChange?: (range: DateRangeValue) => void;
  showHolidays?: boolean;
  className?: string;
};

/**
 * Internal Jalali month calendar — no external peer (PR-140).
 */
export function JalaliCalendar({
  mode = 'single',
  value = null,
  range,
  onSelect,
  onRangeChange,
  showHolidays = true,
  className,
}: JalaliCalendarProps) {
  const theme = useERPTableTheme();
  const t = useTranslations();
  const seed = value ?? range?.start ?? range?.end ?? new Date();
  const seedYmd = toJalaliYmd(seed);
  const [view, setView] = useState({ jy: seedYmd.jy, jm: seedYmd.jm });
  const [draftStart, setDraftStart] = useState<Date | null>(
    range?.start ?? null,
  );

  const cells = useMemo(
    () => buildJalaliMonthGrid(view.jy, view.jm),
    [view.jy, view.jm],
  );

  const effectiveRange: DateRangeValue =
    mode === 'range'
      ? {
          start: range?.start ?? draftStart,
          end: range?.end ?? null,
        }
      : { start: value, end: value };

  const go = (delta: number) => {
    setView((v) => addJalaliMonths(v.jy, v.jm, delta));
  };

  const handleDayClick = (date: Date) => {
    if (mode === 'single') {
      onSelect?.(date);
      return;
    }
    if (!draftStart || (range?.start && range?.end)) {
      setDraftStart(date);
      onRangeChange?.({ start: date, end: null });
      return;
    }
    const start = draftStart;
    const ordered =
      compareJalaliDay(start, date) <= 0
        ? { start, end: date }
        : { start: date, end: start };
    setDraftStart(null);
    onRangeChange?.(ordered);
  };

  return (
    <div
      className={`pdg-jalali-cal ${className ?? ''}`}
      dir="rtl"
      role="group"
      aria-label={t('date.calendar')}
    >
      <div className="pdg-jalali-cal__header">
        <button
          type="button"
          className="pdg-jalali-cal__nav"
          aria-label={t('date.nextMonth')}
          onClick={() => go(1)}
        >
          ‹
        </button>
        <span className="pdg-jalali-cal__title">
          {jalaliMonthName(view.jm)} {view.jy}
        </span>
        <button
          type="button"
          className="pdg-jalali-cal__nav"
          aria-label={t('date.prevMonth')}
          onClick={() => go(-1)}
        >
          ›
        </button>
      </div>
      <div className="pdg-jalali-cal__weekdays" aria-hidden>
        {JALALI_WEEKDAY_LABELS_FA.map((d) => (
          <span key={d} className="pdg-jalali-cal__wd">
            {d}
          </span>
        ))}
      </div>
      <div className="pdg-jalali-cal__grid" role="grid">
        {cells.map((cell) => {
          const selected =
            mode === 'single'
              ? value != null && sameJalaliDay(cell.date, value)
              : Boolean(
                  effectiveRange.start &&
                    sameJalaliDay(cell.date, effectiveRange.start),
                ) ||
                Boolean(
                  effectiveRange.end &&
                    sameJalaliDay(cell.date, effectiveRange.end),
                );
          const inRange =
            mode === 'range' && isDateInRange(cell.date, effectiveRange);
          const holiday = showHolidays && isIranHoliday(cell.date);
          const today = sameJalaliDay(cell.date, new Date());

          return (
            <button
              key={`${cell.ymd.jy}-${cell.ymd.jm}-${cell.ymd.jd}`}
              type="button"
              role="gridcell"
              className={[
                'pdg-jalali-cal__day',
                cell.inCurrentMonth ? '' : 'is-outside',
                selected ? 'is-selected' : '',
                inRange ? 'is-in-range' : '',
                holiday ? 'is-holiday' : '',
                today ? 'is-today' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleDayClick(cell.date)}
              style={
                selected
                  ? {
                      background: theme.params.accentColor,
                      color: 'var(--pdg-bg)',
                    }
                  : inRange
                    ? { background: theme.params.rowStripeColor }
                    : undefined
              }
            >
              {cell.ymd.jd}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default JalaliCalendar;
