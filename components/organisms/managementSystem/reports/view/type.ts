import type { IReportFile } from '@services/reportFile/type';

export interface IProps {
  dataSources: IReportFile["DataSources"];
  reportData: any;
  data: IReportFile;
  isFetching: boolean;
  refetch: () => void;
}
