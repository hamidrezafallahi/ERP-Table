import { Dispatch, SetStateAction } from "react";

import type { IColumnConfig } from "@services/generalType/type";
import type { IToolbarMenu } from "@type/toolbar";

export interface IProps {
  columnsConfig: IColumnConfig[];
  selectedItems: number[];
  setSelectedItems: Dispatch<SetStateAction<number[]>>;
  data: any;
  actions: IToolbarMenu[];
  staticKey: string;
  onActionClick: (
    action: IToolbarMenu,
    record: any
    // id: number | null,
    // headerId: number | null
  ) => void;
  rowFieldKey: string;
  headerKey: string;
  selectedHeaderId: number[];
  setSelectedHeaderId: Dispatch<SetStateAction<number | number[]>>;
}
