import type { IPage } from '@slice/pages/type';

export interface IProps {
  activePage: IPage;
  form: any;
  handleSubmit:()=>void
  totalDebit:number
}
