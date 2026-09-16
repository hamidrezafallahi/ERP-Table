"use client";



import React, {

  createContext,

  useContext,

  useEffect,

  useMemo,

  useState,

  type ReactNode,

  type RefObject,

} from 'react';



import type { ColumnSchema } from '../../bootstrap/type';

import { partitionColumnsByPin, sumColumnWidths } from '../../engine/dataOps/columnPin';
import { computeLayoutColumnWidths } from '../../engine/dataOps/columnLayout';
import { resolveColumnWidth } from '../../engine/columnWidth';

import { ViewportCalculator } from '../../engine/ViewportCalculator';

import { useDirection } from '../host';



export type ColumnWindowModel = {

  /** Full non-hidden column list (document order). */

  allVisible: ColumnSchema[];

  /** Inline-start pinned columns (includes index). */

  pinnedStart: ColumnSchema[];

  /** @deprecated alias for pinnedStart */

  pinned: ColumnSchema[];

  pinnedEnd: ColumnSchema[];

  /** Visible scrollable slice only. */

  scrollable: ColumnSchema[];

  /** Absolute indices into `allVisible` for scrollable slice entries. */

  scrollableAbsIndices: number[];

  spacerStart: number;

  spacerEnd: number;

  pinnedStartWidth: number;

  /** @deprecated alias for pinnedStartWidth */

  pinnedWidth: number;

  pinnedEndWidth: number;

  startPinOffsets: Record<string, number>;

  endPinOffsets: Record<string, number>;

  totalWidth: number;

  /** Effective widths after flex distribution (PR-112). */
  layoutWidths: Record<string, number>;

  /** Number of `<th>` / data cells that should mount (pins + slice + spacers). */

  mountedScrollableCount: number;

};



const EMPTY: ColumnWindowModel = {

  allVisible: [],

  pinnedStart: [],

  pinned: [],

  pinnedEnd: [],

  scrollable: [],

  scrollableAbsIndices: [],

  spacerStart: 0,

  spacerEnd: 0,

  pinnedStartWidth: 0,

  pinnedWidth: 0,

  pinnedEndWidth: 0,

  startPinOffsets: {},

  endPinOffsets: {},

  totalWidth: 0,

  layoutWidths: {},

  mountedScrollableCount: 0,

};



const ColumnWindowContext = createContext<ColumnWindowModel>(EMPTY);



/** Normalize scroll position to distance from inline-start (px ≥ 0). */

export function scrollOffsetFromInlineStart(

  el: HTMLElement,

  direction: 'rtl' | 'ltr',

): number {

  const { scrollLeft, scrollWidth, clientWidth } = el;

  if (direction === 'ltr') return Math.max(0, scrollLeft);

  if (scrollLeft < 0) return Math.max(0, -scrollLeft);

  const max = Math.max(0, scrollWidth - clientWidth);

  return Math.max(0, max - scrollLeft);

}



