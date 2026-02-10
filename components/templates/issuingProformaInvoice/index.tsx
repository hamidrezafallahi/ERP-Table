"use client"

import InfoSection from "@components/organisms/salesAndPurchase/issuingProformaInvoice/infoSection";
import { useAppSelector } from "@redux/index";
import { shallowEqual } from "react-redux";

export default function IssuingProformaInvoice() {
  const { match } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual
  );
  return (
    <div
      className={`${
        !match && "h-[calc(100dvh-140px)] overflow-y-auto"
      } flex flex-col gap-3 p-2`}
    >
      <InfoSection />
    </div>
  );
}
