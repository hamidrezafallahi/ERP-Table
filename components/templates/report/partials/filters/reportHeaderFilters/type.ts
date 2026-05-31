import { IFilter } from '@services/base/type';
import { IFilterData } from '@type/filterTypes';

export enum ValueTypeEnum {
  Draft = 3,
  Prepared = 1,
  Canceled = 5,
  Finalized = 2,
}
export interface ReportHeaderFilterProps extends FilterSectionProps {
  showThirdAction?: boolean;
  filterFields:IFilterData[]
  defaultRange?: {from:string|number,to:string|number};
  thirdActionHandler?: () => void;
 
}
export interface FilterSectionProps{
    defaultFilters?:IFilter[]
    filterFields:IFilterData[]
}