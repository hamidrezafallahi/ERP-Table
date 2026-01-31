import { shallowEqual } from "react-redux";

import { useAppSelector } from "@redux/index";
import { useGetData } from "@services/base";
import type { IReportFile, IRequest } from "@services/reportFile/type";

import { ReportView } from "../view";
import type { IProps } from "./type";

export const ShowPrinter = ({ printId, ids }: IProps) => {
  const { modalIsFullScreen } = useAppSelector(
    (state) => ({
      modalIsFullScreen: state.withPersist.config.modalIsFullscreen,
    }),
    shallowEqual
  );
  const {
    data: print,
    isFetching,
    refetch,
  } = useGetData<IReportFile[], IRequest>({
    url: "api/report/select/reports/file",
    body: {
      ReportId: printId,
      RepoViewId: 120001,
    },
  });

  const dataSources = print?.Data?.[0]?.DataSources;

  const { data: printData } = useGetData<unknown[], null>({
    url: dataSources?.[0]?.Endpoint,
    body: {
      RepoViewId: dataSources?.[0]?.RepoId,
      ShowMode: 10,
      ShowTags: true,
      ShowBookmarked: true,
      Ids: ids,
      // PagingInfo: {
      //   PageNumber: pageNumber,
      //   PageRecordCount: pageRecordCount,
      // },
      // FullSearchPhrase: "",
      // Filters: {
      //   FilterInfo: dataFilters,
      //   ShowOnlyBookmarked: false,
      //   TagIdsFilter: null,
      // },
      // OrderInfo: [],
    },
    skip: !dataSources,
  });

  return (
    <div
      className={`${modalIsFullScreen ? "flex" : "flex flex-col"} gap-2 p-2`}
    >
      {printId && printData?.Data?.length > 0 && (
        <ReportView
          reportData={[
            {
              dataSourceName: dataSources?.[0]?.DataSourceName,
              data: printData.Data,
            },
          ]}
          dataSources={dataSources}
          isFetching={isFetching}
          refetch={refetch}
          data={print?.Data[0]}
        />
      )}
    </div>
  );
};
