import moment from "moment";

import { IDetailColumnConfig } from "@components/organisms/erp-table";
import { IMultiSelectConfig } from "@components/organisms/erp-table/ui/type";
import type { IFormFieldConfig } from "@type/elementType";
import { eChequePrommisoryType } from "@type/enum";
import { filterTypeStringEnum } from "@services/base/type";

export const checkFormConfig: IFormFieldConfig[] = [
  {
    name: "VoucherNumber",
    caption: "شماره سند",
    type: "text",
  },
  {
    name: "VoucherDate",
    caption: "تاریخ سند",
    type: "date",
    value: moment(new Date()).toISOString(),
    originalValue: moment(new Date()).toISOString(),
  },
  {
    name: "VoucherNatureId",
    caption: "ماهیت چک",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/trh/select/commonInfo/voucherNature",
      endpoint: "/api/trh/select/commonInfo/voucherNature",
      repoViewId: null,
    },
  },
  {
    name: "IsGuaranteeWithoutDueDate",
    caption: "تضمینی فاقد سررسید",
    type: "checkBox",
  },
  {
    name: "VoucherTypeId",
    caption: "نوع سند",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/com/select/voucherType4Voucher",
      endpoint: "/api/com/select/voucherType4Voucher",
      repoViewId: 30085,
    },
  },
  {
    name: "AccountingSerial",
    caption: "شماره سند حسابداری",
    type: "text",
  },
  {
    name: "BankAccountId",
    caption: "حساب بانکی",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/trh/select/bankaccount4selectoption",
      endpoint: "/api/trh/select/bankaccount4selectoption",
      repoViewId: 106081,
    },
  },
  {
    name: "VoucherDesc",
    caption: "شرح سند",
    type: "text",
  },
  {
    name: "RpWayId",
    caption: "نحوه دریافت و پرداخت",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/trh/select/rpWay4voucher",
      endpoint: "api/trh/select/rpWay4voucher",
      repoViewId: null,
    },
  },
  {
    name: "TafsiliId",
    caption: "سطح چهارم",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel4",
      endpoint: "/api/acc/select/tafsiliLevel4",
      repoViewId: 10017,
    },
  },
  {
    name: "FifthId",
    caption: "سطح پنجم",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel5",
      endpoint: "/api/acc/select/tafsiliLevel5",
    },
  },
  {
    name: "SixthId",
    caption: "سطح ششم",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel6",
      endpoint: "/api/acc/select/tafsiliLevel6",
    },
  },
  {
    name: "SeventhId",
    caption: "سطح 7",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel7",
      endpoint: "/api/acc/select/tafsiliLevel7",
    },
  },
  {
    name: "EightId",
    caption: "سطح 8",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel8",
      endpoint: "/api/acc/select/tafsiliLevel8",
    },
  },
  {
    name: "NineId",
    caption: "سطح 9",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel9",
      endpoint: "/api/acc/select/tafsiliLevel9",
    },
  },
  {
    name: "TenId",
    caption: "سطح 10",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel10",
      endpoint: "/api/acc/select/tafsiliLevel10",
    },
  },
  {
    name: "ElevenId",
    caption: "سطح 11",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel11",
      endpoint: "/api/acc/select/tafsiliLevel11",
    },
  },
  {
    name: "TwelveId",
    caption: "سطح 12",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel12",
      endpoint: "/api/acc/select/tafsiliLevel12",
    },
  },
  {
    name: "ThirteenId",
    caption: "سطح 13",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel13",
      endpoint: "/api/acc/select/tafsiliLevel13",
    },
  },
  {
    name: "Details",
    caption: "",
    type: "array",
    value: [],
    originalValue: [],
  },
];
export const checkColumnConfig = (
  bankAccountId: number,
): IDetailColumnConfig[] => {
  return [
    {
      fieldName: "index",
      fieldCaption: " ردیف - عملیات",
      fieldType: "index",
      order: 1,
      visibility: { kind: "always" },
    },
    {
      fieldName: "CheckPlaceMentDetailId",
      fieldCaption: "چک",
      fieldType: "selectOption",
      popUpWidth: 250,
      dynamicSource: {
        endpoint: "api/trh/select/CheckPlacementDetail/Check/Issuance",
        repoViewId: 140029,
        BankAccountId: bankAccountId,
        dependOn: {
          value: bankAccountId,
          fieldName: "BankAccountId",
        },
        OrderInfo: [
          {
            Asc: true,
            ColName: "DocNum",
          },
        ],
      },
      resolveOn: {
        fieldName: "CheckPlaceMentDetailId",
        endpoint: "/api/trh/select/checkPlacementDetail/searchbox",
        buildParams: (row) => ({
          Id: Number(row.CheckPlaceMentDetailId),
          Type: eChequePrommisoryType.Cheque,
        }),
        getResponse(response, row) {
          if (response?.Result === "Success") {
            row
              .getCell("SayyadNum")
              ?.changeValue(response.Data[0]["SayyadNum"]);
          }
        },
      },
      order: 2,
      visibility: { kind: "always" },
    },
    {
      fieldName: "SayyadNum",
      fieldCaption: "شماره صیادی",
      fieldType: "text",
      editable: false,
      order: 3,
      visibility: { kind: "always" },
    },
    {
      fieldName: "MaturityDate",
      fieldCaption: "تاریخ سررسید",
      fieldType: "date",
      order: 4,
      visibility: { kind: "always" },
    },
    {
      fieldName: "DocPrice",
      fieldCaption: "مبلغ",
      fieldType: "price",
      order: 5,
      visibility: { kind: "always" },
    },
    {
      fieldName: "IsForToday",
      fieldCaption: "چک روز",
      fieldType: "checkbox",
      order: 6,
      visibility: { kind: "always" },
    },
    {
      fieldName: "DetailDesc",
      fieldCaption: "شرح",
      fieldType: "text",
      order: 7,
      visibility: { kind: "always" },
    },
    {
      fieldName: "DocumentChequeId",
      fieldCaption: "شناسه چک",
      fieldType: "number",
      order: 8,
      visibility: { kind: "always" },
    },
  ];
};

export const multiSelectConfig = (
  bankAccountId: number,
): IMultiSelectConfig => {
  console.log({ bankAccountId });
  return {
    dynamicValue: {
      endpoint: "/api/trh/select/checkPlacementDetail/searchbox",
      repoViewId: null,
      Type: eChequePrommisoryType.Cheque,
      BankAccountId: bankAccountId,
    },
    fieldKey: "CheckPlaceMentDetailId",
    detailFieldKey: "CheckPlaceMentDetailId",
    onAdd(e) {
      console.log(e);
    },
    ListConfig: [
      {
        fieldName: "index",
        fieldCaption: "index",
        fieldType: "index",
      },
      {
        fieldName: "DocNum",
        fieldCaption: "شماره چک",
        fieldType: "number",
      },
      {
        fieldName: "SayyadNum",
        fieldCaption: "شماره صیادی",
        fieldType: "text",
      },
      {
        fieldName: "AccountName",
        fieldCaption: "شرح حساب ",
        fieldType: "text",
      },
    ],
  };
};
