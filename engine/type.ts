import type * as React from 'react';

import { ColumnSchema } from '../bootstrap/type';
import { Table } from '../domain/entities/Table';
import {
  RowStateEnum,
  TableActions,
} from '../domain/value-objects';
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
  data?: any
}
export interface CellError {
  rowId: number;
  caption: string;
  message: string;
}
