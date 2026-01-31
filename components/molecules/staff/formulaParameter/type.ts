import { IBaseDto } from '@services/base/type';

export interface IProps {
  id: number;
}
export interface Item extends IBaseDto {
  id: string;
  closeModal: () => void;
  type: "constant" | "parameter" | null;
  value?: string | number | null;
  operator?: string | null;
  ActParamFormulaId?: number;
}

export interface IRequest {
  config: string;
}
