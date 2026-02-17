import type { IBaseDto } from "@services/base/type";

export interface IAccessRepo extends IBaseDto {
  RoleAccessItems: {
    RepoId: number;
    RepoName: string;
    Actions: {
      ActionId: number;
      ActionName: string;
      ActionType: number;
      HasAccess: boolean;
      HasPlace: boolean;
    }[];
  };
}

export interface IRequest {
  RoleId: number;
}
