import { ReactNode } from 'react';

export interface IProps<T, K> {
  url: string;
  deleteUrl?: string;
  confirmUrl?: string;
  filterKey?: string;
  bodyKey?: string;
  staticKey?: keyof T;
  staticKeyII?: keyof T;
  caption: string;
  rowFieldKey?: keyof T;
  additionalFieldKey?: string;
  formUrl?: string;
  addCaption?: string;
  baseRepoId?: number;
  pageIcon?: string;
  conditionalActions?: {
    conditionalProperty: keyof T;
    conditionallyAction?: string;
  }[];
  EditField?: string;
  isNested?: boolean;
  nestedListAddChildCondition?: (item: any) => boolean;
  withoutActivation?: boolean;
  rangeFilterKey?: string | null;
  customColumns?: any;
  renderCustomActions?: () => ReactNode;
}
