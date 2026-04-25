// RepoAssignSidebar.tsx
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";
import { useTranslations } from "next-intl";
import { SpinIcon } from "@components/atoms/iconComponents";
import { useGetData } from "@services/base";
import { ISelectOption } from "@type/elementType";

import { DebounceSearch } from "./debounceSearch";
import VoucherTypeList from "./voucherTypeList";

export default function VoucherTypeListSideBar({
  setVoucherTypeId,
}: {
  setVoucherTypeId: Dispatch<SetStateAction<number>>;
}) {
  const t = useTranslations();

  const [searchPhrase, setSearchPhrase] = useState("");
  const [vocherTypeList, setVocherTypeList] = useState<ISelectOption[]>([]);

  const handleChangeSearchPhrase = useCallback((value: string) => {
    setSearchPhrase(value);
  }, []);

  const {
    data: voucherTypeData,
    isFetching,
    isError,
  } = useGetData({
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
    if (!voucherTypeData || isFetching) return;
    if (voucherTypeData.Result && Array.isArray(voucherTypeData.Data)) {
      setVocherTypeList([]);
      setVocherTypeList(voucherTypeData.Data as ISelectOption[]);
    } else {
      setVocherTypeList([]);
    }
    if (isError) {
      setVocherTypeList([]);
    }
  }, [voucherTypeData, isError, isFetching]);

  const filteredVoucherTypes = useMemo(() => {
    const phrase = searchPhrase.trim().toLowerCase();
    if (!phrase) return vocherTypeList;

    return vocherTypeList.filter((item) => {
      const text =
        String((item as any)?._SelectDisplay || "").toLowerCase() +
        " " +
        String((item as any)?._SelectValue || "").toLowerCase();

      return text.includes(phrase);
    });
  }, [vocherTypeList, searchPhrase]);

  const showNotFound =
    !isFetching &&
    vocherTypeList.length > 0 &&
    filteredVoucherTypes.length === 0;

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg w-full sm:w-60 sm:min-w-60 h-[calc(100dvh-165px)]">
      <div className="flex items-center gap-3">نوع سند</div>
      <DebounceSearch setSearch={handleChangeSearchPhrase} />
      {isFetching && vocherTypeList.length === 0 ? (
        <div className="flex justify-center items-center h-full text-gray-400">
          <SpinIcon config={{ width: 12, height: 12 }} />
        </div>
      ) : showNotFound ? (
        <div className="flex justify-center items-center h-full text-gray-400">
          {t("general.notFoundData")}
        </div>
      ) : (
        <VoucherTypeList
          voucherTypeList={filteredVoucherTypes}
          isFetching={isFetching}
          setVoucherTypeId={setVoucherTypeId}
        />
      )}
    </div>
  );
}
