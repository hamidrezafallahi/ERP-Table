import { Dispatch, SetStateAction } from "react";

import type { IColumnConfig } from "@services/generalType/type";
import type { IToolbarMenu } from "@type/toolbar";

export interface IProps {
  pageNumber: number;
  actions: IToolbarMenu[];
  recordPerPage: number;
  selectedItems: number[];
  data: any;
  totalCount: number;
  columnsConfig: IColumnConfig[];
  loading: boolean;
  rowFieldKey: string;
  headerKey: string;
  onActionClick: (
    action: IToolbarMenu,
    record: any
    // id: number | null,
    // headerId: number | null
  ) => void;
  setPageNumber: Dispatch<SetStateAction<number>>;
  setRecordPerPage: Dispatch<SetStateAction<number>>;
  setSelectedItems: Dispatch<SetStateAction<number[]>>;
  setSelectedHeaderId: Dispatch<SetStateAction<number[]>>;
}
