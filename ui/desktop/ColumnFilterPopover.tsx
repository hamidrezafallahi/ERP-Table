"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { ColumnSchema } from '../../bootstrap/type';
import {
  collectUniqueFilterValues,
  type BooleanFilterOp,
  type ColumnFilter,
  type DateFilterOp,
  type FilterModel,
  type NumberFilterOp,
  type TextFilterOp,
  type BuiltinFilterKind,
} from '../../engine/dataOps/filterModel';
import type { UITableController } from '../../infrastructure/ui/UITableController';
import type { FilterComponent } from '../filters';
import { useThemePortalStyle, useTranslations } from '../host';

type Props = {
  column: ColumnSchema;
  kind?: BuiltinFilterKind;
  /** Custom filter registry name (PR-95). */
  customName?: string;
  customParams?: Record<string, unknown>;
  customComponent?: FilterComponent;
  filterModel: FilterModel;
  controller: UITableController;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
};

const TEXT_OPS: TextFilterOp[] = [
  'contains',
  'notContains',
  'equals',
  'startsWith',
  'endsWith',
  'blank',
  'notBlank',
];

const NUMBER_OPS: NumberFilterOp[] = [
  'equals',
  'notEqual',
  'lessThan',
  'lessThanOrEqual',
  'greaterThan',
  'greaterThanOrEqual',
  'inRange',
  'blank',
];

const DATE_OPS: DateFilterOp[] = [
  'equals',
  'before',
  'after',
  'inRange',
  'blank',
];

function patchModel(
  model: FilterModel,
  colId: string,
  next: ColumnFilter | null,
): FilterModel {
  const out: Record<string, ColumnFilter> = { ...model };
  if (next == null) delete out[colId];
  else out[colId] = next;
  return out;
}

export function ColumnFilterPopover({
  column,
  kind,
  customName,
  customParams,
  customComponent,
  filterModel,
  controller,
  open,
  onOpenChange,
  anchorRef,
}: Props) {
  const t = useTranslations();
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const current = filterModel[column.fieldName];
  const menuStyle = useThemePortalStyle({
    position: 'fixed',
    top: pos.top,
    left: pos.left,
    zIndex: 60,
  });

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onOpenChange, anchorRef]);

  const uniqueValues = useMemo(() => {
    if (!open || kind !== 'set') return [];
    const rows = controller.getAllRows() ?? [];
    const ids = rows.map((r) => r.id.value);
    return collectUniqueFilterValues(ids, column.fieldName, {
      getValue: (rowId, colId) =>
        controller.getCell(rowId, colId)?.getValue() ?? null,
    });
  }, [open, kind, controller, column.fieldName]);

  if (!open || typeof document === 'undefined') return null;

  const apply = (next: ColumnFilter | null) => {
    controller.setFilterModel(patchModel(filterModel, column.fieldName, next));
  };

  const popoverKind = customName ? `custom:${customName}` : kind ?? 'custom';

  return createPortal(
    <div
      ref={panelRef}
      className="pdg-filter-popover"
      data-pdg-filter-popover={popoverKind}
      data-pdg-filter-col={column.fieldName}
      role="dialog"
      aria-label={t('general.filter')}
      style={menuStyle}
    >
      {customComponent ? (
        <div data-pdg-filter-custom={customName}>
          {customComponent({
            column,
            colId: column.fieldName,
            filterModel,
            current,
            params: customParams,
            controller,
            apply: (next) => {
              apply(next);
              onOpenChange(false);
            },
            close: () => onOpenChange(false),
          })}
        </div>
      ) : null}
      {!customComponent && kind === 'text' ? (
        <TextFilterForm
          current={current}
          onApply={(f) => {
            apply(f);
            onOpenChange(false);
          }}
          onClear={() => {
            apply(null);
            onOpenChange(false);
          }}
        />
      ) : null}
      {!customComponent && kind === 'number' ? (
        <NumberFilterForm
          current={current}
          onApply={(f) => {
            apply(f);
            onOpenChange(false);
          }}
          onClear={() => {
            apply(null);
            onOpenChange(false);
          }}
        />
      ) : null}
      {!customComponent && kind === 'date' ? (
        <DateFilterForm
          current={current}
          onApply={(f) => {
            apply(f);
            onOpenChange(false);
          }}
          onClear={() => {
            apply(null);
            onOpenChange(false);
          }}
        />
      ) : null}
      {!customComponent && kind === 'boolean' ? (
        <BooleanFilterForm
          current={current}
          onApply={(f) => {
            apply(f);
            onOpenChange(false);
          }}
          onClear={() => {
            apply(null);
            onOpenChange(false);
          }}
        />
      ) : null}
      {!customComponent && kind === 'set' ? (
        <SetFilterForm
          values={uniqueValues}
          current={current}
          onApply={(f) => {
            apply(f);
            onOpenChange(false);
          }}
          onClear={() => {
            apply(null);
            onOpenChange(false);
          }}
        />
      ) : null}
    </div>,
    document.body,
  );
}

