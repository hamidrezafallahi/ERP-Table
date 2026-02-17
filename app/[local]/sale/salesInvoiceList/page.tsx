"use client";

import { useTranslations } from 'next-intl';

import ViewList from '@components/templates/viewList';
import { BadgeTypeEnum } from '@services/generalType/type';
import type {
  IRequest,
  IStandardSalesInvoice,
} from '@services/sale/standardSalesInvoice/type';

export default function SalesInvoiceList() {
  const t = useTranslations();

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
      // conditionalActions={[
      //   {
      //     conditionalProperty: "IsNotPaid",
      //     conditionallyAction: ActionLabelsEnum.Settlement as string,
      //   },
      // ]}
      customColumns={customColumns}
    />
  );
}
