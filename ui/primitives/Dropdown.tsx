"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type DropdownItem = {
  key?: string;
  label?: React.ReactNode;
  extra?: React.ReactNode;
  type?: 'divider' | 'item' | string;
  onClick?: () => void;
  disabled?: boolean;
};

type DropdownProps = {
  items?: DropdownItem[];
  children: React.ReactNode;
  placement?: 'bottom' | 'bottomLeft' | 'bottomRight' | string;
  className?: string;
  dropdownClassName?: string;
};

export function CustomDropdownButton({
  items = [],
  children,
  placement = 'bottom',
  className,
  dropdownClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    let left = rect.left;
    if (placement === 'bottomRight') left = rect.right - 180;
    if (placement === 'bottomLeft') left = rect.left;
    setPos({ top: rect.bottom + 4, left });
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={triggerRef} className={className}>
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {children}
      </span>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              className={`erp-table-dropdown ${dropdownClassName ?? ''}`}
              style={{ top: pos.top, left: pos.left }}
            >
              {items.map((item, index) => {
                if (item.type === 'divider') {
                  return <div key={`d-${index}`} className="erp-table-dropdown__divider" />;
                }
                return (
                  <button
                    key={item.key ?? String(index)}
                    type="button"
                    className="erp-table-dropdown__item"
                    disabled={item.disabled}
                    onClick={() => {
                      item.onClick?.();
                      setOpen(false);
                    }}
                  >
                    <span>{item.label}</span>
                    {item.extra ? <span>{item.extra}</span> : null}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
