"use client";
import { InvoiceForm } from "@components/molecules/salesAndPurchase/invoiceForm";
import { useAppSelector } from "@redux/index";
import { shallowEqual } from "react-redux";

export const Invoice = ({ form }) => {
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find(
        (item) => item.isActive === true,
      ),
    }),
    shallowEqual,
  );
  return <InvoiceForm form={form} activePage={activePage} />;
};
