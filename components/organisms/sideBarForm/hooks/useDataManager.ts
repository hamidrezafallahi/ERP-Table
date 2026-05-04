import { useGetData, useGetInfinite } from "@services/base";
import IVoucherTypeItem, { IDynamicModalConfig } from "../type";

interface useDataManagerProps {
  config: IDynamicModalConfig;
  pageNumber: number;
  perPageCount: number;
  match: boolean;
  typeId: number;
}

export function useDataManager({
  config,
  pageNumber,
  perPageCount,
  match,
  typeId,
}: useDataManagerProps) {
  const {
    data: tableData,
    isLoading: tableIsLoading,
    refetch: reload,
  } = useGetData<IVoucherTypeItem[], null>({
    url: config.listConfig.selectUrl,
    body: {
      ...config.listConfig.body,
      RepoViewId: config.listConfig.repoViewId,
      RepoId: config.listConfig.RepoId,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
      },
    },
    skip: !match,
  });

  const { data: tableTotal } = useGetData<IVoucherTypeItem[], null>({
    url: config.listConfig.selectUrl,
    body: {
      ...config.listConfig.body,
      RepoViewId: config.listConfig.repoViewId,
      RepoId: config.listConfig.RepoId,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
        OnlyTotalCount: true,
      },
    },
  });

  const {
    data: cardData,
    isFetching: cardIsFetching,
    isLoading:cardIsLoading,
    refetch,
  } = useGetInfinite<unknown[], null>({
    url: config.listConfig.selectUrl,
    body: {
      ...config.listConfig.body,
      RepoViewId: config.listConfig.repoViewId,
      RepoId: config.listConfig.RepoId,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 1000,
      },
    },
    skip: match || typeId === undefined,
  });

  const tableDataWithDesc = tableData?.Data?.map((item) => ({
    ...item,
  }));
  return {
    tableData,
    tableIsLoading,
    reload,
    tableTotal,
    cardData,
    cardIsFetching,
    tableDataWithDesc,
    refetch,
    cardIsLoading
  };
}
