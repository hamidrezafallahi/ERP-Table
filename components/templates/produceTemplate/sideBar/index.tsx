import React, {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';

import { useGetData } from '@services/base';
import { ISelectOption } from '@type/elementType';

import { DebounceSearch } from './debounceSearch';
import InfiniteScrollGoodList from './InfiniteScrollGoodList';

function ProduceSidebar() {
  const [pageNumber, setPageNumber] = useState(1);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [goodsList, setGoodsList] = useState<ISelectOption[]>([]);
  const t = useTranslations();
  const { data, isLoading, isFetching } = useGetData({
    url: "api/com/select/goods4ProduceSelectOption",
    body: {
      RepoViewId:30094,
      FullSearchPhrase: searchPhrase,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: 15,
      },
    },
  });
  const { data: totalCountdata } = useGetData({
    url: "api/com/select/goods4ProduceSelectOption",
    body: {
      FullSearchPhrase: searchPhrase,
      RepoViewId: 30094,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 1000,
        OnlyTotalCount: true,
      },
    },
  });

  const handleChangeSearchPhrase = (e: string) => {
    setGoodsList([])
    setSearchPhrase(e);
    setPageNumber(1);
  };
  const handleChangePage = () => {
    if (goodsList.length < totalCountdata?.TotalCount) {
      setPageNumber(pageNumber + 1);
    }
  };
useEffect(() => {
  if (data && data?.Result === "Success") {
    setGoodsList((prev) => {
      const newItems = data.Data as ISelectOption[];
      const filteredItems = newItems.filter(
        (item) => !prev.some((prevItem) => prevItem._SelectId === item._SelectId)
      );
      return [...prev, ...filteredItems];
    });
  }
}, [data]);
  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg w-full sm:w-60 !h-[100%]">
      <div>{t("general.productList")}</div>
      <DebounceSearch setSearch={handleChangeSearchPhrase} />
      <InfiniteScrollGoodList
        onChangePage={handleChangePage}
        goodList={goodsList}
        showSkeleton={isLoading || isFetching}
        setPage={setPageNumber}
        totalCount={totalCountdata?.TotalCount}
      />
    </div>
  );
}

export default ProduceSidebar;
