import type * as React from 'react';

import { ColumnSchema } from '../bootstrap/type';
import { Table } from '../domain/entities/Table';
import {
  RowStateEnum,
  TableActions,
} from '../domain/value-objects';
import type { SortModel } from './dataOps/sortModel';
import type { FilterModel } from './dataOps/filterModel';
import type { RowModelType } from './dataOps/rowModel';
import type { CellEditSession } from './dataOps/cellEditSession';
import type { CellRange, CellRangeSelection } from './selection/cellRange';
import { UIRow } from '../ui/type';

export const MOBILE_PAGE_SIZE = 50;

export type GridSearchMatch = {
  rowId: number;
  columnId: string;
};

export type GridSearchState = {
  columnId: string;
  query: string;
  matches: GridSearchMatch[];
  currentIndex: number;
} | null;

export type MobileEditorState = {
  mode: 'add' | 'edit';
  rowId: number;
} | null;

export type TableViewState = {
  // table: Table
  activeCell: ActiveCell;
  selectedRows: Record<number, true>;
  rows: UIRow[];
  deletedRows: Array<{
    id: string;
    cells: Record<string, unknown>;
    isExpanded: boolean;
  }>;
  columns: ColumnSchema[];
  activeCollectionColumn: ColumnSchema[];
  pagination: {
    page: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
    canPrev: boolean;
    canNext: boolean;
  };
  action: TableActions;
  gridSearch: GridSearchState;
  mobileEditor: MobileEditorState;
  /** Session-only column widths (px). Not EventStore. */
  columnWidths: Record<string, number>;
  /** Session-only sort (PR-90). Empty ⇒ document `index` order. Not EventStore. */
  sortModel: SortModel;
  /**
   * Session-only quick filter (PR-93). Hides non-matching rows (unlike
   * `gridSearch` find-and-navigate). Not EventStore.
   */
  quickFilterText: string;
  /** Session-only column filters (PR-94). Not EventStore. */
  filterModel: FilterModel;
  /** Cell-range selection (PR-105). Session-only. */
  cellRanges: readonly CellRange[];
  /** Collapsed column group ids (PR-113). */
  collapsedColumnGroups: Record<string, true>;
  /** Active row-group columns (PR-120). */
  rowGroupColumns: string[];
  groupDefaultExpanded: boolean;
  /** Session-only cell edit draft (PR-126). */
  cellEdit: CellEditSession | null;
};

export type MobileTableViewState = {
  rows: UIRow[];
  columns: ColumnSchema[];
  totalRows: number;
  visibleCount: number;
  hasMore: boolean;
  pageSize: number;
  mobileEditor: MobileEditorState;
};

export type TableSnapShot = {
  rows: Array<{
    id: number;
    cells: Record<string, unknown>;
    rowState: RowStateEnum
    collection: string
    rowType?: string
    changeFields: readonly string[]
    isSaveDescription: boolean
  }>;
};
export type ActiveCell = {
  rowId: number;
  columnId: string;
} | null;
export type ValidCell = { isValid: boolean, cellError: CellError }

export type TableState = {
  table: Table;
  expandedRows: Record<string, boolean>;
  selectedRows: Record<number, true>;
  activeRowId: number | undefined;
  activeCell: ActiveCell | undefined;
  rangeAnchorRowId: number | undefined;
  gridSearch: GridSearchState;
  mobileEditor: MobileEditorState;
  columnWidths: Record<string, number>;
  /** Session-only sort model (PR-90). Not EventStore. */
  sortModel: SortModel;
  /** Session-only quick filter text (PR-93). Not EventStore. */
  quickFilterText: string;
  /** Session-only column filter model (PR-94). Not EventStore. */
  filterModel: FilterModel;
  /**
   * Row model mode (PR-96). Default `clientSide`.
   * When `infinite` / `serverSide`, local sort/filter are skipped.
   */
  rowModelType: RowModelType;
  /**
   * Total rows from the last `GridDatasource.getRows().lastRow` (PR-96).
   * `null` = unknown / use loaded row count.
   */
  serverRowCount: number | null;
  /** Cell-range selection state (PR-105). Session-only. */
  cellRangeSelection: CellRangeSelection;
  /** Collapsed column group ids (PR-113). Session-only. */
  collapsedColumnGroups: Record<string, true>;
  /**
   * Row group column ids (PR-120). Only the first is active in 0.12.0.
   * Session-only — not EventStore (RFC-002).
   */
  rowGroupColumns: string[];
  /** Default expand state for row groups (PR-120). */
  groupDefaultExpanded: boolean;
  /** Per-group expand overrides keyed by normalizeGroupKey (PR-120). */
  rowGroupExpanded: Record<string, boolean>;
  /** Session-only cell edit draft (PR-126). Not EventStore. */
  cellEdit: CellEditSession | null;
};




export type TCell = {
  value: unknown;
  originalValue: unknown;
  display: unknown;
};
//======================================dropdownType===========================================================================================
export type ItemType = {
  type?: 'submenu' | 'item' | 'group' | 'divider';
  label?: React.ReactNode;
  children?: ItemType[];
  disabled?: boolean;
  ref?: React.Ref<HTMLLIElement | null>;
  style?: React.CSSProperties;
  className?: string;
  isSelected?: boolean;
  isOpen?: boolean;
  isSubMenu?: boolean;
  danger?: boolean;
  icon?: React.ReactNode; //(name: string) => React.ReactNode | React.ReactNode;
  title?: string;
  key: string;
  theme?: 'dark' | 'light';
  dashed?: boolean;
  rootClassName?: string;
  itemIcon?: React.ReactNode;
  expandIcon?: React.ReactNode;
  popupClassName?: string;
  popupOffset?: number[];
  popupStyle?: React.CSSProperties;
  onClick?: () => void;
  extra?: React.ReactNode;
}

export type ValidationCallback = (result: ValidationCallbackResult) => void;
export type ValidationCallbackResult = {
  valid: boolean,
  errors?: Map<string, CellError>,
  data?: unknown
}
export interface CellError {
  rowId: number;
  caption: string;
  message: string;
}
