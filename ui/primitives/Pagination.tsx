"use client";

import React from 'react';

import { LeftChevron, RightChevron } from './icons';
import { CustomButton } from './chrome';

type Props = {
  current: number;
  pageSize: number;
  total: number;
  onChange?: (page: number) => void;
  onShowSizeChange?: (page: number, pageSize: number) => void;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
  showTotal?: (total: number) => React.ReactNode;
  prevIcon?: React.ReactNode;
  nextIcon?: React.ReactNode;
  jumpNextIcon?: React.ReactNode;
  jumpPrevIcon?: React.ReactNode;
  locale?: { items_per_page?: string };
  showTitle?: boolean;
  className?: string;
  direction?: 'rtl' | 'ltr';
};

export function Pagination({
  current,
  pageSize,
  total,
  onChange,
  onShowSizeChange,
  pageSizeOptions = ['10', '20', '50', '100'],
  showSizeChanger,
  showTotal,
  prevIcon,
  nextIcon,
  className,
  direction = 'rtl',
}: Props) {
  const options = pageSizeOptions.includes(String(pageSize))
    ? pageSizeOptions
    : [String(pageSize), ...pageSizeOptions];
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const pages: Array<number | 'gap'> = [];
  for (let i = 1; i <= totalPages; i += 1) {
    if (totalPages <= 7 || i === 1 || i === totalPages || Math.abs(i - current) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'gap') {
      pages.push('gap');
    }
  }

  return (
    <div className={`erp-table-pagination ${className ?? ''}`}>
      {showTotal ? showTotal(total) : null}
      <div className="erp-table-pagination__pages">
        <button
          type="button"
          className="erp-table-pagination__nav"
          disabled={current <= 1}
          onClick={() => onChange?.(current - 1)}
        >
          {prevIcon ??
            (direction === 'rtl' ? <RightChevron config={{ width: 14, height: 14 }} /> : <LeftChevron config={{ width: 14, height: 14 }} />)}
        </button>
        {pages.map((p, i) =>
          p === 'gap' ? (
            <span key={`g-${i}`}>...</span>
          ) : (
            <button
              key={p}
              type="button"
              className={`erp-table-pagination__page ${p === current ? 'is-active' : ''}`}
              onClick={() => onChange?.(p)}
            >
              {p.toLocaleString(direction === 'rtl' ? 'fa-IR' : 'en-US')}
            </button>
          ),
        )}
        <button
          type="button"
          className="erp-table-pagination__nav"
          disabled={current >= totalPages}
          onClick={() => onChange?.(current + 1)}
        >
          {nextIcon ??
            (direction === 'rtl' ? <LeftChevron config={{ width: 14, height: 14 }} /> : <RightChevron config={{ width: 14, height: 14 }} />)}
        </button>
      </div>
      {showSizeChanger ? (
        <select
          value={String(pageSize)}
          onChange={(e) => onShowSizeChange?.(1, Number(e.target.value))}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {Number(opt).toLocaleString(direction === 'rtl' ? 'fa-IR' : 'en-US')}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}

export { CustomButton };
