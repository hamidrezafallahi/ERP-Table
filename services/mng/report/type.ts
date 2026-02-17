import type { IBaseDto } from "@services/base/type";

export interface IReport extends IBaseDto {
  ReportId: number;
  RepoId: number;
  SystemId: number;
  UserId: number;
  Title: string;
  type: ReportTypeEnum;
  DataSourceIds: number[];
  ReportDataSources: {
    DataSourceIds: number;
  }[];
  Files: any;
}

export enum ReportTypeEnum {
  Report = 1,
  Dashboard = 2,
  Print = 3,
}

export interface IRequest {
  config: string;
}

export interface IDataSource {
  RepoId: number;
  SystemId: number;
}
