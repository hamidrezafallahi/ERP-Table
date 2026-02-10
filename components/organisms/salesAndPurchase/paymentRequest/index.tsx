"use client";
import { DetailDataGrid } from "@components/molecules/detailDataGrid";
import { PaymentRequestForm } from "@components/molecules/salesAndPurchase/paymentRequestForm";
import { useAppSelector } from "@redux/index";
import { shallowEqual } from "react-redux";

export const PaymentRequest = ({ form }) => {
  const { activePage, fullScreen, minimizePanel, match, init, locale } =
    useAppSelector(
      (state) => ({
        activePage: state.withPersist.pages?.find((item) => item.isActive),
        fullScreen: state.withPersist.config.fullScreen,
        minimizePanel: state.withoutPersist.container.minimize,
        init: state?.withPersist?.init,
        locale: state.withPersist.config.lang,
        match: state.withPersist.config.initMatch,
      }),
      shallowEqual,
    );

  return (
    <>
      <PaymentRequestForm form={form} activePage={activePage} />
      <div
        className={`${
          fullScreen
            ? "w-full"
            : `${
                minimizePanel
                  ? "w-fit max-w-[calc(100dvw-300px)]"
                  : "w-fit max-w-[calc(100dvw-550px)]"
              }`
        } hidden-show-scrollBar transition-all duration-200 h-[calc(100dvh-457px)] overflow-y-auto`}
      >
      </div>
    </>
  );
};
