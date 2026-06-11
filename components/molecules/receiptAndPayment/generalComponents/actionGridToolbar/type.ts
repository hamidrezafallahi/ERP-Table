import {
  Dispatch,
  SetStateAction,
} from 'react';

export interface IProps {
  filterInfo: any;
  setFilterInfo: any;
  setOrderInfo: any;
  setPageNumber: Dispatch<SetStateAction<number>>;
  quickSearch: string;
  setQuickSearch: Dispatch<SetStateAction<string>>;
  rowFieldKey: string;
}
