import { useGetData, useGetInfinite } from "@services/base";
import IResponseItem, { IDynamicModalConfig } from "../../types";

interface useDataManagerProps<T> {
  config: IDynamicModalConfig;
  pageNumber: number;
  perPageCount: number;
  match: boolean;
  typeId: number;
}

export function useDataManager<T extends IResponseItem>(
  props: useDataManagerProps<T>,
) {
  const { config, pageNumber, perPageCount, match, typeId } = props;
  const {
    data: tableData,
    isLoading: tableIsLoading,
    refetch: refetchTable,
  } = useGetData<T[], null>({
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
    skip: !match || !typeId,
  });

  const { data: tableTotal } = useGetData<T[], null>({
    url: config.listConfig.selectUrl,
    body: {
      ...config.listConfig.body,
      RepoViewId: config.listConfig.repoViewId,
      RepoId: config.listConfig.RepoId,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 10000,
        OnlyTotalCount: true,
      },
    },
    skip: !match || !typeId,
  });

  const {
    data: cardData,
    isFetching: cardIsFetching,
    isLoading: cardIsLoading,
    refetch: refetchCard,
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
    skip: match || !typeId,
  });

  const tableDataWithDesc =
    tableData?.Data?.map((item) => {
      if (config.listConfig.transform) {
        return config.listConfig.transform(item);
      }
      return item;
    }) ?? [];

  return {
    tableData,
    tableIsLoading,
    refetchTable,
    tableTotal,
    cardData,
    cardIsFetching,
    refetchCard,
    tableDataWithDesc,
    cardIsLoading,
  };
}
