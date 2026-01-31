import { ITotal } from "@components/organisms/yearPlan/type";

export interface IProps {
  columnSums: ITotal[];
  match: boolean;
  fullScreen: boolean;
  minimizePanel: boolean;
}
