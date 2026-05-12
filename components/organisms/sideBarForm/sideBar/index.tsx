// RepoAssignSidebar.tsx
import {
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { useTranslations } from "next-intl";
import { useGetData } from "@services/base";
import { ISelectOption } from "@type/elementType";
import { DebounceSearch } from "./debounceSearch";
import { useAppSelector } from "@redux/index";
import { shallowEqual } from "react-redux";
import { DynamicSelect } from "@components/atoms/defaultElements";
import { useFilteredList } from "../hooks/useFilteredList";
import { IDynamicModalConfig } from "../types";
import SideBarFormList from "./sideBarFormList";

interface SideBarProps {
  typeId: number;
  setTypeId: Dispatch<SetStateAction<number | undefined>>;
  config: IDynamicModalConfig;
  sideBarTitle: string;
}

export default function SideBar({ typeId, setTypeId, config,sideBarTitle }: SideBarProps) {
  const t = useTranslations();
  const [searchPhrase, setSearchPhrase] = useState("");
  const [list, setList] = useState<ISelectOption[]>([]);

  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);

  const handleChangeSearchPhrase = useCallback((value: string) => {
    setSearchPhrase(value);
  }, []);

  const { data, isFetching, isError } = useGetData({
    url: "/api/acc/select/voucherType4searchBox",
    body: {
      FullSearchPhrase: "",
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 500,
      },
    },
    skip: false,
  });

  useEffect(() => {
    if (!data || isFetching) return;
    if (data.Result && Array.isArray(data.Data)) {
      setList([]);
      setList(data.Data as ISelectOption[]);
    } else {
      setList([]);
    }
    if (isError) {
      setList([]);
    }
  }, [data, isError, isFetching]);

  const filterData = useFilteredList(list, searchPhrase, [
    "_SelectDisplay",
    "_SelectValue",
  ]);

  const showNotFound =
    !isFetching && list.length > 0 && filterData.length === 0;

  return (
    <div
      className={`${match ? "h-full" : ""} flex flex-col gap-3 p-4 border rounded-lg w-full lg:w-60 lg:min-w-60`}
    >
      <div className="flex items-center gap-3">{sideBarTitle}</div>
      {match ? (
        <>
          <DebounceSearch setSearch={handleChangeSearchPhrase} />
          {showNotFound ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              {t("general.notFoundData")}
            </div>
          ) : (
            <SideBarFormList
              dataList={filterData}
              isFetching={isFetching}
              setTypeId={setTypeId}
              typeId={typeId}
              idFieldName={config.idFieldName}
            />
          )}
        </>
      ) : (
        <DynamicSelect
          showSearch
          allowClear
          optionFilterProp={"label"}
          dynamicValue={{
            addWebUrl: "/api/acc/select/voucherType4searchBox",
            endpoint: "/api/acc/select/voucherType4searchBox",
            repoViewId: null,
            OrderInfo: [
              {
                Asc: true,
                ColName: config.idFieldName,
              },
            ],
          }}
          value={typeId}
          onChange={(val) => setTypeId(val)}
          autoFocus
          selectFirstDefault={false}
        />
      )}
    </div>
  );
}
