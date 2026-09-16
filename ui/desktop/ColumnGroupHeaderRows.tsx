"use client";

import React from 'react';

import type { ColumnSchema } from '../../bootstrap/type';
import {
  buildColumnGroupHeaderModel,
  type ColumnGroupHeaderCell,
} from '../../engine/dataOps/columnGroups';
import { columnSizeStyle } from '../../engine/columnWidth';
import type { ColumnWindowModel } from '../virtual/columnWindow';

type Props = {
  allVisible: ColumnSchema[];
  colWindow: ColumnWindowModel;
  columnWidths?: Record<string, number>;
  collapsedGroups: Record<string, true>;
  onToggleGroup: (groupId: string) => void;
  onGroupDragStart?: (groupId: string, leafFields: readonly string[]) => void;
};

function segmentWidth(
  columns: readonly ColumnSchema[],
  columnWidths: Record<string, number> | undefined,
  layoutWidths: Record<string, number>,
): number {
  return columns.reduce((sum, col) => {
    const size = columnSizeStyle(col, columnWidths, layoutWidths);
    return sum + size.width;
  }, 0);
}

function renderGroupCell(
  cell: ColumnGroupHeaderCell,
  columns: readonly ColumnSchema[],
  columnWidths: Record<string, number> | undefined,
  layoutWidths: Record<string, number>,
  onToggleGroup: (groupId: string) => void,
  onGroupDragStart?: Props['onGroupDragStart'],
) {
  const width = segmentWidth(columns, columnWidths, layoutWidths);
  return (
    <th
      key={`${cell.level}-${cell.groupId}`}
      role="columnheader"
      colSpan={cell.colspan}
      aria-colspan={cell.colspan}
      data-erp-col-group={cell.groupId}
      className="erp-col-group-header relative px-2 text-xs border text-center whitespace-nowrap bg-gray-gray3"
      style={{ width, minWidth: width }}
      draggable={Boolean(onGroupDragStart)}
      onDragStart={(e) => {
        if (!onGroupDragStart) return;
        e.dataTransfer.setData('text/plain', cell.groupId);
        e.dataTransfer.effectAllowed = 'move';
        onGroupDragStart(cell.groupId, cell.leafFields);
      }}
    >
      <button
        type="button"
        className="erp-col-group-toggle inline-flex items-center gap-1"
        aria-expanded={!cell.collapsed}
        aria-label={cell.collapsed ? 'Expand group' : 'Collapse group'}
        data-pdg-no-sort
        onClick={() => onToggleGroup(cell.groupId)}
      >
        <span aria-hidden>{cell.collapsed ? '▸' : '▾'}</span>
        <span>{cell.headerName}</span>
      </button>
    </th>
  );
}

function renderZoneGroupRow(
  zoneColumns: ColumnSchema[],
  level: number,
  rowCells: ColumnGroupHeaderCell[],
  columnWidths: Record<string, number> | undefined,
  layoutWidths: Record<string, number>,
  onToggleGroup: (groupId: string) => void,
  onGroupDragStart?: Props['onGroupDragStart'],
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const fieldSet = new Set(zoneColumns.map((c) => c.fieldName));
  let colCursor = 0;

  for (const cell of rowCells) {
    const colsInZone = cell.leafFields
      .map((f) => zoneColumns.find((c) => c.fieldName === f))
      .filter((c): c is ColumnSchema => Boolean(c));
    if (colsInZone.length === 0) continue;

    const startIdx = zoneColumns.findIndex((c) => c.fieldName === colsInZone[0]!.fieldName);
    while (colCursor < startIdx) {
      const gapCol = zoneColumns[colCursor]!;
      const gapSize = columnSizeStyle(gapCol, columnWidths, layoutWidths);
      nodes.push(
        <th
          key={`gap-${level}-${gapCol.fieldName}`}
          role="columnheader"
          aria-hidden
          style={{ width: gapSize.width, minWidth: gapSize.width, padding: 0, border: 'none' }}
        />,
      );
      colCursor += 1;
    }

    if (!cell.leafFields.some((f) => fieldSet.has(f))) continue;

    nodes.push(
      renderGroupCell(
        { ...cell, colspan: colsInZone.length },
        colsInZone,
        columnWidths,
        layoutWidths,
        onToggleGroup,
        onGroupDragStart,
      ),
    );
    colCursor += colsInZone.length;
  }

  while (colCursor < zoneColumns.length) {
    const gapCol = zoneColumns[colCursor]!;
    const gapSize = columnSizeStyle(gapCol, columnWidths, layoutWidths);
    nodes.push(
      <th
        key={`tail-gap-${level}-${gapCol.fieldName}`}
        role="presentation"
        aria-hidden
        style={{ width: gapSize.width, minWidth: gapSize.width, padding: 0, border: 'none' }}
      />,
    );
    colCursor += 1;
  }

  return nodes;
}

export function ColumnGroupHeaderRows({
  allVisible,
  colWindow,
  columnWidths,
  collapsedGroups,
  onToggleGroup,
  onGroupDragStart,
}: Props) {
  const visible = allVisible.filter((c) => !c.hidden);
  const model = buildColumnGroupHeaderModel(visible, collapsedGroups);
  if (model.maxDepth === 0) return null;

  const layoutWidths = colWindow.layoutWidths;

  return (
    <>
      {model.rows.map((rowCells, level) => (
        <tr
          key={`group-row-${level}`}
          role="row"
          aria-rowindex={level + 1}
          className="erp-col-group-row bg-gray-gray3"
          data-erp-col-group-level={level}
        >
          {renderZoneGroupRow(
            colWindow.pinnedStart,
            level,
            rowCells,
            columnWidths,
            layoutWidths,
            onToggleGroup,
            onGroupDragStart,
          )}
          {colWindow.spacerStart > 0 ? (
            <th
              aria-hidden
              role="presentation"
              style={{ width: colWindow.spacerStart, minWidth: colWindow.spacerStart, padding: 0, border: 'none' }}
            />
          ) : null}
          {renderZoneGroupRow(
            colWindow.scrollable,
            level,
            rowCells,
            columnWidths,
            layoutWidths,
            onToggleGroup,
            onGroupDragStart,
          )}
          {colWindow.spacerEnd > 0 ? (
            <th
              aria-hidden
              role="presentation"
              style={{ width: colWindow.spacerEnd, minWidth: colWindow.spacerEnd, padding: 0, border: 'none' }}
            />
          ) : null}
          {renderZoneGroupRow(
            colWindow.pinnedEnd,
            level,
            rowCells,
            columnWidths,
            layoutWidths,
            onToggleGroup,
            onGroupDragStart,
          )}
        </tr>
      ))}
    </>
  );
}
