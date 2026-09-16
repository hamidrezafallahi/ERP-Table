"use client";

import React, { useEffect, useRef, useState } from 'react';

import type { CellError } from '../../engine/type';
import type { UITableController } from '../../infrastructure/ui/UITableController';
import { jsonEqual, useEngineSelector } from '../hooks/useEngineSelector';
import { useTranslations } from '../host';
import {
  announceFilterChange,
  announceSelectionChange,
  announceSortChange,
  announceValidationError,
  countActiveFilters,
  countSelectedRows,
  filterFingerprint,
  sortFingerprint,
} from './liveAnnouncements';

type Props = {
  controller: UITableController;
};

/**
 * Polite aria-live region for sort / filter / selection / validation (PR-125).
 * Visually hidden; text comes from `messages`.
 */
export function GridLiveRegion({ controller }: Props) {
  const t = useTranslations();
  const [message, setMessage] = useState('');
  const primed = useRef(false);
  const prevSort = useRef('');
  const prevFilter = useRef('');
  const prevSelected = useRef(-1);
  const prevValidation = useRef('');

  const snapshot = useEngineSelector(
    controller,
    (view) => ({
      sortModel: view?.sortModel ?? [],
      filterModel: view?.filterModel ?? {},
      quickFilterText: view?.quickFilterText ?? '',
      selectedRows: view?.selectedRows ?? {},
      columns: (view?.columns ?? []).map((c) => ({
        fieldName: c.fieldName,
        fieldCaption: c.fieldCaption,
      })),
      visibleRows: view?.pagination.totalRows ?? 0,
    }),
    jsonEqual,
  );

  useEffect(() => {
    const sortFp = sortFingerprint(snapshot.sortModel);
    const filterFp = filterFingerprint(
      snapshot.filterModel,
      snapshot.quickFilterText,
    );
    const selectedCount = countSelectedRows(snapshot.selectedRows);
    const totalRows = controller.getAllRows()?.length ?? snapshot.visibleRows;

    if (!primed.current) {
      primed.current = true;
      prevSort.current = sortFp;
      prevFilter.current = filterFp;
      prevSelected.current = selectedCount;
      return;
    }

    if (sortFp !== prevSort.current) {
      prevSort.current = sortFp;
      setMessage(
        announceSortChange(snapshot.sortModel, snapshot.columns, t),
      );
      return;
    }

    if (filterFp !== prevFilter.current) {
      prevFilter.current = filterFp;
      setMessage(
        announceFilterChange(
          snapshot.visibleRows,
          totalRows,
          countActiveFilters(snapshot.filterModel),
          Boolean(snapshot.quickFilterText.trim()),
          t,
        ),
      );
      return;
    }

    if (selectedCount !== prevSelected.current) {
      prevSelected.current = selectedCount;
      setMessage(announceSelectionChange(selectedCount, t));
    }
  }, [snapshot, controller, t]);

  useEffect(() => {
    const run = controller.validation();
    run((res) => {
      if (res.valid) {
        prevValidation.current = '';
        return;
      }
      let first: CellError | undefined;
      if (res.errors) {
        for (const err of res.errors.values()) {
          first = err;
          break;
        }
      }
      const msg = first?.message ?? '';
      if (!msg || msg === prevValidation.current) return;
      prevValidation.current = msg;
      setMessage(announceValidationError(msg, t));
    });
  }, [controller, snapshot, t]);

  return (
    <div
      className="pdg-live-region"
      data-pdg-live-region=""
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}
