import { useState } from "react";
import { useGetData, useCUDDataMutation } from "@services/base";
import { IChequeDetails } from "@services/trh/chequeDetails/type";

interface UseChequeOperationsProps {
  match: boolean;
  repoViewId?: number;
  url: string;
}

export const useChequeOperations = (props: UseChequeOperationsProps) => {
  const { url, match, repoViewId } = props;
  const [pageNumber, setPageNumber] = useState(1);
  const [recordPerPage, setRecordPerPage] = useState(10);
  const [filterInfo, setFilterInfo] = useState([]);
  const [orderInfo, setOrderInfo] = useState([]);
  const [quickSearch, setQuickSearch] = useState("");
  const mobilePerPageCount = 100;

  const { data, isFetching, refetch } = useGetData<IChequeDetails[], any>({
    url,
    body: {
      Filters: { FilterInfo: filterInfo },
      OrderInfo: orderInfo,
      RepoViewId: repoViewId,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: match ? recordPerPage : mobilePerPageCount,
      },
      FullSearchPhrase: quickSearch,
    },
    id: "all",
  });

  const { data: total } = useGetData({
    url,
    body: {
      Filters: { FilterInfo: filterInfo },
      OrderInfo: orderInfo,
      RepoViewId: repoViewId,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: recordPerPage,
        OnlyTotalCount: true,
      },
      FullSearchPhrase: quickSearch,
    },
  });

  const [trigger, { isLoading }] = useCUDDataMutation();

  return {
    data,
    total,
    isFetching,
    refetch,
    trigger,
    isLoading,
    pageNumber,
    setPageNumber,
    recordPerPage,
    setRecordPerPage,
    filterInfo,
    setFilterInfo,
    orderInfo,
    setOrderInfo,
    quickSearch,
    setQuickSearch,
    mobilePerPageCount,
  };
};
