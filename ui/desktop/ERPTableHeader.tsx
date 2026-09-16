import React, { type ReactNode, useEffect, useRef, useState } from 'react';
import { CustomDropdownButton, CustomCheckbox } from '../primitives';

import { ColumnSchema } from '../../bootstrap/type';
import { resolveColumnReorder } from '../../engine/columnReorder';
import { columnSizeStyle, isIndexColumn } from '../../engine/columnWidth';
import {
  isColumnFilterActive,
  resolveFilterUi,
  type ColumnFilter,
  type FilterModel,
} from '../../engine/dataOps/filterModel';
import {
  ariaSortForColumn,
  cycleSortModel,
  HEADER_SORT_CLICK_MAX_MOVE_PX,
  isHeaderColumnSortable,
  shouldCommitHeaderSortClick,
  sortPriorityForColumn,
} from '../../engine/dataOps/sortModel';
import { ValidationCallbackResult } from '../../engine/type';
import { UITableController } from '../../infrastructure/ui/UITableController';
import { revealRow } from '../gridSearch/utils';
import {
  resolveFilterComponent,
  type FilterComponentMap,
} from '../filters';
import { useDirection, useERPTableHost, useTranslations } from '../host';
import { useColumnWindowOrAll } from '../virtual/columnWindow';
import { ColumnWindowCells } from '../virtual/ColumnWindowCells';
import {
  ARIA_HEADER_ROW_INDEX,
  ariaColIndex,
} from '../a11y/gridRoles';
import { columnPinCellProps, columnPinClassName } from '../columnPin';
import { ColumnFilterPopover } from './ColumnFilterPopover';
import { ColumnGroupHeaderRows } from './ColumnGroupHeaderRows';
import { ColumnMenuPopover } from './ColumnMenuPopover';
import { ColumnsPanelPopover } from './ColumnsPanelPopover';
import { ColumnResizeHandle } from './ColumnResizeHandle';
import {
  maxColumnGroupDepth,
  resolveGroupBlockReorder,
} from '../../engine/dataOps/columnGroups';

interface Props {
  controller: UITableController;
  tableKey: string;
  header?: ReactNode;
  /** Optional floating filter row under the header (PR-94). */
  floatingFilter?: boolean;
  /** Custom filter UI registry (PR-95). */
  filterComponents?: FilterComponentMap;
}

function isInteractiveHeaderTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      '.erp-col-resize, button, input, [role="checkbox"], [data-pdg-no-sort], [data-pdg-filter-btn], [data-pdg-col-menu-btn]',
    ),
  );
}

function floatingFilterValue(
  model: FilterModel,
  colId: string,
): string {
  const entry = model[colId];
  if (!entry || !('filterType' in entry)) return '';
  if (entry.filterType === 'text') return String(entry.filter ?? '');
  if (entry.filterType === 'number') return String(entry.filter ?? '');
  if (entry.filterType === 'date') {
    return String(entry.dateFrom ?? entry.filter ?? '');
  }
  return '';
}

function applyFloatingFilter(
  model: FilterModel,
  col: ColumnSchema,
  raw: string,
): FilterModel {
  const ui = resolveFilterUi(col);
  const next: Record<string, ColumnFilter> = { ...model };
  if (!ui || ui.mode !== 'builtin' || raw.trim() === '') {
    delete next[col.fieldName];
    return next;
  }
  const kind = ui.kind;
  if (kind === 'number') {
    next[col.fieldName] = {
      filterType: 'number',
      type: 'equals',
      filter: raw,
    };
  } else if (kind === 'date') {
    next[col.fieldName] = {
      filterType: 'date',
      type: 'equals',
      dateFrom: raw,
    };
  } else if (kind === 'boolean') {
    const v = raw.trim().toLowerCase();
    next[col.fieldName] = {
      filterType: 'boolean',
      type: v === 'true' || v === '1' ? 'true' : v === 'false' || v === '0' ? 'false' : 'any',
    };
  } else {
    next[col.fieldName] = {
      filterType: 'text',
      type: 'contains',
      filter: raw,
    };
  }
  return next;
}

