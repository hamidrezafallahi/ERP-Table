'use client';

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { Select } from '../primitives';
import { useMediaQuery, useThemePortalStyle, useTranslations } from '../host';
import { LeftChevron, RightChevron } from '../primitives';

import { UITableController } from '../../infrastructure/ui/UITableController';
import { useGridSearchState } from '../hooks/useEngineSelector';
import { findColumnMatches, navigateToMatch } from './utils';

const MOBILE_SEARCH_PANEL_HEIGHT = 220;

interface GridSearchPanelProps {
  controller: UITableController;
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export function GridSearchPanel({
  controller,
  isOpen,
  onClose,
  anchorRef,
}: GridSearchPanelProps) {
  const t = useTranslations();
  const { match: viewportMatch } = useMediaQuery('XLUP');
  const isMobile = viewportMatch === false;
  const searchState = useGridSearchState(controller);
  const [columnId, setColumnId] = useState('');
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const themeVars = useThemePortalStyle();

  const table = controller.getViewState();
  const columns = useMemo(
    () => (table?.columns ?? []).filter(col => !col.hidden && col.fieldName !== 'index'),
    [table?.columns],
  );

  const columnOptions = useMemo(
    () =>
      columns.map(col => ({
        value: col.fieldName,
        label: col.fieldCaption || col.fieldName,
      })),
    [columns],
  );

  const isCurrentSearch =
    hasSearched &&
    searchState?.columnId === columnId &&
    searchState?.query === query.trim();

  const totalMatches = isCurrentSearch ? searchState?.matches.length ?? 0 : 0;
  const currentMatchIndex = isCurrentSearch ? searchState?.currentIndex ?? -1 : -1;
  const canNavigate = totalMatches > 1;

  useEffect(() => {
    if (!columnId && columns.length > 0) {
      setColumnId(columns[0].fieldName);
    }
  }, [columns, columnId]);

  useLayoutEffect(() => {
    if (!isOpen || isMobile || !anchorRef.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      setPosition({
        left: rect.left,
        top: rect.top - 8,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, isMobile, anchorRef]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) {
        return;
      }
      onClose();
    };

    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  const runSearch = async (startIndex = 0) => {
    const trimmedQuery = query.trim();
    if (!columnId || !trimmedQuery) return;

    const matches = findColumnMatches(controller, columnId, trimmedQuery);
    setHasSearched(true);

    if (!matches.length) {
      await controller.dispatch({
        type: 'UI_SET_GRID_SEARCH',
        search: { columnId, query: trimmedQuery, matches: [], currentIndex: -1 },
      });
      return;
    }

    const index = Math.min(Math.max(startIndex, 0), matches.length - 1);
    await controller.dispatch({
      type: 'UI_SET_GRID_SEARCH',
      search: { columnId, query: trimmedQuery, matches, currentIndex: index },
    });
    await navigateToMatch(controller, matches[index]);
  };

  const goToMatch = async (direction: 1 | -1) => {
    if (!canNavigate || !searchState?.matches.length) return;

    const nextIndex =
      (searchState.currentIndex + direction + searchState.matches.length) %
      searchState.matches.length;
    const nextState = { ...searchState, currentIndex: nextIndex };
    await controller.dispatch({
      type: 'UI_SET_GRID_SEARCH',
      search: nextState,
    });
    await navigateToMatch(controller, nextState.matches[nextIndex]);
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const resultSummary = !hasSearched
    ? ''
    : totalMatches > 0
      ? `${totalMatches} مورد پیدا شد`
      : 'موردی یافت نشد';

  const positionSummary =
    totalMatches > 0 && currentMatchIndex >= 0
      ? `${currentMatchIndex + 1} از ${totalMatches}`
      : '';

  const panelContent = (
    <>
      <Select
        className="w-full"
        value={columnId || undefined}
        options={columnOptions}
        placeholder={t('general.choice')}
        getPopupContainer={(trigger: HTMLElement) => trigger.parentElement ?? document.body}
        onChange={(value) => {
          setColumnId(String(value ?? ''));
          setHasSearched(false);
        }}
      />

      <input
        ref={inputRef}
        type="text"
        value={query}
        placeholder={t('general.search')}
        className="px-3 py-2 border border-gray-gray5 rounded w-full text-sm outline-none focus:border-blue-blue6"
        onChange={event => {
          setQuery(event.target.value);
          setHasSearched(false);
        }}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            void runSearch(0);
          }
        }}
      />

      <div className="flex justify-between items-center gap-2">
        <button
          type="button"
          className="flex-1 bg-blue-blue6 px-3 py-1.5 rounded text-white text-sm"
          onClick={() => void runSearch(0)}
        >
          {t('general.search')}
        </button>

        <button
          type="button"
          title={t('general.prev')}
          aria-label={t('general.prev')}
          className="erp-toolbar-btn flex justify-center items-center p-1.5 border border-gray-gray5 rounded disabled:opacity-40"
          disabled={!canNavigate}
          onClick={() => void goToMatch(-1)}
        >
          <LeftChevron config={{ width: 16, height: 16 }} />
        </button>

        <button
          type="button"
          title={t('general.next')}
          aria-label={t('general.next')}
          className="erp-toolbar-btn flex justify-center items-center p-1.5 border border-gray-gray5 rounded disabled:opacity-40"
          disabled={!canNavigate}
          onClick={() => void goToMatch(1)}
        >
          <RightChevron config={{ width: 16, height: 16 }} />
        </button>
      </div>

      {resultSummary ? (
        <span className="text-gray-gray7 text-xs text-center">{resultSummary}</span>
      ) : null}

      {positionSummary ? (
        <span className="text-blue-blue6 text-xs text-center font-medium">{positionSummary}</span>
      ) : null}
    </>
  );

  if (isMobile) {
    return createPortal(
      <div
        ref={panelRef}
        style={{
          ...themeVars,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: MOBILE_SEARCH_PANEL_HEIGHT,
          zIndex: 9999,
        }}
        className="flex flex-col gap-2 bg-main-white shadow-lg px-3 py-3 border-b border-gray-gray5"
      >
        {panelContent}
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div
      ref={panelRef}
      style={{
        ...themeVars,
        position: 'fixed',
        left: position.left,
        top: position.top,
        transform: 'translateY(-100%)',
        zIndex: 9999,
      }}
      className="flex flex-col gap-2 bg-white shadow-lg p-3 border border-gray-gray5 rounded-lg min-w-[320px]"
    >
      {panelContent}
    </div>,
    document.body,
  );
}
