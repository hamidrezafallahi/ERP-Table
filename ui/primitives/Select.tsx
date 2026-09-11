"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useThemePortalStyle } from '../host';

export type SelectOption = {
  value?: string | number;
  label?: React.ReactNode;
  title?: string;
  option?: any;
  [key: string]: unknown;
};

type Props = {
  className?: string;
  value?: unknown;
  disabled?: boolean;
  loading?: boolean;
  showSearch?: boolean;
  allowClear?: boolean;
  placeholder?: React.ReactNode;
  options?: SelectOption[];
  filterOption?: (input: string, option: any) => boolean;
  onChange?: (value: unknown, option?: unknown) => void;
  onClick?: () => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onPopupScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  popupMatchSelectWidth?: number | boolean;
  popupRender?: (menu: React.ReactNode) => React.ReactNode;
  autoFocus?: boolean;
  optionRender?: (originNode: any, info?: any) => React.ReactNode;
  notFoundContent?: React.ReactNode;
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
  optionFilterProp?: string;
  labelInValue?: boolean;
};

export function Select({
  className,
  value,
  disabled,
  loading,
  showSearch,
  allowClear = true,
  placeholder,
  options = [],
  filterOption,
  onChange,
  onClick,
  onSearch,
  onClear,
  onPopupScroll,
  popupMatchSelectWidth,
  popupRender,
  autoFocus,
  optionRender,
  notFoundContent,
  getPopupContainer,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0, width: 180 });
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuStyle = useThemePortalStyle({
    position: 'fixed',
    top: pos.top,
    left: pos.left,
    width: pos.width,
    minWidth: pos.width,
  });

  const selected = options.find((o) => String(o.value) === String(value));

  const filtered = useMemo(() => {
    if (!query) return options;
    return options.filter((option) => {
      if (typeof filterOption === 'function') {
        return filterOption(query, option);
      }
      const label = option.label;
      return typeof label === 'string' && label.toLowerCase().includes(query.toLowerCase());
    });
  }, [options, query, filterOption]);

  useEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const width =
      typeof popupMatchSelectWidth === 'number' ? popupMatchSelectWidth : rect.width;
    setPos({ top: rect.bottom + 2, left: rect.left, width });
    if (autoFocus || showSearch) searchRef.current?.focus();
  }, [open, popupMatchSelectWidth, autoFocus, showSearch]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const menu = (
    <div
      className="erp-table-select__menu"
      style={menuStyle}
      onScroll={onPopupScroll}
    >
      {showSearch ? (
        <input
          ref={searchRef}
          className="erp-table-select__search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch?.(e.target.value);
          }}
        />
      ) : null}
      {loading ? (
        <div className="erp-table-select__option">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="erp-table-select__option">{notFoundContent ?? 'No options found'}</div>
      ) : (
        filtered.map((option) => (
          <div
            key={String(option.value)}
            className={`erp-table-select__option ${
              String(option.value) === String(value) ? 'is-active' : ''
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              onChange?.(option.value, option);
              setOpen(false);
              setQuery('');
            }}
          >
            {optionRender
              ? optionRender({ data: option }, { data: option })
              : (option.title ?? option.label)}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div ref={rootRef} className={`erp-table-select ${className ?? ''}`}>
      <button
        type="button"
        disabled={disabled}
        className={`erp-table-select__control ${disabled ? 'is-disabled' : ''}`}
        onClick={() => {
          onClick?.();
          if (!disabled) setOpen((v) => !v);
        }}
      >
        <span className="truncate">
          {selected ? (selected.title ?? selected.label) : placeholder}
        </span>
        {allowClear && value != null && value !== '' ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(undefined, undefined);
              onClear?.();
            }}
          >
            ×
          </span>
        ) : (
          <span>▾</span>
        )}
      </button>
      {open && typeof document !== 'undefined'
        ? createPortal(popupRender ? popupRender(menu) : menu, getPopupContainer?.(rootRef.current!) ?? document.body)
        : null}
    </div>
  );
}
