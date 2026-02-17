import type { IBaseDto } from "@services/base/type";

export interface IYearPlan extends IBaseDto {
  YearPlanId: number;
  Date?:string;
}

export interface IRequest {
  config: string;
}
