import React from "react";
import { IRepoViewConfig } from "@services/generalType/type";
import { BankStatementRow } from "@components/molecules/receiptAndPayment/headerInfo/type";
import moment from "moment-jalaali";

const formatVoucherDate = (value?: string, locale?: string): string => {
  if (!value) return "";

  if (locale === "fa") {
    return moment(value).locale("fa").format("jYYYY/jMM/jDD")
  }
   
};

export const getColumnsList = (locale: string): IRepoViewConfig => ({
  column: [
    // {
    //   fieldCaption: "ID",
    //   fieldName: "BankStatementId",
    //   fieldType: "text",
    // },
    {
      fieldCaption: "نوع",
      fieldName: "VoucherTypeId",
      fieldType: "text",
    },
    // {
    //   fieldCaption: "RpWayId",
    //   fieldName: "RpWayId",
    //   fieldType: "text",
    // },
    {
      fieldCaption: "تاریخ",
      fieldName: "VoucherDate",
      fieldType: "text",
      renderFunction: (row: BankStatementRow) =>
        formatVoucherDate(row.VoucherDate, locale),
    },
    {
      fieldCaption: "شرح",
      fieldName: "VoucherDesc",
      fieldType: "text",
    },
    // {
    //   fieldCaption: "YearId",
    //   fieldName: "YearId",
    //   fieldType: "text",
    // },
    // {
    //   fieldCaption: "BankAccountId",
    //   fieldName: "BankAccountId",
    //   fieldType: "text",
    // },

    // {
    //   fieldCaption: "TafsiliId",
    //   fieldName: "TafsiliId",
    //   fieldType: "text",
    // },

    {
      fieldCaption: "مبلغ",
      fieldName: "Price",
      fieldType: "price",
      renderFunction: (row: BankStatementRow) =>
        React.createElement(
          "span",
          {
            className:
              row.VoucherTypeId === 3011
                ? "!text-green-900"
                : row.VoucherTypeId === 3012
                  ? "!text-red-500"
                  : "text-gray-gray11",
          },
          row.Price,
        ),
    },
    {
      fieldCaption: "شماره فیش",
      fieldName: "FishNumber",
      fieldType: "text",
    },
    {
      fieldCaption: "شرح فیش",
      fieldName: "TafsiliDesc",
      fieldType: "text",
    },
    {
      fieldCaption: "توضیحات",
      fieldName: "RpWayDesc",
      fieldType: "text",
    },
  ],
});
