"use client";

import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { SelectOption, SelectProps } from './Select';
import { ANT_SELECT_CSS } from './selectCss';

/**
 * Dependency-free single-select that reproduces antd 5's `Select` DOM and
 * class names (`ant-select-*`). The look comes from `styles/antd-select.css`
 * (extracted from antd with `scripts/extract-antd-select-css.cjs`), so no antd
 * / rc-select code ships in this package.
 *
 * Supported: single mode, showSearch, allowClear, loading, disabled,
 * popupRender, popupMatchSelectWidth, getPopupContainer, onPopupScroll,
 * keyboard (↑ ↓ Enter Esc Home End PageUp PageDown), RTL, status.
 * Not supported (not used by the grid): multiple/tags, option groups, virtual
 * list.
 */

/** antd default palette; values referenced by styles/antd-select.css via var(--pdg-ant-*). */
export const ANT_SELECT_TOKENS = {
  '--pdg-ant-text': '#000',
  '--pdg-ant-bg': '#fff',
  '--pdg-ant-primary': '#1677ff',
  '--pdg-ant-primary-hover': '#4096ff',
  '--pdg-ant-primary-bg': '#e6f4ff',
  '--pdg-ant-border': '#d9d9d9',
  '--pdg-ant-warning': '#faad14',
  '--pdg-ant-warning-hover': '#ffd666',
  '--pdg-ant-error': '#ff4d4f',
  '--pdg-ant-error-hover': '#ff7875',
} as React.CSSProperties;

/** Inject antd's Select stylesheet once (it lives in this lazy chunk, not in the main bundle). */
function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pdg-antd-select-css')) return;
  const el = document.createElement('style');
  el.id = 'pdg-antd-select-css';
  el.textContent = ANT_SELECT_CSS;
  document.head.prepend(el);
}
ensureStyles();

const ITEM_HEIGHT = 32;
const LIST_HEIGHT = 256;
const GAP = 4;

const svgProps = {
  viewBox: '64 64 896 896',
  focusable: false,
  width: '1em',
  height: '1em',
  fill: 'currentColor',
  'aria-hidden': true,
} as const;

const DownIcon = () => (
  <span role="img" aria-label="down" className="anticon anticon-down ant-select-suffix">
    <svg {...svgProps}>
      <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z" />
    </svg>
  </span>
);
const SearchIcon = () => (
  <span role="img" aria-label="search" className="anticon anticon-search ant-select-suffix">
    <svg {...svgProps}>
      <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.3 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z" />
    </svg>
  </span>
);
const LoadingIcon = () => (
  <span role="img" aria-label="loading" className="anticon anticon-loading anticon-spin">
    <svg {...svgProps}>
      <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z" />
    </svg>
  </span>
);
const ClearIcon = () => (
  <span role="img" aria-label="close-circle" className="anticon anticon-close-circle">
    <svg {...svgProps} fillRule="evenodd">
      <path d="M512 64c247.4 0 448 200.6 448 448S759.4 960 512 960 64 759.4 64 512 264.6 64 512 64zm127.98 274.82h-.04l-.08.06L512 466.75 384.14 338.88c-.04-.05-.06-.06-.08-.06a.12.12 0 00-.07 0c-.03 0-.05.01-.09.05l-45.02 45.02a.2.2 0 00-.05.09.12.12 0 000 .07v.02a.27.27 0 00.06.06L466.75 512 338.88 639.86c-.05.04-.06.06-.06.08a.12.12 0 000 .07c0 .03.01.05.05.09l45.02 45.02a.2.2 0 00.09.05.12.12 0 00.07 0c.02 0 .04-.01.08-.05L512 557.25l127.86 127.87c.04.04.06.05.08.05a.12.12 0 00.07 0c.03 0 .05-.01.09-.05l45.02-45.02a.2.2 0 00.05-.09.12.12 0 000-.07v-.02a.27.27 0 00-.05-.06L557.25 512l127.87-127.86c.04-.04.05-.06.05-.08a.12.12 0 000-.07c0-.03-.01-.05-.05-.09l-45.02-45.02a.2.2 0 00-.09-.05.12.12 0 00-.07 0z" />
    </svg>
  </span>
);

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

function labelText(option: SelectOption): string {
  if (typeof option.label === 'string') return option.label;
  if (typeof option.label === 'number') return String(option.label);
  return typeof option.title === 'string' ? option.title : '';
}

