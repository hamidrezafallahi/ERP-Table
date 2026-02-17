import { IDetail } from "@services/generalType/type";

export interface IYearPlanDetails extends IDetail {
  Bed: number;
  Bes: number;
  RowSum: number;
  Levels?: ILevel[];
  GoodId: string | number;
  Month1?: number;
  Month2?: number;
  Month3?: number;
  Month4?: number;
  Month5?: number;
  Month6?: number;
  Month7?: number;
  Month8?: number;
  Month9?: number;
  Month10?: number;
  Month11?: number;
  Month12?: number;
  YearPlanId?: number;
  Verson?: number;
  Year?: number;
  Date?: Date;
  CreateDate?: Date;
}
export interface ITotal extends IDetail {
  Total: number;
}
export interface ILevel {
  desc: string;
  Level: number;
}

export interface IVoucherDetailsRequest {
  config: string;
}
