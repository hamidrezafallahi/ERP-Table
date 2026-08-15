import { useEffect, useRef, useState } from 'react';

import { UITableController } from '../../infrastructure/ui/UITableController';
import type { TableViewState } from '../../engine/type';

export function useControllerSelector<T>(
  controller: UITableController,
  getter: () => T,
  isEqual: (previous: T, next: T) => boolean = Object.is,
): T {
  const [value, setValue] = useState(() => getter());
  const getterRef = useRef(getter);
  const isEqualRef = useRef(isEqual);
  getterRef.current = getter;
  isEqualRef.current = isEqual;

  useEffect(() => {
    const unsubscribe = controller.subscribe(() => {
      const next = getterRef.current();
      setValue((previous) =>
        isEqualRef.current(previous, next) ? previous : next,
      );
    });

    return () => unsubscribe?.();
  }, [controller]);

  return value;
}

export function useEngineSelector<T>(
  controller: UITableController,
  selector: (view: TableViewState | undefined) => T,
  isEqual: (previous: T, next: T) => boolean = Object.is,
): T {
  return useControllerSelector(
    controller,
    () => selector(controller.getViewState()),
    isEqual,
  );
}

export function jsonEqual<T>(previous: T, next: T): boolean {
  return JSON.stringify(previous) === JSON.stringify(next);
}

export function useGridSearchState(controller: UITableController) {
  return useEngineSelector(
    controller,
    (view) => view?.gridSearch ?? null,
    jsonEqual,
  );
}

export function useMobileEditorState(controller: UITableController) {
  return useEngineSelector(
    controller,
    (view) => view?.mobileEditor ?? null,
    jsonEqual,
  );
}
