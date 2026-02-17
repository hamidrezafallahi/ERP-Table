import type { IBaseDto } from "@services/base/type";

export interface IPlace extends IBaseDto {
  PlaceId: number;
  PlaceCode: string;
  PlaceDesc: string;
  PlaceAddress: string;
  FatherId?: number;
  Inactive?: boolean;
  SubUnits: IPlace[];
}

export interface IRequest {
  config: string;
}
