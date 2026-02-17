import type { IBaseDto } from "@services/base/type";
import { ReportTypeEnum } from "@services/mng/report/type";

export interface IReportFile extends IBaseDto {
  ReportId: number;
  ReturnFileUrl: string;
  Type: ReportTypeEnum;
  DataSources: {
    Columns: {
      Name: string;
      Type: number;
      InFilter: boolean;
      IsMaditory: boolean;
      IsShow: boolean;
    }[];

    DataSourceName: string;
    DataSourceTitle: string;
    Parameter: string;
    RepoId: number;
    Endpoint: string;
    Type: ReportTypeEnum;
  }[];
}

export interface IRequest {
  config: string;
}
