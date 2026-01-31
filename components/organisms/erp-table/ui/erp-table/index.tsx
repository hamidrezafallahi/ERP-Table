// ui/erp-table/ERPTable.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@redux/index';

import { AddNewRowButton } from '../addNewRowButton';
import { ERPTableBody } from './ERPTableBody';
import { ERPTableHeader } from './ERPTableHeader';
import { useERPTable } from './hooks/useERPTable';
import ERPTablePagination from './pagination';

export type ERPTableApi = {
  getSnapshot: () => unknown;
};
interface ERPTableProps {
  tableId: string;
  columns: any[];
  rows: Array<{ id: number; values?: Record<string, unknown> }>;
  actor: any;
  onReady?: (api: ERPTableApi) => void;
}

function isTextInputTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (el.isContentEditable) return true;
  if (el.closest('input,textarea,select,[contenteditable="true"]')) return true;
  return false;
}

export const ERPTable: React.FC<ERPTableProps> = ({
  tableId,
  columns,
  rows,
  actor,
  onReady,
}) => {
  const result = useERPTable({ tableId, columns, rows, actor });

  const { activePage, fullScreen, minimizePanel, match } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find((item) => item.isActive),
      fullScreen: state.withPersist.config.fullScreen,
      minimizePanel: state.withoutPersist.container.minimize,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );

  const activeRowIdRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTableActive, setIsTableActive] = useState(false);

  // ---------- keyboard handler ----------
  useEffect(() => {
    if (!result.ready) return;
    const { controller } = result;
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest("button");
      if (button) {
        const buttonData = button.dataset;
        if(tableId === buttonData.pageid){
          console.log('حذف جدول از دیتابیس')
          // controller.dispatch({
          //   type: "TABLE_DELETED",
          // });
        }
      }
    };

    const handler = (e: KeyboardEvent) => {
      if (!isTableActive) return;
      controller.dispatch({
        type: "KEY_DOWN",
        event: e,
        ctx: {
          activeRowId: activeRowIdRef.current,
          tableId,
        },
      });
    };
    window.addEventListener("keydown", handler, true);
    window.addEventListener("click", clickHandler, true);
    return () => {
      window.removeEventListener("click", clickHandler, true);
      window.removeEventListener("keydown", handler, true);
    };
  }, [result.ready, isTableActive, tableId, result]);
  useEffect(() => {
    if (!result.ready) return;
    if (!onReady) return;

    const { controller } = result;

    onReady?.({
      getSnapshot: () => controller.getSnapShot(tableId),
    });
  }, [result.ready, onReady, tableId, result]);

  const handleActivateTable = useCallback((e: React.SyntheticEvent) => {
    setIsTableActive(true);
    if (isTextInputTarget(e.target)) return;
    containerRef.current?.focus();
  }, []);

  const handleDeactivateTable = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      const next = e.relatedTarget as Node | null;
      if (!next || !containerRef.current?.contains(next)) {
        setIsTableActive(false);
      }
    },
    [],
  );

  if (!result.ready) return null;
  const { controller } = result;

  return (
    <>
      <div
        ref={containerRef}
        tabIndex={0}
        onMouseDownCapture={handleActivateTable}
        onFocusCapture={handleActivateTable}
        onBlurCapture={handleDeactivateTable}
        className={`w-full ${
          fullScreen
            ? "w-full"
            : !match
              ? "!w-full"
              : minimizePanel
                ? " max-w-[calc(100dvw-300px)]"
                : " max-w-[calc(100dvw-550px)]"
        } ${
          !match ? "h-full" : "h-[calc(100dvh-400px)]"
        } flex transition-all duration-200 overflow-y-auto flex-col justify-between gap-2 outline-none`}
      >
        <table className="mt-2">
          <ERPTableHeader table={controller.getViewState(tableId)} />
          <ERPTableBody
            controller={controller}
            tableId={tableId}
            containerRef={containerRef}
            onActiveRowChange={(rowId) => {
              activeRowIdRef.current = rowId;
            }}
          />
        </table>
      </div>

      <div className="flex items-center gap-3 w-52">
        <ERPTablePagination controller={controller} tableId={tableId} />
        <AddNewRowButton controller={controller} />
      </div>
    </>
  );
};
