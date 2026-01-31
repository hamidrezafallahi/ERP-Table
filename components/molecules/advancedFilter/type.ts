import type { IFilter } from "@services/base/type";
import type { IViewData } from "@slice/pages/type";
import type { IRequestConfig } from "@type/elementType";

export interface IProps {
  data: IData[];
  onReset: () => void;
  onApplyFilters: (
    filters: { field: string | number; value: string; type: string }[]
  ) => void;

  viewData?: IViewData;
  defaultFilters?: IFilter[];
}

export interface IData {
  value: string;
  label: string;
  type: string;
  valueOption: IRequestConfig;
}

export interface IAdvancedFilter {
  id: number;
  field: string | number;
  value: string;
  type: string;
}
