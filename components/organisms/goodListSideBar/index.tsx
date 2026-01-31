// RepoAssignSidebar.tsx
import React, { Dispatch, useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { DynamicSelect } from "@components/atoms/defaultElements";
import { SpinIcon } from "@components/atoms/iconComponents";
import { useGetData } from "@services/base";
import { IRepoEntityData, IRequestConfig } from "@type/elementType";
import { getSystemNameById } from "@utils/core";

import { DebounceSearch } from "./debounceSearch";
import GoodList from "./GoodList";

export default function GoodListSideBar({
  systemId,
  setSystemId,
}: {
  systemId: number;
  setSystemId: Dispatch<React.SetStateAction<number>>;
}) {
  const t = useTranslations();

  const [searchPhrase, setSearchPhrase] = useState("");
  const [goodsList, setGoodsList] = useState<IRepoEntityData[]>([]);

  const entityRepoDynamicSelect: IRequestConfig = {
    endpoint: "/api/mng/select/systemAccount4SelectOption",
  };

  const handleChangeSearchPhrase = useCallback((value: string) => {
    setSearchPhrase(value);
  }, []);

  const {
    data: repoEntityData,
    isFetching,
    isError,
  } = useGetData({
    url: systemId
      ? `/api/${getSystemNameById(systemId)}/select/repoEntity`
      : "",
    body: {
      FullSearchPhrase: searchPhrase,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 500,
      },
    },
    skip: !systemId,
  });

  useEffect(() => {
    if (!systemId || !repoEntityData || isFetching) return;
    if (repoEntityData.Result && Array.isArray(repoEntityData.Data)) {
      setGoodsList([]);
      setGoodsList(repoEntityData.Data as IRepoEntityData[]);
    } else {
      setGoodsList([]);
    }
    if (isError) {
      setGoodsList([]);
    }
  }, [repoEntityData, systemId, isError,isFetching]);

  useEffect(() => {
    setSearchPhrase("");
  }, [systemId]);

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg w-full sm:w-60 sm:min-w-60 h-[calc(100dvh-165px)]">
      <div className="flex items-center gap-3">{t("general.systems")}</div>
      <DynamicSelect
        dynamicValue={entityRepoDynamicSelect}
        onChange={(value, option) => {
          const id = (option as any)?.option?._SelectId;
          setSystemId(id || undefined);
        }}
      />
      {!systemId ? (
        <div className="flex justify-center items-center h-full text-gray-400 text-sm text-center">
          {t("general.firstChooseASystem")}
        </div>
      ) : isFetching && goodsList.length === 0 ? (
        <div className="flex justify-center items-center h-full text-gray-400">
          <SpinIcon config={{ width: 12, height: 12 }} />
        </div>
      ) : goodsList.length === 0 && !isFetching ? (
        <div className="flex justify-center items-center h-full text-gray-400">
          {t("general.notFoundData")}
        </div>
      ) : (
        <>
          <DebounceSearch setSearch={handleChangeSearchPhrase} />
          <GoodList
            goodList={goodsList}
            isFetching={isFetching}
          />
        </>
      )}
    </div>
  );
}
