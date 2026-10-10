"use client";

import React, { Suspense, lazy } from 'react';

/**
 * Public Select. The implementation and its antd-derived stylesheet are a lazy
 * chunk (`SelectImpl`) so they stay out of the main bundle budget.
 */
export type SelectOption = {
  value?: string | number;
  label?: React.ReactNode;
  title?: string;
  option?: unknown;
  disabled?: boolean;
  [key: string]: unknown;
};

export type SelectProps = {
  className?: string;
  style?: React.CSSProperties;
  value?: unknown;
  disabled?: boolean;
  loading?: boolean;
  showSearch?: boolean;
  allowClear?: boolean;
  placeholder?: React.ReactNode;
  options?: SelectOption[];
  size?: 'small' | 'middle' | 'large';
  status?: 'error' | 'warning';
  filterOption?: (input: string, option: SelectOption) => boolean;
  onChange?: (value: unknown, option?: unknown) => void;
  onClick?: () => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onPopupScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  popupMatchSelectWidth?: number | boolean;
  popupRender?: (menu: React.ReactNode) => React.ReactNode;
  autoFocus?: boolean;
  optionRender?: (
    originNode: { data: SelectOption },
    info?: { data: SelectOption },
  ) => React.ReactNode;
  notFoundContent?: React.ReactNode;
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
  optionFilterProp?: string;
  labelInValue?: boolean;
  /** Windowed option list (antd default: on; only kicks in when options overflow `listHeight`). */
  virtual?: boolean;
  listHeight?: number;
  listItemHeight?: number;
};


const SelectImpl = lazy(() => import('./SelectImpl'));

export function Select(props: SelectProps) {
  return (
    <Suspense
      fallback={
        <div
          className={props.className}
          style={{ display: 'inline-flex', minHeight: 32, minWidth: 64, ...props.style }}
          aria-busy="true"
        />
      }
    >
      <SelectImpl {...props} />
    </Suspense>
  );
}
