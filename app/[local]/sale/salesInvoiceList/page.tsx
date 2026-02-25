"use client";

import { useTranslations } from "next-intl";

import { ActionLabelsEnum } from "@components/organisms/list/enum";
import ViewList from "@components/templates/viewList";
import { useGetData } from "@services/base";
import type { IAvailableCurrency } from "@services/com/currency/type";
import { BadgeTypeEnum } from "@services/generalType/type";
import type {
  IRequest,
  IStandardSalesInvoice,
} from "@services/sale/standardSalesInvoice/type";
import type { IToolbarMenu } from "@type/toolbar";

export default function SalesInvoiceList() {
  const t = useTranslations();

  const { data } = useGetData<IAvailableCurrency[], null>({
    url: "api/com/select/availableCurrencies",
    body: {},
  });

  const baseCurrency =
    data?.Data?.find((currency) => currency.IsBase)?.CurrencyId ?? null;

  const filteringAction = (
    actions: IToolbarMenu[],
    rowData: IStandardSalesInvoice,
  ) => {
    if (rowData?.["Currency.CurrencyId"] === baseCurrency) {
      const filteredAction = actions.filter(
        (action) =>
          action.MenuDesc !== ActionLabelsEnum.ChangeInvoiceCurrency &&
          action.MenuDesc !== ActionLabelsEnum.ChangeInvoiceCurrencyRate,
      );
      return filteredAction;
    } else {
      return actions;
    }
  };

  const customColumns = [
    {
      fieldName: "IsRemaining",
      fieldCaption: t("general.settlementState"),
      fieldType: "function",
      BadgeType: BadgeTypeEnum.Error,
      renderFunction: (record) => {
        const remainingAmount = record?.RemainingAmount
          ? t("general.remaining") +
            ` ( ${record?.RemainingAmount?.toLocaleString("fa-IR")} )`
          : t("general.notPaid");
        return !record?.IsNotPaid ? (
          <span className="p-1 rounded text-green-400">
            {t("general.paid")}
          </span>
        ) : (
          <span className="p-1 rounded text-red-600">{remainingAmount}</span>
        );
      },
    },
  ];
  return (
    <ViewList<IStandardSalesInvoice, IRequest>
      url="/api/sale/select/invoice"
      deleteUrl="/api/sale/delete/invoice"
      staticKey="VoucherNumber"
      staticKeyII="VoucherDate"
      rowFieldKey="InvoiceHeaderId"
      formUrl="sale/standardSalesInvoice"
      addCaption={t("general.addNew")}
      caption={"title.salesInvoiceList"}
      baseRepoId={1014}
      pageIcon="SalesInvoiceIcon"
      conditionalActions={[
        {
          conditionalProperty: "IsNotPaid",
          conditionallyAction: ActionLabelsEnum.ChangeInvoiceCurrency as string,
        },
        {
          conditionalProperty: "IsNotPaid",
          conditionallyAction:
            ActionLabelsEnum.ChangeInvoiceCurrencyRate as string,
        },
        // {
        //   conditionalProperty: "IsNotPaid",
        //   conditionallyAction: ActionLabelsEnum.Settlement as string,
        // },
      ]}
      customColumns={customColumns}
      filteringAction={filteringAction}
    />
  );
}
