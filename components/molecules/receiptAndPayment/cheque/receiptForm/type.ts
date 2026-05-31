import { FormInstance } from 'antd';

export interface ICondition {
  HasTafsili: boolean;
  HasFifth: boolean;
  HasSixth: boolean;
  HasSeventh: boolean;
  HasEight: boolean;
  HasNine: boolean;
  HasTen: boolean;
  HasEleven: boolean;
  HasTwelve: boolean;
  HasThirteen: boolean;
}
export interface IProps {
  onSubmitCallback: (values:unknown)=>void;
  form: FormInstance;
}