function TextFilterForm({
  current,
  onApply,
  onClear,
}: {
  current: ColumnFilter | undefined;
  onApply: (f: ColumnFilter) => void;
  onClear: () => void;
}) {
  const t = useTranslations();
  const initial =
    current && 'filterType' in current && current.filterType === 'text'
      ? current
      : null;
  const [type, setType] = useState<TextFilterOp>(initial?.type ?? 'contains');
  const [filter, setFilter] = useState(String(initial?.filter ?? ''));
  const needsValue = type !== 'blank' && type !== 'notBlank';

  return (
    <form
      className="pdg-filter-form"
      onSubmit={(e) => {
        e.preventDefault();
        onApply({
          filterType: 'text',
          type,
          filter: needsValue ? filter : undefined,
        });
      }}
    >
      <select
        className="pdg-filter-select"
        value={type}
        onChange={(e) => setType(e.target.value as TextFilterOp)}
        aria-label={t('general.filter')}
      >
        {TEXT_OPS.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
      {needsValue ? (
        <input
          className="pdg-filter-input"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          data-pdg-filter-input="text"
        />
      ) : null}
      <div className="pdg-filter-actions">
        <button type="submit" className="pdg-filter-btn">
          {t('general.filterApply')}
        </button>
        <button type="button" className="pdg-filter-btn" onClick={onClear}>
          {t('general.filterClear')}
        </button>
      </div>
    </form>
  );
}

function NumberFilterForm({
  current,
  onApply,
  onClear,
}: {
  current: ColumnFilter | undefined;
  onApply: (f: ColumnFilter) => void;
  onClear: () => void;
}) {
  const t = useTranslations();
  const initial =
    current && 'filterType' in current && current.filterType === 'number'
      ? current
      : null;
  const [type, setType] = useState<NumberFilterOp>(initial?.type ?? 'equals');
  const [filter, setFilter] = useState(String(initial?.filter ?? ''));
  const [filterTo, setFilterTo] = useState(String(initial?.filterTo ?? ''));
  const needsValue = type !== 'blank';
  const needsTo = type === 'inRange';

  return (
    <form
      className="pdg-filter-form"
      onSubmit={(e) => {
        e.preventDefault();
        onApply({
          filterType: 'number',
          type,
          filter: needsValue ? filter : undefined,
          filterTo: needsTo ? filterTo : undefined,
        });
      }}
    >
      <select
        className="pdg-filter-select"
        value={type}
        onChange={(e) => setType(e.target.value as NumberFilterOp)}
      >
        {NUMBER_OPS.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
      {needsValue ? (
        <input
          className="pdg-filter-input"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          data-pdg-filter-input="number"
        />
      ) : null}
      {needsTo ? (
        <input
          className="pdg-filter-input"
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
          data-pdg-filter-input="number-to"
        />
      ) : null}
      <div className="pdg-filter-actions">
        <button type="submit" className="pdg-filter-btn">
          {t('general.filterApply')}
        </button>
        <button type="button" className="pdg-filter-btn" onClick={onClear}>
          {t('general.filterClear')}
        </button>
      </div>
    </form>
  );
}

function DateFilterForm({
  current,
  onApply,
  onClear,
}: {
  current: ColumnFilter | undefined;
  onApply: (f: ColumnFilter) => void;
  onClear: () => void;
}) {
  const t = useTranslations();
  const initial =
    current && 'filterType' in current && current.filterType === 'date'
      ? current
      : null;
  const [type, setType] = useState<DateFilterOp>(initial?.type ?? 'equals');
  const [dateFrom, setDateFrom] = useState(
    String(initial?.dateFrom ?? initial?.filter ?? ''),
  );
  const [dateTo, setDateTo] = useState(
    String(initial?.dateTo ?? initial?.filterTo ?? ''),
  );
  const needsFrom = type !== 'blank';
  const needsTo = type === 'inRange';

  return (
    <form
      className="pdg-filter-form"
      onSubmit={(e) => {
        e.preventDefault();
        onApply({
          filterType: 'date',
          type,
          dateFrom: needsFrom ? dateFrom : undefined,
          dateTo: needsTo ? dateTo : undefined,
        });
      }}
    >
      <select
        className="pdg-filter-select"
        value={type}
        onChange={(e) => setType(e.target.value as DateFilterOp)}
      >
        {DATE_OPS.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
      {needsFrom ? (
        <input
          className="pdg-filter-input"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          data-pdg-filter-input="date"
        />
      ) : null}
      {needsTo ? (
        <input
          className="pdg-filter-input"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          data-pdg-filter-input="date-to"
        />
      ) : null}
      <div className="pdg-filter-actions">
        <button type="submit" className="pdg-filter-btn">
          {t('general.filterApply')}
        </button>
        <button type="button" className="pdg-filter-btn" onClick={onClear}>
          {t('general.filterClear')}
        </button>
      </div>
    </form>
  );
}

function BooleanFilterForm({
  current,
  onApply,
  onClear,
}: {
  current: ColumnFilter | undefined;
  onApply: (f: ColumnFilter) => void;
  onClear: () => void;
}) {
  const t = useTranslations();
  const initial =
    current && 'filterType' in current && current.filterType === 'boolean'
      ? current.type
      : 'any';
  const [type, setType] = useState<BooleanFilterOp>(initial);

  return (
    <form
      className="pdg-filter-form"
      onSubmit={(e) => {
        e.preventDefault();
        onApply({ filterType: 'boolean', type });
      }}
    >
      {(['true', 'false', 'any'] as const).map((op) => (
        <label key={op} className="pdg-filter-check">
          <input
            type="radio"
            name="bool-filter"
            checked={type === op}
            onChange={() => setType(op)}
            data-pdg-filter-input={`boolean-${op}`}
          />
          {op}
        </label>
      ))}
      <div className="pdg-filter-actions">
        <button type="submit" className="pdg-filter-btn">
          {t('general.filterApply')}
        </button>
        <button type="button" className="pdg-filter-btn" onClick={onClear}>
          {t('general.filterClear')}
        </button>
      </div>
    </form>
  );
}

function SetFilterForm({
  values,
  current,
  onApply,
  onClear,
}: {
  values: unknown[];
  current: ColumnFilter | undefined;
  onApply: (f: ColumnFilter) => void;
  onClear: () => void;
}) {
  const t = useTranslations();
  const initial =
    current && 'filterType' in current && current.filterType === 'set'
      ? new Set(current.values.map((v) => String(v ?? '')))
      : new Set(values.map((v) => String(v ?? '')));
  const [selected, setSelected] = useState(initial);

  return (
    <form
      className="pdg-filter-form"
      onSubmit={(e) => {
        e.preventDefault();
        onApply({
          filterType: 'set',
          type: 'in',
          values: values.filter((v) => selected.has(String(v ?? ''))),
        });
      }}
    >
      <div className="pdg-filter-set-list" data-pdg-filter-input="set">
        {values.map((v, i) => {
          const key = String(v ?? '');
          const label = v == null || v === '' ? '(blank)' : String(v);
          return (
            <label key={`${key}-${i}`} className="pdg-filter-check">
              <input
                type="checkbox"
                checked={selected.has(key)}
                onChange={(e) => {
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (e.target.checked) next.add(key);
                    else next.delete(key);
                    return next;
                  });
                }}
              />
              {label}
            </label>
          );
        })}
      </div>
      <div className="pdg-filter-actions">
        <button type="submit" className="pdg-filter-btn">
          {t('general.filterApply')}
        </button>
        <button type="button" className="pdg-filter-btn" onClick={onClear}>
          {t('general.filterClear')}
        </button>
      </div>
    </form>
  );
}
