import type { IActiveTab } from '../type';

export interface IProps {
  active: IActiveTab;
  handleActive: (e:IActiveTab)=>void;
}