export function SelectImpl({
  className,
  style,
  value,
  disabled,
  loading,
  showSearch,
  allowClear = false,
  placeholder,
  options = [],
  size,
  status,
  filterOption,
  onChange,
  onClick,
  onSearch,
  onClear,
  onFocus,
  onBlur,
  onPopupScroll,
  popupMatchSelectWidth,
  popupRender,
  autoFocus,
  optionRender,
  notFoundContent,
  getPopupContainer,
}: SelectProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rtl, setRtl] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; flip: boolean }>({
    top: 0,
    left: 0,
    width: 0,
    flip: false,
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const hasValue = value !== undefined && value !== null && value !== '';
  const selected = hasValue
    ? options.find((o) => String(o.value) === String(value))
    : undefined;

  const visible = useMemo(() => {
    if (!showSearch || !query) return options;
    return options.filter((option) => {
      if (typeof filterOption === 'function') return filterOption(query, option);
      return labelText(option).toLowerCase().includes(query.toLowerCase());
    });
  }, [options, query, filterOption, showSearch]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  const openList = useCallback(() => {
    if (disabled) return;
    setOpen(true);
  }, [disabled]);

  const commit = useCallback(
    (option: SelectOption | undefined) => {
      if (!option || option.disabled) return;
      onChange?.(option.value, option);
      close();
    },
    [onChange, close],
  );

  // Active row follows the selected option when the list opens / results change.
  useEffect(() => {
    if (!open) return;
    const selectedIdx = visible.findIndex((o) => String(o.value) === String(value));
    setActiveIndex((prev) => {
      if (prev >= 0 && prev < visible.length && query) return prev;
      if (selectedIdx >= 0 && !query) return selectedIdx;
      return visible.findIndex((o) => !o.disabled);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, visible]);

  const reposition = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const isRtl = getComputedStyle(root).direction === 'rtl';
    setRtl(isRtl);
    const menuHeight = dropdownRef.current?.offsetHeight ?? LIST_HEIGHT + 8;
    const width =
      typeof popupMatchSelectWidth === 'number'
        ? popupMatchSelectWidth
        : popupMatchSelectWidth === false
          ? Math.max(rect.width, dropdownRef.current?.scrollWidth ?? 0)
          : rect.width;
    const spaceBelow = window.innerHeight - rect.bottom;
    const flip = spaceBelow < menuHeight + GAP && rect.top > spaceBelow;
    const top = flip ? rect.top - menuHeight - GAP : rect.bottom + GAP;
    const left = isRtl ? rect.right - width : rect.left;
    setPos({ top, left, width, flip });
  }, [popupMatchSelectWidth]);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
  }, [open, reposition, visible.length]);

  useEffect(() => {
    if (!open) return;
    const onMove = () => reposition();
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open, reposition]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Keep the keyboard-active row visible.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const holder = listRef.current;
    if (!holder) return;
    const top = activeIndex * ITEM_HEIGHT;
    if (top < holder.scrollTop) holder.scrollTop = top;
    else if (top + ITEM_HEIGHT > holder.scrollTop + holder.clientHeight) {
      holder.scrollTop = top + ITEM_HEIGHT - holder.clientHeight;
    }
  }, [activeIndex, open]);

  const move = (delta: number) => {
    if (visible.length === 0) return;
    let next = activeIndex;
    for (let i = 0; i < visible.length; i += 1) {
      next = (next + delta + visible.length) % visible.length;
      if (!visible[next]?.disabled) break;
    }
    setActiveIndex(next);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) openList();
        else move(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) openList();
        else move(-1);
        break;
      case 'Home':
        if (open && !showSearch) {
          e.preventDefault();
          setActiveIndex(visible.findIndex((o) => !o.disabled));
        }
        break;
      case 'End':
        if (open && !showSearch) {
          e.preventDefault();
          for (let i = visible.length - 1; i >= 0; i -= 1) {
            if (!visible[i]?.disabled) {
              setActiveIndex(i);
              break;
            }
          }
        }
        break;
      case 'Enter':
      case 'NumpadEnter':
        if (open) {
          e.preventDefault();
          commit(visible[activeIndex]);
        } else {
          openList();
        }
        break;
      case ' ':
        if (!showSearch || !query) {
          if (!open) {
            e.preventDefault();
            openList();
          } else if (!showSearch) {
            e.preventDefault();
            commit(visible[activeIndex]);
          }
        }
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
        break;
      case 'Tab':
        if (open) close();
        break;
      default:
    }
  };

  const showArrow = true;
  const itemLabel = selected
    ? (selected.label ?? selected.title ?? String(selected.value))
    : hasValue
      ? String(value)
      : undefined;
  const itemTitle = selected
    ? (typeof selected.title === 'string'
        ? selected.title
        : typeof selected.label === 'string'
          ? selected.label
          : undefined)
    : hasValue
      ? String(value)
      : undefined;

  const rootClass = cx(
    'ant-select',
    'ant-select-outlined',
    'ant-select-single',
    showArrow && 'ant-select-show-arrow',
    showSearch && 'ant-select-show-search',
    allowClear && !disabled && 'ant-select-allow-clear',
    size === 'small' && 'ant-select-sm',
    size === 'large' && 'ant-select-lg',
    status && `ant-select-status-${status}`,
    disabled && 'ant-select-disabled',
    loading && 'ant-select-loading',
    open && 'ant-select-open',
    focused && 'ant-select-focused',
    rtl && 'ant-select-rtl',
    className,
  );

  const menu = (
    <div
      ref={listRef}
      id={listId}
      role="listbox"
      className="rc-virtual-list-holder"
      style={{ maxHeight: LIST_HEIGHT, overflowY: 'auto', overflowAnchor: 'none' }}
      onScroll={onPopupScroll}
    >
      {visible.length === 0 ? (
        <div className="ant-select-item ant-select-item-empty">
          {notFoundContent ?? (loading ? 'Loading...' : 'No data')}
        </div>
      ) : (
        visible.map((option, index) => {
          const isSelected = hasValue && String(option.value) === String(value);
          return (
            <div
              key={String(option.value ?? index)}
              role="option"
              id={`${listId}-${index}`}
              aria-selected={isSelected}
              aria-disabled={option.disabled || undefined}
              title={typeof option.title === 'string' ? option.title : undefined}
              className={cx(
                'ant-select-item',
                'ant-select-item-option',
                index === activeIndex && 'ant-select-item-option-active',
                isSelected && 'ant-select-item-option-selected',
                option.disabled && 'ant-select-item-option-disabled',
              )}
              onMouseEnter={() => !option.disabled && setActiveIndex(index)}
              onClick={() => commit(option)}
            >
              <div className="ant-select-item-option-content">
                {optionRender ? optionRender({ data: option }, { data: option }) : option.label}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const dropdown = (
    <div
      ref={dropdownRef}
      className={cx(
        'ant-select-dropdown',
        `ant-select-dropdown-placement-${pos.flip ? 'top' : 'bottom'}${rtl ? 'Right' : 'Left'}`,
        rtl && 'ant-select-dropdown-rtl',
      )}
      style={{
        ...ANT_SELECT_TOKENS,
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: popupMatchSelectWidth === false ? undefined : pos.width,
        minWidth: pos.width || undefined,
      }}
      // Keep the input focused while interacting with the list.
      onMouseDown={(e) => e.preventDefault()}
    >
      {popupRender ? popupRender(menu) : menu}
    </div>
  );

  const showClear = allowClear && !disabled && hasValue && !loading;

  return (
    <div
      ref={rootRef}
      className={rootClass}
      style={{ ...ANT_SELECT_TOKENS, ...style }}
      onMouseDown={(e) => {
        if (disabled) return;
        const target = e.target as HTMLElement;
        if (target.closest('.ant-select-clear')) return;
        if (target !== inputRef.current) e.preventDefault();
        inputRef.current?.focus();
        onClick?.();
        if (open) {
          if (!showSearch || target.closest('.ant-select-arrow')) close();
        } else {
          openList();
        }
      }}
    >
      <div className="ant-select-selector">
        <span className="ant-select-selection-wrap">
          <span className="ant-select-selection-search">
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              autoComplete="off"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={open ? listId : undefined}
              aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
              aria-autocomplete="list"
              className="ant-select-selection-search-input"
              style={showSearch ? undefined : { opacity: 0 }}
              readOnly={!showSearch}
              unselectable={showSearch ? undefined : 'on'}
              disabled={disabled}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!open) openList();
                onSearch?.(e.target.value);
              }}
              onKeyDown={onKeyDown}
              onFocus={() => {
                setFocused(true);
                onFocus?.();
              }}
              onBlur={() => {
                setFocused(false);
                close();
                onBlur?.();
              }}
            />
          </span>
          {!query && itemLabel !== undefined ? (
            <span className="ant-select-selection-item" title={itemTitle}>
              {itemLabel}
            </span>
          ) : null}
          {!query && itemLabel === undefined ? (
            <span className="ant-select-selection-placeholder">{placeholder}</span>
          ) : null}
        </span>
      </div>
      <span
        className={cx('ant-select-arrow', loading && 'ant-select-arrow-loading')}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        unselectable="on"
        aria-hidden="true"
      >
        {loading ? <LoadingIcon /> : open && showSearch ? <SearchIcon /> : <DownIcon />}
      </span>
      {showClear ? (
        <span
          className="ant-select-clear"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          unselectable="on"
          aria-hidden="true"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            setQuery('');
            onChange?.(undefined, undefined);
            onClear?.();
          }}
        >
          <ClearIcon />
        </span>
      ) : null}
      {open && typeof document !== 'undefined'
        ? createPortal(
            dropdown,
            (rootRef.current && getPopupContainer?.(rootRef.current)) || document.body,
          )
        : null}
    </div>
  );
}

export default SelectImpl;