export function buildColumnWindowModel(

  allVisible: ColumnSchema[],

  columnWidths: Record<string, number> | undefined,

  scrollOffset: number,

  viewportSize: number,

  overscan = 1,

  flexContainerWidth = viewportSize,

): ColumnWindowModel {

  const layoutWidths = computeLayoutColumnWidths(
    allVisible,
    columnWidths,
    flexContainerWidth,
  );

  const widthOf = (col: ColumnSchema) =>
    layoutWidths[col.fieldName] ?? resolveColumnWidth(col, columnWidths);



  const { pinnedStart, scrollable: scrollableAll, pinnedEnd, scrollableAbs } =

    partitionColumnsByPin(allVisible);



  const pinnedStartWidth = sumColumnWidths(pinnedStart, widthOf);

  const pinnedEndWidth = sumColumnWidths(pinnedEnd, widthOf);



  const scrollableWidths = scrollableAll.map(widthOf);

  const range = ViewportCalculator.calculateColumns(

    scrollableWidths,

    scrollOffset,

    viewportSize,

    pinnedStartWidth,

    overscan,

    pinnedEndWidth,

  );

  const scrollable = scrollableAll.slice(range.startIndex, range.endIndex);

  const scrollableAbsIndices = scrollableAbs.slice(

    range.startIndex,

    range.endIndex,

  );

  const totalScrollable = range.totalScrollableWidth;

  const spacerCells =

    (range.spacerStart > 0 ? 1 : 0) + (range.spacerEnd > 0 ? 1 : 0);



  let startCursor = 0;

  const startPinOffsets: Record<string, number> = {};

  for (const col of pinnedStart) {

    startPinOffsets[col.fieldName] = startCursor;

    startCursor += widthOf(col);

  }



  let endCursor = 0;

  const endPinOffsets: Record<string, number> = {};

  for (let i = pinnedEnd.length - 1; i >= 0; i -= 1) {

    const col = pinnedEnd[i]!;

    endPinOffsets[col.fieldName] = endCursor;

    endCursor += widthOf(col);

  }



  return {

    allVisible,

    pinnedStart,

    pinned: pinnedStart,

    pinnedEnd,

    scrollable,

    scrollableAbsIndices,

    spacerStart: range.spacerStart,

    spacerEnd: range.spacerEnd,

    pinnedStartWidth,

    pinnedWidth: pinnedStartWidth,

    pinnedEndWidth,

    startPinOffsets: startPinOffsets,

    endPinOffsets,

    totalWidth: pinnedStartWidth + totalScrollable + pinnedEndWidth,

    layoutWidths,

    mountedScrollableCount: scrollable.length + spacerCells,

  };

}



type ProviderProps = {

  scrollRef: RefObject<HTMLElement | null>;

  columns: ColumnSchema[];

  columnWidths?: Record<string, number>;

  overscan?: number;

  onViewportWidthChange?: (width: number) => void;

  children: ReactNode;

};



export function ColumnWindowProvider({

  scrollRef,

  columns,

  columnWidths,

  overscan = 1,

  onViewportWidthChange,

  children,

}: ProviderProps) {

  const direction = useDirection();

  const [scrollOffset, setScrollOffset] = useState(0);

  const [viewportSize, setViewportSize] = useState(1024);



  const allVisible = useMemo(

    () => columns.filter((c) => !c.hidden),

    [columns],

  );



  useEffect(() => {

    const el = scrollRef.current;

    if (!el) return;



    const update = () => {

      setScrollOffset(scrollOffsetFromInlineStart(el, direction));

      const w = el.clientWidth || 1024;

      setViewportSize(w);

      onViewportWidthChange?.(w);

    };

    update();

    el.addEventListener('scroll', update, { passive: true });

    const ro =

      typeof ResizeObserver !== 'undefined'

        ? new ResizeObserver(() => update())

        : null;

    ro?.observe(el);

    return () => {

      el.removeEventListener('scroll', update);

      ro?.disconnect();

    };

  }, [scrollRef, direction, allVisible.length, columnWidths, onViewportWidthChange]);



  const value = useMemo(

    () =>

      buildColumnWindowModel(

        allVisible,

        columnWidths,

        scrollOffset,

        viewportSize,

        overscan,

      ),

    [allVisible, columnWidths, scrollOffset, viewportSize, overscan],

  );



  return (

    <ColumnWindowContext.Provider value={value}>

      {children}

    </ColumnWindowContext.Provider>

  );

}



export function useColumnWindow(): ColumnWindowModel {

  return useContext(ColumnWindowContext);

}



/** Fallback when provider is absent: render every visible column. */

export function useColumnWindowOrAll(

  columns: ColumnSchema[],

  columnWidths?: Record<string, number>,

): ColumnWindowModel {

  const ctx = useContext(ColumnWindowContext);

  const allVisible = columns.filter((c) => !c.hidden);

  if (ctx.allVisible.length > 0) return ctx;

  return buildColumnWindowModel(allVisible, columnWidths, 0, 1e9, 0, 0);

}


