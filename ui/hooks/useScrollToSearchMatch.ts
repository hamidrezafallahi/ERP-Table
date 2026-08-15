import { RefObject, useEffect, useLayoutEffect, useRef } from 'react';

import { UITableController } from '../../infrastructure/ui/UITableController';
import type { GridSearchState } from '../../engine/type';
import { useEngineSelector, useGridSearchState } from './useEngineSelector';
import {
  applyScrollToMatch,
  buildSearchScrollKey,
  restoreScrollPosition,
} from '../gridSearch/scrollToMatch';

const RESTORE_WINDOW_MS = 800;

function jsonEqual<T>(previous: T, next: T): boolean {
  return JSON.stringify(previous) === JSON.stringify(next);
}

export function useScrollToSearchMatch(
  scrollRef: RefObject<HTMLElement | null>,
  controller: UITableController,
) {
  const gridSearch = useGridSearchState(controller);
  const activeRowId = useEngineSelector(
    controller,
    () => controller.getActiveRow(),
    Object.is,
  );
  const currentPage = useEngineSelector(
    controller,
    (view) => view?.pagination.page ?? 1,
    Object.is,
  );

  const savedScrollRef = useRef<{
    key: string;
    left: number;
    top: number;
  } | null>(null);
  const restoreUntilRef = useRef(0);

  const getActiveMatch = (search: GridSearchState | null) => {
    if (!search || search.currentIndex < 0 || !search.matches.length) {
      return null;
    }
    return search.matches[search.currentIndex];
  };

  const persistScroll = (key: string) => {
    const container = scrollRef.current;
    if (!container) return;

    savedScrollRef.current = {
      key,
      left: container.scrollLeft,
      top: container.scrollTop,
    };
    restoreUntilRef.current = Date.now() + RESTORE_WINDOW_MS;
  };

  const restoreIfNeeded = () => {
    const container = scrollRef.current;
    const saved = savedScrollRef.current;
    if (!container || !saved) return;
    if (Date.now() > restoreUntilRef.current) return;

    restoreScrollPosition(container, saved.left, saved.top);
  };

  const scrollToActiveMatch = (search: GridSearchState | null): boolean => {
    const container = scrollRef.current;
    const match = getActiveMatch(search);
    if (!container || !match) return false;

    if (activeRowId !== match.rowId) return false;

    const key = buildSearchScrollKey(search!, match);
    const applied = applyScrollToMatch(container, match);
    if (applied) {
      persistScroll(key);
    }
    return applied;
  };

  useLayoutEffect(() => {
    if (!gridSearch) {
      savedScrollRef.current = null;
      restoreUntilRef.current = 0;
      return;
    }

    const match = getActiveMatch(gridSearch);
    const key = match ? buildSearchScrollKey(gridSearch, match) : null;

    if (key && savedScrollRef.current?.key === key) {
      restoreIfNeeded();
    } else {
      savedScrollRef.current = null;
    }

    scrollToActiveMatch(gridSearch);
    restoreIfNeeded();
  }, [gridSearch, activeRowId, currentPage, controller, scrollRef]);

  useEffect(() => {
    if (!gridSearch) return;

    let frame1 = 0;
    let frame2 = 0;

    frame1 = requestAnimationFrame(() => {
      restoreIfNeeded();
      const applied = scrollToActiveMatch(gridSearch);
      restoreIfNeeded();

      if (!applied) {
        frame2 = requestAnimationFrame(() => {
          scrollToActiveMatch(gridSearch);
          restoreIfNeeded();
        });
      }
    });

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [gridSearch, activeRowId, currentPage, controller, scrollRef]);

  useEffect(() => {
    const unsubscribe = controller.subscribe(() => {
      if (!savedScrollRef.current) return;
      if (Date.now() > restoreUntilRef.current) return;

      requestAnimationFrame(() => {
        restoreIfNeeded();
      });
    });

    return () => unsubscribe?.();
  }, [controller, scrollRef]);
}
