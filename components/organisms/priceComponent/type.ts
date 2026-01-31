import type { IDetailColumnConfig } from '@services/generalType/type';
import type { IPriceDetail } from '@services/sale/priceDetails/type';

export interface IProps {
  isEdit: boolean;
  detailInitialData: IPriceDetail[];
  totalCount: number;
  columnsConfig: IDetailColumnConfig[];
  detailCaption: string;
  isLoading: boolean;
  form: any;
}
