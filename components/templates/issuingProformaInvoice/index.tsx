"use client";

import { MainInfoCard } from "@components/molecules/mainInfoCard";
import { useAppSelector } from "@redux/index";
import { shallowEqual, useDispatch } from "react-redux";
import { documentInfoConfig } from "./config";
import { useEffect } from "react";
import { addNewPage } from "@slice/pages";
import { PageTypeEnum } from "@type/enum";

export default function IssuingProformaInvoice() {
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
        caption: `title.issuingProformaInvoice`,
        icon: "IssuingProformaInvoiceIcon",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
        url: "sale/issuingProformaInvoice",
        listPageId: initPage?.listPageId,
      }),
    );
  }, []);

  return (
    <div
      className={`${
        !match && "h-[calc(100dvh-140px)] overflow-y-auto"
      } flex flex-col gap-3 p-2`}
    >
      <div
        className={`${
          match
            ? "gap-3 grid grid-cols-3 h-[10.313rem] max-h-full"
            : "flex flex-col gap-2"
        }`}
      >
        {documentInfoConfig.map((item, index) => (
          <MainInfoCard temp={item} key={index} titleGroup="title" />
        ))}
      </div>
    </div>
  );
}
