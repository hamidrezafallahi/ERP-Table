import type * as React from 'react';

import { IRequestConfig } from '@type/elementType';

import { UITableController } from '../adapters/ui/UITableController';
import { FieldType } from '../bootstrap/type';
import { Table } from '../domain/entities/Table';
import { RowStateEnum } from '../domain/value-objects';
import { IRow } from '../ui/type';

export type TableViewState = {
  table: Table
  activeCell: ActiveCell;
  selectedRows: Record<number, true>;
  rows: IRow[] ;
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
    moreDetails: unknown,


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
  indexOptions?: (tableKey: string, rowId: number, row: { id: string | number; cells: Record<string, TCell>; isExpanded: boolean }, engine: UITableController) => ItemType[]
  onChange?: (tableKey: string, rowId: number, row: { id: string | number; cells: Record<string, TCell>; isExpanded: boolean }, engine: UITableController) => void
  width?: number;
  popUpWidth?: number
  labelValue?:'selectDisplay'|'selectValue';

};
export type ActiveCell = {
  rowId: number;
  columnId: string;
} | null;


export type TableState = {
  table: Table;
  expandedRows: Record<string, boolean>;
  selectedRows: Record<number, true>
  activeRowId: number | null
  activeCell: ActiveCell
  rangeAnchorRowId: number | null
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








