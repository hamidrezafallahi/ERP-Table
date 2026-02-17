import type { IBaseDto } from "@services/base/type";

export interface IRole extends IBaseDto {
  Ordered: number;
  PlaceId: number;
  RoleDesc: string;
  RoleId: number;
  RoleName: string;
}

export interface IRequest {
  config: string;
}

export interface IRolePlace extends IBaseDto {
  PlaceAccesses: {
    PlaceDesc: string;
    HasAccess: boolean;
    PlaceId: number;
  }[];
}
