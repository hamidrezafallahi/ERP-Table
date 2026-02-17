"use client";

import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IBuyRequest, IRequest } from "@services/buy/buyRequest/type";

export default function OrderList() {
  const t = useTranslations();

  return (
    <ViewList<IBuyRequest, IRequest>
      url="/api/buy/select/buyRequest"
      deleteUrl="/api/buy/delete/buyRequest"
      staticKey="DocId"
      staticKeyII="VoucherDate"
      rowFieldKey="BuyRequestHeaderId"
      formUrl="buy/order"
      addCaption={t("general.addNew")}
      caption={"title.orderList"}
      baseRepoId={12002}
      pageIcon="PurchaseRequestIcon"
    />
  );
}
