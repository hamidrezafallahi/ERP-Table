"use client";

import React from 'react';

import { CustomTooltip } from '../primitives';

type Props = {
  label: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'aria-label' | 'type' | 'disabled' | 'onClick' | 'className'
>;

export function ToolbarIconButton({
  label,
  disabled,
  onClick,
  children,
  className,
  ...rest
}: Props) {
  return (
    <CustomTooltip title={label}>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        className={`erp-toolbar-btn flex justify-center items-center p-1 border rounded ${
          disabled ? "opacity-40" : ""
        } ${className ?? ""}`}
        onClick={onClick}
        {...rest}
      >
        {children}
      </button>
    </CustomTooltip>
  );
}
