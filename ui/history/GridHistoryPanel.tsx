'use client';

import React, { useEffect, useMemo, useState } from 'react';

import type {
  HistoryCategory,
  HistoryItem,
  HistorySeverity,
} from '../../infrastructure/history/HistoryPanelViewModel';
import type { UITableController } from '../../infrastructure/ui/UITableController';
import { useTranslations } from '../host';
import { revealRow } from '../gridSearch/utils';

export type GridHistoryPanelProps = {
  controller: UITableController;
  /** Max timeline rows (newest last in the ViewModel; we reverse for display). */
  limit?: number;
  className?: string;
  /** Fires after jump-to-cell (for hosts that want to close a drawer). */
  onNavigate?: (item: HistoryItem) => void;
};

function payloadCell(
  item: HistoryItem,
): { rowId: number; columnId: string } | null {
  const payload = item.raw.payload as Record<string, unknown> | null;
  if (!payload) return null;
  const rowRaw = payload.rowId;
  const columnId = payload.columnId;
  if (typeof columnId !== 'string' || columnId.length === 0) return null;
  const rowId =
    typeof rowRaw === 'number'
      ? rowRaw
      : typeof rowRaw === 'string'
        ? Number(rowRaw)
        : NaN;
  if (!Number.isFinite(rowId)) return null;
  return { rowId, columnId };
}

function canRestore(item: HistoryItem): boolean {
  if (item.type !== 'CELL_CHANGED') return false;
  const payload = item.raw.payload as Record<string, unknown> | null;
  return Boolean(payload && 'previousValue' in payload && payloadCell(item));
}

function formatWhen(ts: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toISOString();
  }
}

const SEVERITIES: Array<HistorySeverity | ''> = [
  '',
  'info',
  'warning',
  'error',
];
const CATEGORIES: Array<HistoryCategory | ''> = [
  '',
  'data',
  'structure',
  'view',
  'system',
];

/**
 * Product audit timeline (PR-136). Subscribes to `HistoryPanelViewModel`
 * via the controller; jump focuses a cell; restore writes previousValue.
 */
export function GridHistoryPanel({
  controller,
  limit = 100,
  className,
  onNavigate,
}: GridHistoryPanelProps) {
  const t = useTranslations();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [severity, setSeverity] = useState<HistorySeverity | ''>('');
  const [category, setCategory] = useState<HistoryCategory | ''>('');

  const filter = useMemo(
    () => ({
      ...(severity ? { severity } : {}),
      ...(category ? { category } : {}),
      limit,
    }),
    [severity, category, limit],
  );

  useEffect(() => {
    setItems(controller.getHistoryItems(filter));
    return controller.subscribeHistoryItems(setItems, filter);
  }, [controller, filter]);

  const timeline = useMemo(() => [...items].reverse(), [items]);

  const jumpTo = async (item: HistoryItem) => {
    const cell = payloadCell(item);
    if (!cell) return;
    await revealRow(controller, cell.rowId);
    await controller.dispatch({
      type: 'UI_ACTIVE_CELL',
      rowId: cell.rowId,
      columnId: cell.columnId,
    });
    onNavigate?.(item);
  };

  const restore = async (item: HistoryItem) => {
    const cell = payloadCell(item);
    const payload = item.raw.payload as Record<string, unknown> | null;
    if (!cell || !payload || !('previousValue' in payload)) return;
    // Ensure we write through (not a session draft patch).
    controller.cancelCellEdit();
    await controller.dispatch({
      type: 'UI_CELL_CHANGE',
      rowId: cell.rowId,
      columnId: cell.columnId,
      value: payload.previousValue,
    });
    await jumpTo(item);
  };

  return (
    <aside
      className={['pdg-history-panel', className].filter(Boolean).join(' ')}
      data-pdg-history-panel=""
      aria-label={t('history.title')}
    >
      <header className="pdg-history-panel__header">
        <h2 className="pdg-history-panel__title">{t('history.title')}</h2>
        <div className="pdg-history-panel__filters">
          <label className="pdg-history-panel__filter">
            <span>{t('history.severity')}</span>
            <select
              data-pdg-history-severity=""
              value={severity}
              onChange={(e) =>
                setSeverity(e.target.value as HistorySeverity | '')
              }
            >
              {SEVERITIES.map((s) => (
                <option key={s || 'all'} value={s}>
                  {s ? t(`history.severity.${s}`) : t('history.filterAll')}
                </option>
              ))}
            </select>
          </label>
          <label className="pdg-history-panel__filter">
            <span>{t('history.category')}</span>
            <select
              data-pdg-history-category=""
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as HistoryCategory | '')
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c || 'all'} value={c}>
                  {c ? t(`history.category.${c}`) : t('history.filterAll')}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {timeline.length === 0 ? (
        <p className="pdg-history-panel__empty" data-pdg-history-empty="">
          {t('history.empty')}
        </p>
      ) : (
        <ol className="pdg-history-panel__list" data-pdg-history-list="">
          {timeline.map((item) => {
            const cell = payloadCell(item);
            return (
              <li
                key={item.id}
                className="pdg-history-panel__item"
                data-pdg-history-item={item.id}
                data-pdg-history-type={item.type}
                data-pdg-history-severity={item.severity}
                data-pdg-history-category={item.category}
              >
                <button
                  type="button"
                  className="pdg-history-panel__jump"
                  data-pdg-history-jump=""
                  disabled={!cell}
                  onClick={() => void jumpTo(item)}
                >
                  <span className="pdg-history-panel__item-title">
                    {item.title}
                  </span>
                  <span className="pdg-history-panel__item-meta">
                    {item.actorId} · {formatWhen(item.occurredAt, 'en')}
                  </span>
                  <span className="pdg-history-panel__item-desc">
                    {item.description}
                  </span>
                </button>
                {canRestore(item) ? (
                  <button
                    type="button"
                    className="pdg-history-panel__restore"
                    data-pdg-history-restore=""
                    onClick={() => void restore(item)}
                  >
                    {t('history.restore')}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}
