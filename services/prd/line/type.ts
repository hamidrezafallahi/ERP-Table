import type { IBaseDto } from "@services/base/type";

export interface ILine extends IBaseDto {
  Desc: string;
  LineId: number;
}

export interface IRequest {
  config: string;
}
