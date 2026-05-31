import { shallowEqual } from 'react-redux';

import { FilterData } from '@components/molecules/managementSystem/reports';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import type {
  IReportFile,
  IRequest,
} from '@services/reportFile/type';

import { ReportView } from '../view';
import type { IProps } from './type';

export const ShowReport = ({ reportId }: IProps) => {
  const { modalIsFullScreen, reportData } = useAppSelector(
    (state) => ({
      modalIsFullScreen: state.withPersist.config.modalIsFullscreen,
      reportData: state.withPersist.config.reportData,
    }),
    shallowEqual
  );
  const {
    data: report,
    isFetching,
    refetch,
  } = useGetData<IReportFile[], IRequest>({
    url: "api/report/select/reports/file",
    body: {
      ReportId: reportId,
      RepoViewId: 120001,
    },
  });

  const dataSources = report?.Data?.[0]?.DataSources;

  return (
    <div
      className={`${modalIsFullScreen ? "flex" : "flex flex-col"} gap-2 p-2 `}
    >
      <FilterData dataSources={dataSources} />

      {reportId && (
        <ReportView
          reportData={reportData ?? []}
          dataSources={dataSources}
          isFetching={isFetching}
          refetch={refetch}
          data={report?.Data[0]}
        />
      )}
    </div>
  );
};
