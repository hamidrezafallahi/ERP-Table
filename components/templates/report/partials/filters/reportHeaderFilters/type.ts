import { IFilter } from '@services/base/type';

export enum ValueTypeEnum {
  Draft = 3,
  Prepared = 1,
  Canceled = 5,
  Finalized = 2,
}
export interface ReportHeaderFilterProps extends FilterSectionProps {
  showThirdAction?: boolean;
  defaultRange?: {from:string|number,to:string|number};
  thirdActionHandler?: () => void;
 
}
export interface FilterSectionProps{
    defaultFilter?:IFilter[]
}