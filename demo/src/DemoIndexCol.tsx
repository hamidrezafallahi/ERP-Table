import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import type { ColumnSchema, CreateERPTableResult } from '@fallahi/erp-table';

import type { DisplayRow } from './demoHelpers';
import { DEMO_INDEX_COLUMN } from './fixtures';
import styles from './site.module.css';

type IndexMenuItem = {
  key?: string;
  type?: string;
  label?: ReactNode;
  extra?: string;
  disabled?: boolean;
  onClick?: () => void;
};

type Props = {
  grid: CreateERPTableResult;
  meta?: ColumnSchema;
  row: DisplayRow;
  /** 0-based absolute index — displayed as idx + 1 (like ui/desktop/indexCol). */
  idx: number;
  onLog?: (message: string) => void;
};

/**
 * Demo port of `ui/desktop/indexCol.tsx`.
 * Owns: checkbox, row number, drag handle, delete, options / indexOptions.
 * Must always be rendered as the first column of every row.
 */
export function DemoIndexCol({
  grid,
  meta = DEMO_INDEX_COLUMN,
  row,
  idx,
  onLog,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const controller = grid.controller;
  const uiRow = controller.getRowView(row.id);
  const isDeleted = uiRow?.rowState === 'Deleted' || false;
  const isSelected = !!controller.isSelectedRow(row.id);
  const rowNumber = idx + 1;

  const enableDelete = meta.enableDeleteButton ?? true;
  const enableExpand = meta.enableExpandButton ?? false;
  const enableMove = meta.enableMoveButton ?? true;
  const enableOptions = meta.enableOptionsButton ?? true;

  useLayoutEffect(() => {
    if (!menuOpen || !btnRef.current) {
      setMenuPos(null);
      return;
    }
    const rect = btnRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      left: Math.max(8, rect.left),
    });
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setMenuOpen(false);
    };
    const onScroll = () => setMenuOpen(false);
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [menuOpen]);

  const log = (message: string) => onLog?.(message);

  const customItems: IndexMenuItem[] =
    (meta.indexOptions?.(
      grid.session.tableKey,
      row.id,
      uiRow ?? { id: row.id, cells: row.cells },
      controller,
    ) as IndexMenuItem[] | undefined) ?? [];

  const menuItems: IndexMenuItem[] = [
    {
      key: '1',
      label: 'Duplicate row',
      extra: 'Alt + D',
      onClick: () => {
        void controller.dispatch({ type: 'DUPLICATE_ROW', rowId: row.id });
        log(`DUPLICATE_ROW ${row.id}`);
        setMenuOpen(false);
      },
    },
    {
      key: '2',
      label: 'Add new row',
      extra: 'Alt + N',
      onClick: () => {
        void controller.dispatch({ type: 'ADD_EMPTY_ROW' });
        log('ADD_EMPTY_ROW');
        setMenuOpen(false);
      },
    },
    { type: 'divider' },
    ...customItems,
  ];

  const menu =
    menuOpen && menuPos
      ? createPortal(
          <ul
            ref={menuRef}
            className={styles.indexMenu}
            role="menu"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            {menuItems.map((item, i) => {
              if (item.type === 'divider') {
                return <li key={`d-${i}`} className={styles.indexMenuDivider} />;
              }
              return (
                <li key={item.key ?? i}>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    className={styles.indexMenuItem}
                    onClick={() => {
                      item.onClick?.();
                      log(`indexOption:${item.key} row=${row.id}`);
                      setMenuOpen(false);
                    }}
                  >
                    <span>{item.label}</span>
                    {item.extra ? (
                      <span className={styles.indexMenuExtra}>{item.extra}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div
      className={`${styles.indexCol} ${isDeleted ? styles.indexColDeleted : ''}`}
      ref={rootRef}
    >
      <div className={styles.indexColStart}>
        {!isDeleted && (
          <input
            type="checkbox"
            className={styles.indexCheck}
            checked={isSelected}
            onChange={() => {
              controller.onRowSelect(row.id);
              log(`ROW_SELECTION_TOGGLED ${row.id}`);
            }}
            aria-label={`Select row ${rowNumber}`}
          />
        )}

        <span className={styles.indexNumber} title="Row number">
          {rowNumber}
        </span>

        {enableMove && !isDeleted && (
          <div
            className={styles.dragHandle}
            title="Drag to reorder"
            draggable={false}
            onMouseDown={(e) => {
              const rowEl = e.currentTarget.closest('[data-demo-row]');
              rowEl?.setAttribute('draggable', 'true');
            }}
          >
            ⋮⋮
          </div>
        )}

        {enableDelete && (
          <button
            type="button"
            className={styles.indexIconBtn}
            title={isDeleted ? 'Restore' : 'Delete row'}
            onClick={(e) => {
              e.stopPropagation();
              void controller.dispatch({ type: 'ROW_DELETED', rowId: row.id });
              log(`ROW_DELETED ${row.id}`);
            }}
          >
            {isDeleted ? '↶' : '🗑'}
          </button>
        )}

        {enableExpand && (
          <button
            type="button"
            className={styles.indexIconBtn}
            title="Expand"
            disabled={isDeleted}
            onClick={() => {
              void controller.dispatch({
                type: 'TOGGLE_ROW_EXPANDED',
                rowId: row.id,
              });
              log(`TOGGLE_ROW_EXPANDED ${row.id}`);
            }}
          >
            ▾
          </button>
        )}
      </div>

      {enableOptions && !isDeleted && (
        <div className={styles.indexMenuWrap}>
          <button
            ref={btnRef}
            type="button"
            className={styles.indexIconBtn}
            title="More actions"
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
          >
            ⋯
          </button>
          {menu}
        </div>
      )}
    </div>
  );
}
