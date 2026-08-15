import {
  RefObject,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { UITableController } from '../../infrastructure/ui/UITableController';

const RECORD_HEIGHT = 40;
const TABLE_HEADER_HEIGHT = 40;
const VIEWPORT_BOTTOM_GAP = 20;
const MIN_TABLE_HEIGHT = 240;

type UseERPTableLayoutOptions = {
  rootRef: RefObject<HTMLDivElement | null>;
  bodyRef: RefObject<HTMLDivElement | null>;
  controller: UITableController | null;
  tableHeight?: number;
  ready?: boolean;
};

export function useERPTableLayout({
  rootRef,
  bodyRef,
  controller,
  tableHeight,
  ready = false,
}: UseERPTableLayoutOptions) {
  const [autoHeight, setAutoHeight] = useState<number | null>(null);

  const measureRootHeight = useCallback(() => {
    if (tableHeight != null) return;

    const root = rootRef.current;
    if (!root) return;

    const top = root.getBoundingClientRect().top;
    const available = window.innerHeight - top - VIEWPORT_BOTTOM_GAP;
    setAutoHeight(Math.max(MIN_TABLE_HEIGHT, Math.floor(available)));
  }, [tableHeight, rootRef]);

  useEffect(() => {
    if (!ready) return;
    if (tableHeight != null) return;

    const frame = requestAnimationFrame(measureRootHeight);
    window.addEventListener('resize', measureRootHeight);

    const parent = rootRef.current?.parentElement;
    const observer = parent ? new ResizeObserver(measureRootHeight) : null;
    if (parent && observer) {
      observer.observe(parent);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measureRootHeight);
      observer?.disconnect();
    };
  }, [measureRootHeight, tableHeight, ready]);

  useEffect(() => {
    if (!controller) return;

    const syncPageSize = (height: number) => {
      if (height < RECORD_HEIGHT * 2) return;

      const rowsArea = Math.max(0, height - TABLE_HEADER_HEIGHT);
      const pageSize = Math.max(3, Math.floor(rowsArea / RECORD_HEIGHT));
      const table = controller.getViewState();

      if (table && table.pagination.pageSize !== pageSize) {
        void controller.dispatch({ type: 'CHANGE_PAGE_SIZE', pageSize });
      }
    };

    if (tableHeight != null) {
      syncPageSize(tableHeight);
      return;
    }

    if (!bodyRef.current) return;

    const updatePageSize = () => {
      syncPageSize(bodyRef.current?.clientHeight ?? 0);
    };

    updatePageSize();
    const observer = new ResizeObserver(updatePageSize);
    observer.observe(bodyRef.current);

    return () => observer.disconnect();
  }, [controller, bodyRef, tableHeight, autoHeight]);

  return {
    bodyHeight: tableHeight ?? autoHeight,
  };
}
