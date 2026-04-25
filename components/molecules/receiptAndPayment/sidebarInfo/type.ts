import { Dispatch, SetStateAction } from "react";

export interface IBaseItem {
  id: number;
  value?: string;
  label: string;
}

export interface GenericSidebarProps {
  fetchUrl: string;
  title: string;
  onSelect: (item: IBaseItem) => void;
  selectedId?: number;
  pageRecordCount?: number;
}

export interface InfiniteScrollListProps {
  items: IBaseItem[];
  selectedId?: number;
  showSkeleton: boolean;
  totalCount: number;
  setPage: Dispatch<SetStateAction<number>>;
  onSelectItem: (item: IBaseItem) => void;
}


interface SidebarApiItem {
  _SelectId: number;
  _SelectValue: string;
  _SelectDisplay: string;
}

export interface SidebarApiResponse {
  Result: string;
  Data: SidebarApiItem[];
  TotalCount: number;
}