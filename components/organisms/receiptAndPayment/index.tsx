"use client";
import { useEffect } from "react";

import { shallowEqual, useDispatch } from "react-redux";

import Title from "@components/atoms/Title";
import { useAppSelector } from "@hooks/custom/useAppSelector";
import { addNewPage } from "@slice/pages";
import { PageTypeEnum } from "@type/enum";

import {
  MainHeaderSection,
  MainInfoSection,
  ReceiptAndPaymentToolbar,
} from "./main";

export default function ReceiptAndPayment() {
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
        caption: `title.receiptAndPayment`,
        icon: "ReceiptsAndPayments",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
        url: "trh/receiptAndPayment",
        listPageId: initPage?.listPageId,
      }),
    );
  }, []);

  return (
    <>
      <Title caption={"title.receiptAndPayment"} />
      <div className={`${match ? "relative" : ""} w-full`}>
        <div
          className={
            match ? `absolute -top-[60px] rtl:-left-[10px] -right-[10px] ` : ""
          }
        >
          <ReceiptAndPaymentToolbar />
        </div>
      </div>
      <div
        className={`${
          !match && "h-[calc(100dvh-140px)] overflow-y-auto"
        } flex flex-col gap-3 p-2 h-full`}
      >
        <MainInfoSection />
      </div>
    </>
  );
}
