import { FormInstance } from 'antd';

export interface IProps {
  form: FormInstance<any>;
  setIsFormSubmitting: (boolean) => void
  caption: string;
  captionII?: string;
  listUrl: string;
  headerFieldKey: string;
  detailFieldKey: string;
  headerGetUrl: string;
  detailGetUrl: string;
  addUrl: string;
  updateUrl: string;
  tableTitle: string;
  titleKey: string;
  DefaultDetailRepoViewId:number
  DefaultHeaderRepoViewId:number
  formHeight:number
  storeName:string
  pageIcon?: string;
  handleSubmit?: () => void;
 }

export interface IRequestMeta {
  requestKey?: string;
  ignoreOnSubmit?: boolean;
}
