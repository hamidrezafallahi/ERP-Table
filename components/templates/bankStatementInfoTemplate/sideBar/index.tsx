import React, { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { useGetData } from "@services/base";

import { DebounceSearch } from "./debounceSearch";
import InfiniteScrollGoodList from "./InfiniteScrollGoodList";


interface ISelectOption {
  _SelectId: number;
  _SelectValue: string;
  _SelectDisplay: string;
}

interface Props {
  onSelectBankAccount: (id: number) => void;
}
export default function BankStatementInfoSidebar({ onSelectBankAccount }: Props) {
  const [pageNumber, setPageNumber] = useState(1);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [bankAccountList, setBankAccountList] = useState<ISelectOption[]>([]);
  const t = useTranslations();
  const { data, isLoading, isFetching } = useGetData({
    url: "/api/trh/select/bankaccount4selectoption",
    body: {
      FullSearchPhrase: searchPhrase,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: 15,
      },
    },
  });
  const { data: totalBankAccountdata } = useGetData({
    url: "/api/trh/select/bankaccount4selectoption",
    body: {
      FullSearchPhrase: searchPhrase,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 1000,
        OnlyTotalCount: true,
      },
    },
  });

  const handleChangeSearchPhrase = (e: string) => {
    setBankAccountList([])
    setSearchPhrase(e);
    setPageNumber(1);
  };

useEffect(() => {
  if (data && data?.Result === "Success") {
    setBankAccountList((prev) => {
      const newItems = data.Data as ISelectOption[];
      const filteredItems = newItems.filter(
        (item) => !prev.some((prevItem) => prevItem._SelectId === item._SelectId)
      );
      return [...prev, ...filteredItems];
    });
  }
}, [data]);
  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg w-full sm:w-60 h overflow-auto">
      <div>{t("bankStatementInfo.accounts")}</div>
      <DebounceSearch setSearch={handleChangeSearchPhrase} />
      <InfiniteScrollGoodList
        bankAccountList={bankAccountList}
        showSkeleton={isLoading || isFetching}
        setPage={setPageNumber}
        totalCount={totalBankAccountdata?.TotalCount}
         onSelectBankAccount={onSelectBankAccount}
      />
    </div>
  );
}
