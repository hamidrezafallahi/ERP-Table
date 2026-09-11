"use client";

import React, { useRef } from 'react';

import { clampColumnWidth, type ColumnWidthHint } from '../../engine/columnWidth';

type Props = {
  columnId: string;
  currentWidth: number;
  column: ColumnWidthHint;
  direction: 'rtl' | 'ltr';
  onResize: (width: number) => void;
};

export function ColumnResizeHandle({
  columnId,
  currentWidth,
  column,
  direction,
  onResize,
}: Props) {
  const drag = useRef<{ startX: number; startW: number } | null>(null);

  const endDrag = (target: HTMLElement, pointerId: number) => {
    drag.current = null;
    document.body.classList.remove('erp-col-resizing');
    try {
      target.releasePointerCapture(pointerId);
    } catch {
      /* already released */
    }
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize column"
      data-erp-col-resize={columnId}
      className="erp-col-resize"
      onDragStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { startX: e.clientX, startW: currentWidth };
        document.body.classList.add('erp-col-resizing');
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const delta =
          direction === 'rtl'
            ? drag.current.startX - e.clientX
            : e.clientX - drag.current.startX;
        onResize(clampColumnWidth(drag.current.startW + delta, column));
      }}
      onPointerUp={(e) => {
        endDrag(e.currentTarget, e.pointerId);
      }}
      onPointerCancel={(e) => {
        endDrag(e.currentTarget, e.pointerId);
      }}
      onLostPointerCapture={() => {
        drag.current = null;
        document.body.classList.remove('erp-col-resizing');
      }}
    />
  );
}