export function ERPTableHeader({
  controller,
  tableKey,
  header,
  floatingFilter = false,
  filterComponents,
}: Props) {
  const direction = useDirection();
  const t = useTranslations();
  const host = useERPTableHost();
  const filters = filterComponents ?? host.filterComponents;
  const columnMenuItems = host.columnMenuItems;
  const onColumnMenuAction = host.onColumnMenuAction;
  const table = controller.getViewState();
  const draggedFieldRef = useRef<string | null>(null);
  const draggedGroupRef = useRef<string | null>(null);
  const pointerOriginRef = useRef<{ x: number; y: number } | null>(null);
  const suppressSortClickRef = useRef(false);
  const filterBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const menuBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const columnsPanelAnchorRef = useRef<HTMLButtonElement | null>(null);
  const [dropField, setDropField] = useState<string | null>(null);
  const [openFilterCol, setOpenFilterCol] = useState<string | null>(null);
  const [openMenuCol, setOpenMenuCol] = useState<string | null>(null);
  const [openColumnsPanel, setOpenColumnsPanel] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationCallbackResult>({
      valid: true,
      data: null,
      errors: new Map(),
    });

  useEffect(() => {
    const validation = controller.validation();
    validation((res) => {
      setValidationResult(res);
    });
  }, [controller, table?.activeCell?.columnId, table?.activeCell?.rowId]);

  const displayColumns = table?.columns ?? [];
  const collapsedGroups = table?.collapsedColumnGroups ?? {};
  const colWindow = useColumnWindowOrAll(displayColumns, table?.columnWidths);
  const groupDepth = maxColumnGroupDepth(displayColumns);

  if (!table || !table.columns) return null;

  const visibleColumns = displayColumns.filter((c: ColumnSchema) => !c.hidden);
  const sortModel = table.sortModel ?? [];
  const filterModel = table.filterModel ?? {};
  const isSelectedActivePageRows = table.rows.every(
    (row) => !!table.selectedRows[row.id],
  );
  const handleSelectActivePageRows = () => {
    controller.dispatch({type: "TOGGLE_PAGE_ROW_SELECTED"});
  };
  const allRows = controller.getAllRows() ?? [];
  const handleNavigateToError = (rowId: number) => {
    void revealRow(controller, rowId);
  };
  const items = Array.from((validationResult.errors ?? new Map()).entries()).map(
    ([key, value], errorIndex) => {
      const Index = allRows.findIndex((r) => r.id.value == value.rowId) + 1;

      return {
        key: errorIndex.toString(),

        label: (
          <button
            className="flex bg-red-300 text-red-600 text-xs"
            onClick={() => {
              handleNavigateToError(value.rowId);
            }}
          >
            {`${t('general.validationInRow')} ${Index} ${t('general.validationInColumn')} ${value.caption} : ${value.message}`}
          </button>
        ),
      };
    },
  );
  const cols = visibleColumns.length;

  const renderHeaderColumn = (col: ColumnSchema, index: number) => {
    const size = columnSizeStyle(col, table.columnWidths, colWindow.layoutWidths);
    const handle = (
      <ColumnResizeHandle
        columnId={col.fieldName}
        currentWidth={size.width}
        column={col}
        direction={direction}
        onResize={(width) => {
          void controller.dispatch({
            type: "UI_RESIZE_COLUMN",
            columnId: col.fieldName,
            width,
          });
        }}
        onAutoSize={() => controller.autoSizeColumns([col.fieldName])}
      />
    );
    const pin = columnPinCellProps(col, colWindow.startPinOffsets, colWindow.endPinOffsets);
    if (isIndexColumn(col)) {
      return (
        <th
          key={col.fieldName}
          role="columnheader"
          aria-colindex={ariaColIndex(index)}
          style={{...col.style, ...size, ...pin.style}}
          className={`relative px-2 text-xs border  text-start whitespace-nowrap ${pin.className} ${col.className || ""}`}
          data-erp-col-pin={pin['data-erp-col-pin']}
        >
          <div className="flex items-center gap-2">
            <CustomCheckbox
              checked={isSelectedActivePageRows}
              onClick={handleSelectActivePageRows}
              aria-label={t("general.toggle")}
            />

            {col.fieldCaption}
          </div>
          {handle}
        </th>
      );
    }

    const sortable = isHeaderColumnSortable(col);
    const filterUi = resolveFilterUi(col);
    const customFilter =
      filterUi?.mode === 'custom'
        ? resolveFilterComponent(filterUi.name, filters)
        : undefined;
    const filterable =
      filterUi != null &&
      (filterUi.mode === 'builtin' || customFilter != null);
    const filterActive = isColumnFilterActive(filterModel, col.fieldName);
    const ariaSort = sortable
      ? ariaSortForColumn(sortModel, col.fieldName)
      : undefined;
    const priority = sortPriorityForColumn(sortModel, col.fieldName);
    const showPriority = priority != null && sortModel.length > 1;

    return (
      <th
        key={col.fieldName}
        role="columnheader"
        aria-colindex={ariaColIndex(index)}
        aria-sort={ariaSort}
        style={{...col.style, ...size, ...pin.style}}
        className={`relative px-2 text-xs border text-start min-w-36 ${pin.className} ${col.className || ""}`}
        data-erp-col-pin={pin['data-erp-col-pin']}
        data-erp-col-drag={col.fieldName}
        data-erp-col-drop={dropField === col.fieldName ? col.fieldName : undefined}
        data-pdg-sortable={sortable ? 'true' : undefined}
        data-pdg-filterable={filterable ? 'true' : undefined}
        data-pdg-filter-active={filterActive ? 'true' : undefined}
        data-pdg-filter-custom={
          filterUi?.mode === 'custom' ? filterUi.name : undefined
        }
        data-pdg-sort-move-px={HEADER_SORT_CLICK_MAX_MOVE_PX}
        draggable
        onPointerDown={markPointerOrigin}
        onPointerMove={trackPointerMove}
        onClick={(e) => commitHeaderSort(e, col.fieldName, sortable)}
        onDragStart={(e) => beginColumnDrag(e, col.fieldName)}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          hoverColumnDrop(col.fieldName);
        }}
        onDragLeave={(e) => {
          leaveColumnDrop(
            col.fieldName,
            e.currentTarget,
            e.relatedTarget,
          );
        }}
        onDrop={(e) => {
          e.preventDefault();
          dropColumn(col.fieldName);
        }}
        onDragEnd={endColumnDrag}
      >
        <div className="pdg-header-label">
          <span className="pdg-header-caption">{col.fieldCaption}</span>
          {sortable ? (
            <span className="pdg-sort-indicator" aria-hidden>
              {ariaSort === 'ascending' ? (
                <span className="pdg-sort-icon pdg-sort-icon--asc">▲</span>
              ) : null}
              {ariaSort === 'descending' ? (
                <span className="pdg-sort-icon pdg-sort-icon--desc">▼</span>
              ) : null}
              {showPriority ? (
                <span className="pdg-sort-priority">{priority}</span>
              ) : null}
            </span>
          ) : null}
          {filterable ? (
            <button
              type="button"
              className={`pdg-filter-btn-icon${filterActive ? ' is-active' : ''}`}
              data-pdg-filter-btn={col.fieldName}
              data-pdg-no-sort
              aria-label={t('general.filter')}
              aria-expanded={openFilterCol === col.fieldName}
              title={filterActive ? t('general.filterActive') : t('general.filter')}
              ref={(el) => {
                filterBtnRefs.current[col.fieldName] = el;
              }}
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuCol(null);
                setOpenFilterCol((cur) =>
                  cur === col.fieldName ? null : col.fieldName,
                );
              }}
            >
              ▽
            </button>
          ) : null}
          <button
            type="button"
            className="pdg-col-menu-btn"
            data-pdg-col-menu-btn={col.fieldName}
            data-pdg-no-sort
            aria-label={t('columnMenu.open')}
            aria-haspopup="menu"
            aria-expanded={openMenuCol === col.fieldName}
            title={t('columnMenu.open')}
            ref={(el) => {
              menuBtnRefs.current[col.fieldName] = el;
              if (openColumnsPanel && openMenuCol === col.fieldName) {
                columnsPanelAnchorRef.current = el;
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              setOpenFilterCol(null);
              setOpenColumnsPanel(false);
              setOpenMenuCol((cur) =>
                cur === col.fieldName ? null : col.fieldName,
              );
            }}
          >
            ⋮
          </button>
        </div>
        {openMenuCol === col.fieldName ? (
          <ColumnMenuPopover
            column={col}
            controller={controller}
            sortModel={sortModel}
            filterModel={filterModel}
            itemsConfig={columnMenuItems}
            onCustomAction={onColumnMenuAction}
            open
            onOpenChange={(next) => {
              if (!next) setOpenMenuCol(null);
            }}
            anchorRef={{
              get current() {
                return menuBtnRefs.current[col.fieldName] ?? null;
              },
            }}
            onOpenFilter={() => {
              setOpenMenuCol(null);
              setOpenFilterCol(col.fieldName);
            }}
            onOpenColumnsPanel={() => {
              columnsPanelAnchorRef.current =
                menuBtnRefs.current[col.fieldName] ?? null;
              setOpenMenuCol(null);
              setOpenColumnsPanel(true);
            }}
          />
        ) : null}
        {filterable && filterUi && openFilterCol === col.fieldName ? (
          <ColumnFilterPopover
            column={col}
            kind={filterUi.mode === 'builtin' ? filterUi.kind : undefined}
            customName={
              filterUi.mode === 'custom' ? filterUi.name : undefined
            }
            customParams={
              filterUi.mode === 'custom' ? filterUi.params : undefined
            }
            customComponent={customFilter}
            filterModel={filterModel}
            controller={controller}
            open
            onOpenChange={(next) => {
              if (!next) setOpenFilterCol(null);
            }}
            anchorRef={{
              get current() {
                return filterBtnRefs.current[col.fieldName] ?? null;
              },
            }}
          />
        ) : null}
        {handle}
      </th>
    );
  };

  const renderFloatingFilterColumn = (col: ColumnSchema, index: number) => {
    const size = columnSizeStyle(col, table.columnWidths, colWindow.layoutWidths);
    const ui = resolveFilterUi(col);
    if (isIndexColumn(col) || !ui || ui.mode !== 'builtin') {
      return (
        <th
          key={`ff-${col.fieldName}`}
          role="columnheader"
          aria-colindex={ariaColIndex(index)}
          style={size}
          className={`pdg-floating-filter-cell ${columnPinClassName(col)}`}
        />
      );
    }
    return (
      <th
        key={`ff-${col.fieldName}`}
        role="columnheader"
        aria-colindex={ariaColIndex(index)}
        style={size}
        className={`pdg-floating-filter-cell ${columnPinClassName(col)}`}
      >
        <input
          className="pdg-floating-filter-input"
          data-pdg-floating-filter-input={col.fieldName}
          data-pdg-filter-kind={ui.kind}
          aria-label={`${t('general.filter')} ${col.fieldCaption}`}
          value={floatingFilterValue(filterModel, col.fieldName)}
          onChange={(e) => {
            controller.setFilterModel(
              applyFloatingFilter(filterModel, col, e.target.value),
            );
          }}
        />
      </th>
    );
  };

  const beginColumnDrag = (
    e: React.DragEvent<HTMLTableCellElement>,
    fieldName: string,
  ) => {
    suppressSortClickRef.current = true;
    draggedFieldRef.current = fieldName;
    e.dataTransfer.setData("text/plain", fieldName);
    e.dataTransfer.effectAllowed = "move";
  };

  const hoverColumnDrop = (fieldName: string) => {
    setDropField((current) => (current === fieldName ? current : fieldName));
  };

  const leaveColumnDrop = (
    fieldName: string,
    currentTarget: HTMLElement,
    relatedTarget: EventTarget | null,
  ) => {
    if (relatedTarget instanceof Node && currentTarget.contains(relatedTarget)) {
      return;
    }
    setDropField((current) => (current === fieldName ? null : current));
  };

  const dropColumn = (destField: string) => {
    const sourceField = draggedFieldRef.current;
    const sourceGroup = draggedGroupRef.current;
    draggedFieldRef.current = null;
    draggedGroupRef.current = null;
    setDropField(null);
    if (sourceGroup) {
      const move = resolveGroupBlockReorder(displayColumns, sourceGroup, destField);
      if (!move) return;
      void controller.dispatch({
        type: "COLUMN_REORDERED",
        sourceIndex: move.sourceIndex,
        destIndex: move.destIndex,
      });
      return;
    }
    if (!sourceField) return;
    const move = resolveColumnReorder(displayColumns, sourceField, destField);
    if (!move) return;
    void controller.dispatch({
      type: "COLUMN_REORDERED",
      sourceIndex: move.sourceIndex,
      destIndex: move.destIndex,
    });
  };

  const endColumnDrag = () => {
    draggedFieldRef.current = null;
    draggedGroupRef.current = null;
    setDropField(null);
  };

  const markPointerOrigin = (e: React.PointerEvent<HTMLTableCellElement>) => {
    if (e.button !== 0) return;
    pointerOriginRef.current = { x: e.clientX, y: e.clientY };
    suppressSortClickRef.current = false;
  };

  const trackPointerMove = (e: React.PointerEvent<HTMLTableCellElement>) => {
    const origin = pointerOriginRef.current;
    if (!origin) return;
    const movedPx = Math.hypot(e.clientX - origin.x, e.clientY - origin.y);
    if (!shouldCommitHeaderSortClick(movedPx)) {
      suppressSortClickRef.current = true;
    }
  };

  const commitHeaderSort = (
    e: React.MouseEvent<HTMLTableCellElement>,
    fieldName: string,
    sortable: boolean,
  ) => {
    if (!sortable) return;
    if (isInteractiveHeaderTarget(e.target)) return;
    if (suppressSortClickRef.current) return;
    const origin = pointerOriginRef.current;
    if (origin) {
      const movedPx = Math.hypot(e.clientX - origin.x, e.clientY - origin.y);
      if (!shouldCommitHeaderSortClick(movedPx)) return;
    }
    const next = cycleSortModel(sortModel, fieldName, { multi: e.shiftKey });
    controller.setSortModel(next);
  };

  return (
    <thead className="top-0 z-20 sticky" role="rowgroup" data-pdg-dir={direction}>
      {header}
      {!validationResult.valid && (
        <CustomDropdownButton
          placement="bottom"
          className="top-1 z-10 absolute flex m-0 p-0 rounded start-1"
          items={items}
        >
          <span className="bg-red-600 border rounded-full w-2 h-2"></span>
        </CustomDropdownButton>
      )}
      <ColumnGroupHeaderRows
        allVisible={visibleColumns}
        colWindow={colWindow}
        columnWidths={table.columnWidths}
        collapsedGroups={collapsedGroups}
        onToggleGroup={(groupId) => controller.toggleColumnGroup(groupId)}
        onGroupDragStart={(groupId) => {
          draggedGroupRef.current = groupId;
        }}
      />
      <tr
        role="row"
        aria-rowindex={ARIA_HEADER_ROW_INDEX + groupDepth}
        style={{gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`}}
        className={`relative h-10  bg-gray-gray3 rounded-t-lg w-full `}
        data-pdg-header-cols={
          colWindow.pinnedStart.length +
          colWindow.mountedScrollableCount +
          colWindow.pinnedEnd.length
        }
      >
        <ColumnWindowCells
          window={colWindow}
          spacerElement="th"
          spacerRole="columnheader"
          renderColumn={renderHeaderColumn}
        />
      </tr>
      <ColumnsPanelPopover
        columns={displayColumns}
        controller={controller}
        open={openColumnsPanel}
        onOpenChange={setOpenColumnsPanel}
        anchorRef={columnsPanelAnchorRef}
      />
      {floatingFilter ? (
        <tr
          role="row"
          className="pdg-floating-filter-row"
          data-pdg-floating-filter="true"
        >
          <ColumnWindowCells
            window={colWindow}
            spacerElement="th"
            spacerRole="columnheader"
            renderColumn={renderFloatingFilterColumn}
          />
        </tr>
      ) : null}
    </thead>
  );
}
