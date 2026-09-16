"use client";

import React, { useEffect, useState } from 'react';

import type { DateAdapter } from '../../application/ports/DateAdapter';
import { useDateAdapter, useERPTableTheme } from '../host';

type Props = {
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  className?: string;
  showMask?: boolean;
  /** Optional override; defaults to host `dateAdapter`. */
  adapter?: DateAdapter;
};

/**
 * Default date editor (PR-128). Works without `react-persian-range-picker`.
 * Uses the host {@link DateAdapter} for parse/format.
 */
export function NewDatePicker({
  value,
  onChange,
  disabled,
  className,
  adapter: adapterProp,
}: Props) {
  const hostAdapter = useDateAdapter();
  const adapter = adapterProp ?? hostAdapter;
  const theme = useERPTableTheme();
  const parsed = adapter.parse(value);
  const [text, setText] = useState(() =>
    parsed ? adapter.format(parsed) : '',
  );

  useEffect(() => {
    const next = adapter.parse(value);
    setText(next ? adapter.format(next) : '');
  }, [value, adapter]);

  const commit = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      onChange?.('');
      setText('');
      return;
    }
    const date = adapter.parse(trimmed);
    if (!date) {
      setText(parsed ? adapter.format(parsed) : '');
      return;
    }
    setText(adapter.format(date));
    onChange?.(date.getTime());
  };

  if (adapter.id === 'gregory') {
    const iso = parsed ? adapter.format(parsed) : '';
    return (
      <div className={`erp-table-date ${className ?? ''}`}>
        <input
          type="date"
          className="pdg-cell-editor bg-transparent px-2 w-full h-full text-xs"
          disabled={disabled}
          value={iso}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) {
              onChange?.('');
              return;
            }
            const date = adapter.parse(v);
            onChange?.(date ? date.getTime() : '');
          }}
          style={{ accentColor: theme.params.accentColor }}
        />
      </div>
    );
  }

  return (
    <div className={`erp-table-date ${className ?? ''}`}>
      <input
        type="text"
        inputMode="numeric"
        className="pdg-cell-editor bg-transparent px-2 w-full h-full text-xs"
        disabled={disabled}
        value={text}
        placeholder="1404/01/01"
        onChange={(e) => setText(e.target.value)}
        onBlur={() => commit(text)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit(text);
          }
        }}
      />
    </div>
  );
}
