"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { ColumnSchema } from '../../bootstrap/type';
import {
  columnMenuItemLabelKey,
  isColumnMenuCustomItem,
  resolveColumnMenuItems,
  sortModelForMenuAction,
  type ColumnMenuBuiltInId,
  type ColumnMenuItemDef,
  type ColumnMenuItemsConfig,
} from '../../engine/dataOps/columnMenu';
import type { FilterModel } from '../../engine/dataOps/filterModel';
import type { SortModel } from '../../engine/dataOps/sortModel';
import type { UITableController } from '../../infrastructure/ui/UITableController';
import { trapTabKey } from '../../infrastructure/ui/focusTrap';
import { useThemePortalStyle, useTranslations } from '../host';

export type ColumnMenuActionEvent = {
  name: string;
  columnId: string;
};

type Props = {
  column: ColumnSchema;
  controller: UITableController;
  sortModel: SortModel;
  filterModel: FilterModel;
  itemsConfig?: ColumnMenuItemsConfig;
  onCustomAction?: (event: ColumnMenuActionEvent) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  onOpenFilter?: () => void;
  onOpenColumnsPanel?: () => void;
};

type MenuRow =
  | { kind: 'separator'; key: string }
  | { kind: 'item'; key: string; label: string; disabled?: boolean; action: () => void };

function buildRows(
  items: ColumnMenuItemDef[],
  column: ColumnSchema,
  controller: UITableController,
  sortModel: SortModel,
  onCustomAction: ((event: ColumnMenuActionEvent) => void) | undefined,
  onOpenFilter: (() => void) | undefined,
  onOpenColumnsPanel: (() => void) | undefined,
  t: (key: string) => string,
): MenuRow[] {
  const colId = column.fieldName;
  const rows: MenuRow[] = [];

  for (const item of items) {
    if (item === 'separator') {
      rows.push({ kind: 'separator', key: `sep-${rows.length}` });
      continue;
    }
    if (isColumnMenuCustomItem(item)) {
      rows.push({
        kind: 'item',
        key: `custom-${item.name}`,
        label: item.label,
        disabled: item.disabled,
        action: () => onCustomAction?.({ name: item.name, columnId: colId }),
      });
      continue;
    }
    const id = item as ColumnMenuBuiltInId;
    if (id === 'separator') continue;
    rows.push({
      kind: 'item',
      key: id,
      label: t(columnMenuItemLabelKey(id)),
      action: () => {
        switch (id) {
          case 'sortAsc':
            controller.setSortModel(sortModelForMenuAction(sortModel, colId, 'asc'));
            break;
          case 'sortDesc':
            controller.setSortModel(sortModelForMenuAction(sortModel, colId, 'desc'));
            break;
          case 'sortNone':
            controller.setSortModel(sortModelForMenuAction(sortModel, colId, 'none'));
            break;
          case 'filter':
            onOpenFilter?.();
            break;
          case 'hideColumn':
            controller.setColumnVisible(colId, false);
            break;
          case 'pinStart':
            controller.setColumnPinned(colId, 'start');
            break;
          case 'pinEnd':
            controller.setColumnPinned(colId, 'end');
            break;
          case 'pinNone':
            controller.setColumnPinned(colId, null);
            break;
          case 'autoSize':
            controller.autoSizeColumns([colId]);
            break;
          case 'columnsPanel':
            onOpenColumnsPanel?.();
            break;
          default:
            break;
        }
      },
    });
  }

  return rows;
}

export function ColumnMenuPopover({
  column,
  controller,
  sortModel,
  itemsConfig,
  onCustomAction,
  open,
  onOpenChange,
  anchorRef,
  onOpenFilter,
  onOpenColumnsPanel,
}: Props) {
  const t = useTranslations();
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [focusIndex, setFocusIndex] = useState(0);
  const portalStyle = useThemePortalStyle({
    position: 'fixed',
    top: pos.top,
    left: pos.left,
    zIndex: 1200,
  });

  const items = useMemo(
    () => resolveColumnMenuItems(column, itemsConfig),
    [column, itemsConfig],
  );

  const rows = useMemo(
    () =>
      buildRows(
        items,
        column,
        controller,
        sortModel,
        onCustomAction,
        onOpenFilter,
        onOpenColumnsPanel,
        t,
      ),
    [
      items,
      column,
      controller,
      sortModel,
      onCustomAction,
      onOpenFilter,
      onOpenColumnsPanel,
      t,
    ],
  );

  const actionable = rows.filter((r) => r.kind === 'item') as Extract<
    MenuRow,
    { kind: 'item' }
  >[];

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
    setFocusIndex(0);
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (menuRef.current && trapTabKey(menuRef.current, e)) {
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
        return;
      }
      if (actionable.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusIndex((i) => (i + 1) % actionable.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIndex((i) => (i - 1 + actionable.length) % actionable.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const row = actionable[focusIndex];
        if (row && !row.disabled) {
          row.action();
          onOpenChange(false);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, actionable, focusIndex, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const focused = menuRef.current?.querySelector<HTMLElement>(
        '[role="menuitem"]:not([disabled])',
      );
      focused?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onOpenChange, anchorRef]);

  if (!open || typeof document === 'undefined') return null;

  let actionCursor = -1;

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      className="erp-col-menu pdg-col-menu"
      data-pdg-col-menu={column.fieldName}
      style={portalStyle}
    >
      {rows.map((row) => {
        if (row.kind === 'separator') {
          return (
            <div
              key={row.key}
              role="separator"
              className="erp-col-menu__separator"
              data-pdg-col-menu-separator
            />
          );
        }
        actionCursor += 1;
        const idx = actionCursor;
        const focused = idx === focusIndex;
        return (
          <button
            key={row.key}
            type="button"
            role="menuitem"
            data-pdg-col-menu-item={row.key}
            className={`erp-col-menu__item${focused ? ' is-focused' : ''}`}
            disabled={row.disabled}
            tabIndex={focused ? 0 : -1}
            onMouseEnter={() => setFocusIndex(idx)}
            onClick={() => {
              if (row.disabled) return;
              row.action();
              onOpenChange(false);
            }}
          >
            {row.label}
          </button>
        );
      })}
    </div>,
    document.body,
  );
}

export type { ColumnMenuItemDef, ColumnMenuItemsConfig };
