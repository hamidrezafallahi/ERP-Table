"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { ColumnSchema } from '../../bootstrap/type';
import { isIndexColumn } from '../../engine/columnWidth';
import { canSetColumnVisible } from '../../engine/dataOps/columnVisibility';
import type { UITableController } from '../../infrastructure/ui/UITableController';
import { trapTabKey } from '../../infrastructure/ui/focusTrap';
import { useThemePortalStyle, useTranslations } from '../host';

type Props = {
  columns: ColumnSchema[];
  controller: UITableController;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
};

export function ColumnsPanelPopover({
  columns,
  controller,
  open,
  onOpenChange,
  anchorRef,
}: Props) {
  const t = useTranslations();
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const portalStyle = useThemePortalStyle({
    position: 'fixed',
    top: pos.top,
    left: pos.left,
    zIndex: 1200,
    minWidth: 200,
  });

  const togglable = columns.filter((c) => !isIndexColumn(c));

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (panelRef.current && trapTabKey(panelRef.current, e)) {
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onOpenChange, anchorRef]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label={t('columnMenu.columnsPanel')}
      className="erp-col-menu erp-col-columns-panel pdg-col-columns-panel"
      data-pdg-col-columns-panel
      style={portalStyle}
    >
      <div className="erp-col-columns-panel__title">{t('columnMenu.columnsPanel')}</div>
      <ul className="erp-col-columns-panel__list" role="listbox">
        {togglable.map((col) => {
          const visible = !col.hidden;
          const locked = canSetColumnVisible(col, true).ok === false && !visible;
          return (
            <li key={col.fieldName} role="option" aria-selected={visible}>
              <label className="erp-col-columns-panel__row">
                <input
                  type="checkbox"
                  checked={visible}
                  disabled={locked}
                  data-pdg-col-panel-toggle={col.fieldName}
                  onChange={() => {
                    controller.setColumnVisible(col.fieldName, !visible);
                  }}
                />
                <span>{col.fieldCaption}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>,
    document.body,
  );
}
