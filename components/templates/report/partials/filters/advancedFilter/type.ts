import type { IFilter } from '@services/base/type';
import type { IViewData } from '@slice/pages/type';
import { IFilterData } from '@type/filterTypes';

export interface AdvancedFilterProps {
  data: IFilterData[];
  onReset: () => void;
  onApplyFilters: (
    filters: { field: string | number; value: string; type: string }[]
  ) => void;

  viewData?: IViewData;
  defaultFilters?: IFilter[];
}

export interface IAdvancedFilter {
  id: number;
  field: string | number;
  value: string;
  type: string;
}
