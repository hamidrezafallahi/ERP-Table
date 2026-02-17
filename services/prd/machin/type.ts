import type { IBaseDto } from "@services/base/type";

export interface IMachin extends IBaseDto {
  MachinDesc: string;
  MachinId: number;
}

export interface IRequest {
  config: string;
}
