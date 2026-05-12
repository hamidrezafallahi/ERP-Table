import { useGetData } from "@services/base";
import { ISelectTafsili } from "../types";
import { IDynamicModalConfig } from "@components/organisms/sideBarForm/types";
import { useEffect } from "react";

interface useDataManagerProps {
  config: IDynamicModalConfig;
}

export function useDataManager({ config }: useDataManagerProps) {
  useEffect(() => {}, []);
  const {
    data: selectData,
    refetch: selectRefetch,
    isFetching: isFetchingSelect,
    isLoading,
  } = useGetData<ISelectTafsili[], null>({
    url: config.listConfig.selectUrlSide,
    body: {
      RepoViewId: 0,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 1000000,
      },
      FullSearchPhrase: "",
    },
    skip: false,
  });

  return {
    selectData,
    selectRefetch,
    isFetchingSelect,
    isLoading,
  };
}
