import { useEffect, useState } from "react";
import { useGetData } from "@services/base";
import DebounceSearch from "@components/molecules/debounceSearch";
import InfiniteScrollList from "./InfiniteScrollList";
import { GenericSidebarProps, IBaseItem, SidebarApiResponse } from "./type";

export const GenericSidebar = ({
  fetchUrl,
  title,
  onSelect,
  selectedId,
  pageRecordCount = 15,
}: GenericSidebarProps) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [items, setItems] = useState<IBaseItem[]>([]);

  const { data, isLoading, isFetching } = useGetData<SidebarApiResponse>({
    url: fetchUrl,
    body: {
      ...(searchPhrase && { FullSearchPhrase: searchPhrase }),
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: pageRecordCount,
      },
    },
  });

  useEffect(() => {
    if (data?.Result === "Success" && Array.isArray(data.Data)) {
      const newItems: IBaseItem[] = data.Data.map((item) => ({
        id: item._SelectId,
        value: item._SelectValue,
        label: item._SelectDisplay,
      }));

      setItems((prev) => {
        if (pageNumber === 1) return newItems;
        const filtered = newItems.filter(
          (item) => !prev.some((p) => p.id === item.id),
        );
        return [...prev, ...filtered];
      });
    }
  }, [data, pageNumber]);

  useEffect(() => {
    setPageNumber(1);
    setItems([]);
  }, [searchPhrase]);

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg w-full sm:w-72 overflow-auto">
      <div className="font-semibold">{title}</div>
      <DebounceSearch
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
      />
      <InfiniteScrollList
        items={items}
        selectedId={selectedId}
        showSkeleton={isLoading || isFetching}
        setPage={setPageNumber}
        totalCount={data?.TotalCount || 0}
        onSelectItem={onSelect}
      />
    </div>
  );
};
