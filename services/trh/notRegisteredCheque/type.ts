import type { IBaseDto } from "@services/base/type";

export interface INotRegisteredCheque extends IBaseDto {
  DocumentChequeId?: number;
  CheckPlaceMentDetailId?: number;
}

export interface IRequest {
  config: string;
}
