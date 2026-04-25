"use client";
import Title from "@components/atoms/Title";
import VoucherTypeListSideBar from "@components/organisms/voucherTypeListSideBar";
import { shallowEqual, useDispatch } from "react-redux";
import { useAppSelector } from "@redux/index";
import { useEffect, useState } from "react";
import { addNewPage } from "@slice/pages";
import { PageTypeEnum } from "@type/enum";
import VoucherTypeDescriptionsToolbar from "./voucherTypeDescriptionsToolbar";
import VoucherTypeContext from "./voucherTypeContext";

export default function VoucherTypeDescriptionTemplate() {
  const [voucherTypeId, setVoucherTypeId] = useState<number>(undefined);

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
        caption: "title.detailedDescription",
        icon: "IssuingProformaInvoiceIcon",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
        url: "acc/voucherTypeDescription",
        listPageId: initPage?.listPageId,
      }),
    );
  }, []);

  return (
    <div className="relative">
      <Title caption={"title.webHook"} />
      <div className="relative flex lg:flex-row items-center flex-col gap-4 h-full">
        <VoucherTypeDescriptionsToolbar />
        <VoucherTypeListSideBar setVoucherTypeId={setVoucherTypeId} />
        {voucherTypeId ? (
          <div
            className={`hidden-show-scrollBar relative p-4 border-2 border-dashed rounded w-full h-[calc(100dvh-165px)] overflow-auto`}
          >
            <VoucherTypeContext voucherTypeId={voucherTypeId} />
          </div>
        ) : (
          <div className="flex justify-center items-center w-full h-full text-gray-400">
            لطفاً ابتدا نوع سند را انتخاب کنید.
          </div>
        )}
      </div>
    </div>
  );
}
