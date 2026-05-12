"use client";
import Title from "@components/atoms/Title";
import { shallowEqual, useDispatch } from "react-redux";
import { useAppSelector } from "@redux/index";
import { useEffect, useState } from "react";
import { addNewPage } from "@slice/pages";
import { PageTypeEnum } from "@type/enum";
import SideBarForm from "@components/organisms/sideBarForm";
import { tafsiliCategoryConfig } from "./tafsiliCategoryConfig";
import { HeaderTypeEnum } from "@slice/pages/enum";
import CustomFormContext from "@components/organisms/tafsiliCategory/tafsiliCategoryContext";
import { TafsiliCategorySideBar } from "@components/organisms/tafsiliCategory/tafsiliCategorySideBar";

export default function TafsiliCategoryTemplate() {
  const [tafsiliCategoryId, setTafsiliCategoryId] = useState<number>(undefined);
  const dispatch = useDispatch();
  const { initPage, match } = useAppSelector(
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
        headerType: HeaderTypeEnum.MobileWithoutSearch,
        returnPageId: initPage.pageId,
      }),
    );
  }, []);

  return (
    <div
      className={`${match ? "h-full mt-0" : "h-[calc(100dvh-10rem)] mt-4 overflow-hidden"} relative`}
    >
      <Title caption={"title.tafsiliCategory"} />
      <SideBarForm
        id={tafsiliCategoryId}
        setId={setTafsiliCategoryId}
        config={tafsiliCategoryConfig(tafsiliCategoryId)}
        sideBarTitle={"طبقه تفصیلی"}
        ExternalSidebar={TafsiliCategorySideBar}
        ExternalCustomForm={CustomFormContext}
      />
    </div>
  );
}
