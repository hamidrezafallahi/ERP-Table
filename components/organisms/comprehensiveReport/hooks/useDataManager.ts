import { useGetData, useGetInfinite } from "@services/base";
import IResponseItem from "../types";
import { ISelectOption } from "@type/elementType";

interface useDataManagerProps<T> {
  pageNumber: number;
  perPageCount: number;
  match: boolean;
  typeId: number;
}

export function useDataManager<T extends IResponseItem>(
  props: useDataManagerProps<T>,
) {
  const { pageNumber, perPageCount, match, typeId } = props;
  const {
    data: tableData,
    isLoading: tableIsLoading,
    refetch: refetchTable,
  } = useGetData<T[], null>({
    url: "",
    body: {
      // ...config.listConfig.body,
      RepoViewId: 0,
      RepoId: 0,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
      },
    },
    skip: !match || !typeId,
  });

  const { data: tableTotal } = useGetData<T[], null>({
    url: "",
    body: {
      // ...config.listConfig.body,
      RepoViewId: 0,
      RepoId: 0,
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
    url: "",
    body: {
      // ...config.listConfig.body,
      RepoViewId: 0,
      RepoId: 0,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 1000,
      },
    },
    skip: match || !typeId,
  });


  const tableDataWithDesc =
    tableData?.Data?.map((item) => ({
      ...item,
    })) ?? [];

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
