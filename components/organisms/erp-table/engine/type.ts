import type * as React from 'react';

import { IRequestConfig } from '@type/elementType';

import { FieldType } from '../bootstrap/type';
import { Table } from '../domain/entities/Table';
import { RowStateEnum } from '../domain/value-objects';

export type TableViewState = {
  table: Table
  activeCell:ActiveCell;
  selectedRows: Record<number, true>;
  rows: Array<{
    id: number;
    rowState: RowStateEnum
    cells: Record<string, TCell>;
    isExpanded: boolean;
  }>;
  deletedRows: Array<{
    id: string;
    cells: Record<string, unknown>;
    isExpanded: boolean;
  }>;
  columns: ViewColumn[];
  pagination: {
    page: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
    canPrev: boolean;
    canNext: boolean;
  };
};
export type TableSnapShot = {
  table: Table
  rows: Array<{
    id: number;
    cells: Record<string, unknown>;
    rowState: RowStateEnum
  }>;
  deletedRows: Array<{
    id: string;
    cells: Record<string, unknown>;
  }>;
};

export type ViewColumn = {
  id: string;
  title: string;
  hidden?: boolean;
  /* ==== UI Rendering Meta ==== */
  renderType: FieldType;
  editable?: boolean;
  options?: { label: string; value: string }[];
  dynamicValue?: IRequestConfig;
  indexOptions?: any
};
export type ActiveCell = {
  rowId: number;
  columnId: string;
} | null;
export type ActiveRow = {
  rowId: number;
 
} | null;

export type TableState = {
  table: Table;
  expanded: Record<string, boolean>;
  activeRow?: ActiveRow;
  activeCell?: ActiveCell;
  selectedRows: Record<number, true>;
};


export type TableSnapshot = {
  tableId: string;
  version: number;
  rows: {
    id: string;
    cells: Record<string, TCell>;
  }[];
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








