import { RefObject, useCallback, useEffect, useState } from 'react';

const VIEWPORT_BOTTOM_GAP = 20;
const MIN_TABLE_HEIGHT = 240;
/** Fallback viewport before the first measurement (virtual mode only). */
export const DEFAULT_VIRTUAL_BODY_HEIGHT = 400;

type UseERPTableLayoutOptions = {
  rootRef: RefObject<HTMLDivElement | null>;
  bodyRef: RefObject<HTMLDivElement | null>;
  /** Explicit host height — always wins, nothing is measured. */
  tableHeight?: number;
  ready?: boolean;
  /**
   * Fill the remaining window height when `tableHeight` is not given.
   * Needed for row virtualization: the scroll container must be bounded,
   * otherwise it grows to its content and there is nothing to virtualize.
   * Off for classic pagination (newFront parity: body height = `100%`).
   */
  autoFill?: boolean;
};

export type ERPTableLayout = {
  /** CSS height for the scroll container. */
  bodyHeight: number | '100%';
  /** Actual inner height of the scroll container (px) — the virtual viewport. */
  viewportHeight: number;
};

/**
 * Layout only. It deliberately does **not** change `pagination.pageSize`:
 * page size comes from `recordPerPage` / `tableHeight / rowHeight` at
 * bootstrap. The previous version dispatched `CHANGE_PAGE_SIZE` from the
 * measured height, which shrank pages (fewer rows rendered than configured).
 */
export function useERPTableLayout({
  rootRef,
  bodyRef,
  tableHeight,
  ready = false,
  autoFill = false,
}: UseERPTableLayoutOptions): ERPTableLayout {
  const [autoHeight, setAutoHeight] = useState<number | null>(null);
  const [measured, setMeasured] = useState<number | null>(null);
  const fill = autoFill && tableHeight == null;

  const measureRootHeight = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const top = root.getBoundingClientRect().top;
    const available = window.innerHeight - top - VIEWPORT_BOTTOM_GAP;
    const next = Math.max(MIN_TABLE_HEIGHT, Math.floor(available));
    setAutoHeight((prev) => (prev === next ? prev : next));
  }, [rootRef]);

  // Window-fill height (virtual mode without an explicit tableHeight).
  useEffect(() => {
    if (!ready || !fill) return;

    const frame = requestAnimationFrame(measureRootHeight);
    window.addEventListener('resize', measureRootHeight);
    const parent = rootRef.current?.parentElement;
    const observer =
      parent && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(measureRootHeight)
        : null;
    if (parent && observer) observer.observe(parent);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measureRootHeight);
      observer?.disconnect();
    };
  }, [measureRootHeight, fill, ready, rootRef]);

  // Real inner height of the scroll container → virtual window size.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      const h = el.clientHeight;
      if (h > 0) setMeasured((prev) => (prev === h ? prev : h));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [bodyRef, ready]);

  const bodyHeight: number | '100%' =
    tableHeight ??
    (fill ? (autoHeight ?? DEFAULT_VIRTUAL_BODY_HEIGHT) : '100%');

  const viewportHeight =
    measured ??
    (typeof bodyHeight === 'number' ? bodyHeight : DEFAULT_VIRTUAL_BODY_HEIGHT);

  return { bodyHeight, viewportHeight };
}
