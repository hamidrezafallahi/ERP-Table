import type { IReportFile } from "@services/reportFile/type";

export interface IProps {
  template: string;
  data: {
    dataSourceName: string;
    data: any;
  }[];
  dataSources?: IReportFile["DataSources"];
}
