import { ReactNode } from "react";

import { ButtonProps } from "antd";

import { IBaseDto } from "@services/base/type";

export enum LimitAccessEnum {
  InAccessibility = 0,
  OnlyYourself = 1,
  SubCategory = 2,
  RoleCompanies = 3,
  Total = 4,
}
export interface IAction {
  AccessLevel: number;
  ActionId: number;
  ActionName: string;
  ActionType: number;
  HasAccess: boolean;
  HasPlace: boolean;
}

export interface IRepos {
  RepoId: number;
  repoName: string;
  Actions: IAction[];
  originalValue: boolean | number;
}

export interface IProps extends ButtonProps {
  handleChange: (e: LimitAccessEnum) => void;
  preState?: LimitAccessEnum;
  item?: IRepos;
}
export interface ISystemId {
  label: string;
  hasAccess: boolean;
  id: number | string;
  value: number;
}
export interface IItem {
  id: number;
  ActionId: number;
  RepoId: number;
  label?: string;
  Mode: boolean;
  ActionType?: number;
}
export interface IChecker {
  ActionId: number;
  Mode: "Add" | "Delete";
  // RepoId:number
  // RoleId:number
}
export interface IAccessByAuthorizedList {
  item: IItem;
  handleChange?: ({ ActionId, Mode }: IChecker) => void;
  handleSubmit?: (exceptionList) => void;
  title: ReactNode;
  hasCheckbox?: boolean;
  endPoint?: string;
  ActionType?: number;
  actionTypeId?: number;
  systemIds: ISystemId[];
}

export interface Action {
  ActionId: number;
  ActionName: string;
  ActionType: number;
  HasAccess: boolean;
  HasPlace: boolean;
  AccessLevel: number;
  originalValue: boolean | number;
  RepoId: number;
}

export interface RoleAccessItem {
  RepoId: number;
  Actions: Action[];
}

export interface ISystems extends IBaseDto {
  ManagmentAccountId: number;
  SystemId: number;
  System: {
    SystemDesc: string;
  };
}
export interface IRequest {
  config?: string;
}

export interface IAuthorizedCompaniesResponse {}
