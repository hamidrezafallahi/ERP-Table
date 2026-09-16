"use client";

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { trapTabKey } from '../../infrastructure/ui/focusTrap';
import { useThemePortalStyle } from '../host';

type Props = {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function CustomTooltip({ title, children }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const portalStyle = useThemePortalStyle({
    position: 'fixed',
    left: pos?.x,
    top: pos?.y,
    transform: 'translate(-50%, -100%)',
  });

  if (!title) return <>{children}</>;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: rect.left + rect.width / 2, y: rect.top - 6 });
      }}
      onMouseLeave={() => setPos(null)}
    >
      {children}
      {pos && typeof document !== 'undefined'
        ? createPortal(
            <span
              className="erp-table-tooltip"
              style={portalStyle}
            >
              {title}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}

export function Tooltip({ title, children }: { title?: React.ReactNode; children: React.ReactNode }) {
  return <CustomTooltip title={title}>{children}</CustomTooltip>;
}

type ModalProps = {
  isModalOpen?: boolean;
  closeModal?: () => void;
  headerName?: React.ReactNode;
  headerIcon?: React.ReactNode;
  content?: React.ReactNode;
  width?: number;
  contentClassName?: string;
};

export function CustomModal({
  isModalOpen,
  closeModal,
  headerName,
  headerIcon,
  content,
  width = 720,
  contentClassName,
}: ModalProps) {
  const overlayStyle = useThemePortalStyle();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const id = requestAnimationFrame(() => {
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusables?.[0]?.focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (!dialogRef.current) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal?.();
        return;
      }
      trapTabKey(dialogRef.current, e);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.();
    };
  }, [isModalOpen, closeModal]);

  if (!isModalOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="erp-table-modal-overlay"
      style={overlayStyle}
      onClick={() => closeModal?.()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof headerName === 'string' ? headerName : undefined}
        className="erp-table-modal"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="erp-table-modal__header">
          {headerIcon}
          <span>{headerName}</span>
          <button
            type="button"
            className="erp-table-modal__close"
            onClick={() => closeModal?.()}
          >
            ×
          </button>
        </div>
        <div className={`erp-table-modal__body ${contentClassName ?? ''}`}>{content}</div>
      </div>
    </div>,
    document.body,
  );
}

export function CustomCheckbox({
  checked,
  disabled,
  onClick,
  onChange,
  className,
  'aria-label': ariaLabel,
}: {
  checked?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  'aria-label'?: string;
}) {
  return (
    <input
      type="checkbox"
      className={`erp-table-checkbox ${className ?? ''}`}
      checked={!!checked}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      onChange={(event) => {
        onChange?.(event);
      }}
    />
  );
}

export function CustomButton({
  children,
  className,
  onClick,
  htmlType = 'button',
  type,
  disabled,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  htmlType?: 'button' | 'submit' | 'reset';
  type?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type={htmlType}
      disabled={disabled}
      onClick={onClick}
      className={`flex justify-center items-center px-2 py-1 border rounded ${className ?? ''}`}
      data-variant={type}
    >
      {children}
    </button>
  );
}

export function InputText({
  value,
  onChange,
  placeholder,
  className,
}: {
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <input
      id={id}
      className={`px-3 py-2 border border-gray-gray5 rounded w-full text-sm outline-none ${className ?? ''}`}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
}

export function Spin({
  indicator,
}: {
  size?: string;
  indicator?: React.ReactNode;
}) {
  return <span className="inline-flex animate-spin">{indicator}</span>;
}
