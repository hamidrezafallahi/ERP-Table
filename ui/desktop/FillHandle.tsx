import React from 'react';

import { resolveCellAddressFromPoint } from '../../infrastructure/ui/gridFillHandle';
import type { UITableController } from '../../infrastructure/ui/UITableController';

type FillHandleProps = {
  controller: UITableController;
};

export function FillHandle({ controller }: FillHandleProps) {
  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const copyOnly = event.ctrlKey;
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);

    const onPointerUp = async (ev: PointerEvent) => {
      if (handle.hasPointerCapture(ev.pointerId)) {
        handle.releasePointerCapture(ev.pointerId);
      }
      window.removeEventListener('pointerup', onPointerUp);
      const cell = resolveCellAddressFromPoint(ev.clientX, ev.clientY);
      if (!cell) return;
      await controller.applyFillHandleDrag(
        { rowIndex: cell.rowIndex, colIndex: cell.colIndex },
        copyOnly,
      );
    };

    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <button
      type="button"
      className="pdg-fill-handle"
      aria-label="Fill handle"
      title="Drag to fill. Ctrl+drag to copy."
      onPointerDown={onPointerDown}
    />
  );
}
