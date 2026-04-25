"use client";
import Title from "@components/atoms/Title";
import { shallowEqual, useDispatch } from "react-redux";
import { useAppSelector } from "@redux/index";
import { useEffect, useState } from "react";
import { addNewPage } from "@slice/pages";
import { PageTypeEnum } from "@type/enum";
import TafsiliCategoryToolbar from "./tafsiliCategoryToolbar";
import DynamicModal from "@components/organisms/dynamicModal";
import { getTafsiliCategoryConfig } from "./config";
import { useTranslations } from "next-intl";
import { TafsiliCategorySideBar } from "@components/organisms/tafsiliCategorySideBar";

export default function TafsiliCategoryTemplate() {
  const [tafsiliCategoryId, setTafsiliCategoryId] = useState<number>(undefined);

  const dispatch = useDispatch();
  const { initPage } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: initPage.pageId,
        caption: "title.tafsiliCategory",
        icon: "IssuingProformaInvoiceIcon",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
        url: "acc/tafsiliCategory",
        listPageId: initPage?.listPageId,
      }),
    );
  }, []);

  return (
    <div className="relative">
      <Title caption={"title.webHook"} />
      <div className="relative flex lg:flex-row items-center flex-col gap-4 h-full">
        <TafsiliCategoryToolbar />
        <TafsiliCategorySideBar />
        {tafsiliCategoryId ? (
          <div
            className={`hidden-show-scrollBar relative p-4 border-2 border-dashed rounded w-full h-[calc(100dvh-165px)] overflow-auto`}
          >
            <DynamicModal
              id={tafsiliCategoryId}
              sourceKey="tafsiliId"
              config={getTafsiliCategoryConfig(tafsiliCategoryId)}
              pageCount={12}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center w-full h-full text-gray-400">
            لطفاً ابتدا طبقه تفصیلی را انتخاب کنید.
          </div>
        )}
      </div>
    </div>
  );
}
