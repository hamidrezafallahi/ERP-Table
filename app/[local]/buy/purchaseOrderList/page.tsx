"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";

import { CustomButton, CustomModal } from "@components/atoms/defaultElements";
import { New, PurchaseRequestIcon } from "@components/atoms/iconComponents";
import { PurchaseRequest } from "@components/molecules/purchaseRequest";
import ViewList from "@components/templates/viewList";
import { useAppSelector } from "@redux/index";
import type {
  IPurchaseOrder,
  IRequest,
} from "@services/buy/purchaseOrder/type";
import { showInfoToast } from "@utils/core";

export default function PurchaseOrderListPage() {
  const t = useTranslations();

  const { selectedItems, activePage, match } = useAppSelector(
    (state) => ({
      selectedItems: state.withPersist.listItems,
      activePage: state.withPersist.pages.find((item) => item.isActive),
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual
  );

  const [actionModalIsOpen, setActionModalIsOpen] = useState(false);

  const handleAction = () => {
    if (
      selectedItems &&
      selectedItems.itemsByPage?.[activePage?.pageId] &&
      selectedItems.itemsByPage?.[activePage?.pageId]?.length > 0
    ) {
      setActionModalIsOpen(true);
    } else {
      showInfoToast(t("toast.minOneItemToast"), t("title.purchaseRequest"));
    }
  };
  const renderAction = () => {
    return (
      <CustomButton
        type="text"
        className={`${
          match ? "rounded" : "rounded-full"
        } flex justify-center items-center dark:bg-white dark:text-main-black bg-black-black8 !hover:bg-white p-[6px] border hover:border-black-black8   h-full text-white hover:text-black-black9 text-xs`}
        onClick={handleAction}
      >
        <New
          inheritStyle
          config={{
            width: 20,
            height: 20,
          }}
        />
        <div className="hidden xxl:block">
          {match && t("title.purchaseRequest")}
        </div>
      </CustomButton>
    );
  };

  return (
    <>
      <ViewList<IPurchaseOrder, IRequest>
        url="api/buy/select/orderedGoodsReceived"
        renderCustomActions={renderAction}
        staticKey="UniqueId"
        rowFieldKey="UniqueId"
        caption={"title.purchaseOrderList"}
        baseRepoId={12001}
        pageIcon="PurchaseOrderListIcon"
      />
      {actionModalIsOpen && (
        <CustomModal
          contentClassName={`${match ? "w-[520px] !h-[200px]" : ""}`}
          headerName={t("title.purchaseRequest")}
          headerIcon={match && <PurchaseRequestIcon />}
          closeModal={() => setActionModalIsOpen(false)}
          isModalOpen={actionModalIsOpen}
          content={
            <PurchaseRequest
              ids={selectedItems.itemsByPage?.[activePage?.pageId]}
              handleClose={() => setActionModalIsOpen(false)}
            />
          }
        />
      )}
    </>
  );
}
