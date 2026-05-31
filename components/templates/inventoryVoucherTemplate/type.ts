import { FormInstance } from 'antd';

export interface IProps {
  form?: FormInstance<any>;
  caption: string;
  captionII?: string;
  listUrl: string;
  headerFieldKey: string;
  detailFieldKey: string;
  headerGetUrl: string;
  detailGetUrl: string;
  addUrl: string;
  updateUrl: string;
  titleKey: string;
  pageIcon?: string;
  setIsFormSubmitting: (boolean) => void
}

export interface IRequestMeta {
  requestKey?: string;
  ignoreOnSubmit?: boolean;
}
