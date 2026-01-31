import type { IViewData } from '@slice/pages/type';

export interface IProps {
  openSortModal: () => void;
  onResetSortOrder: () => void;
  data: { value: string; label: string; type: string }[];
  viewData: IViewData;
  rowFieldKey: string;
}
