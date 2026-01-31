import type { IViewData } from '@slice/pages/type';
import type { IRequestConfig } from '@type/elementType';

export interface IProps {
  data: {
    value: string;
    label: string;
    type?: string;
    valueOption?: IRequestConfig;
  }[];
  onApplySort: (sorts: { field: string; order: string }[]) => void;
  onReset: () => void;
  viewData?: IViewData;
}
