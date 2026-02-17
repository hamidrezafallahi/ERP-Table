import type { IBaseDto } from "@services/base/type";

export interface IStation extends IBaseDto {
  StationId: number;
  StationDesc: string;
}

export interface IRequest {
  config: string;
}
