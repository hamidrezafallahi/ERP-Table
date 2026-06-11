import { IDetailColumnConfig } from "@components/organisms/erp-table";
import type { IFormFieldConfig } from "@type/elementType";

export const promissoryNoteFormConfig: IFormFieldConfig[] = [
  {
    name: "VoucherNumber",
    caption: "شماره سند",
    type: "text",
  },
  {
    name: "VoucherDate",
    caption: "تاریخ سند",
    type: "date",
  },
  {
    name: "VoucherNatureId",
    caption: "ماهیت سفته",
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
      addWebUrl: "/api/com/select/bankAccount4selectOption",
      endpoint: "/api/com/select/bankAccount4selectOption",
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
export const promissoryNoteColumnConfig = (
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
      visibility: { kind: "always" },
      fieldType: "selectOption",
      dynamicSource: {
        addWebUrl: "api/trh/select/CheckPlacementDetail/Check/Issuance",
        endpoint: "api/trh/select/CheckPlacementDetail/Check/Issuance",
        repoViewId: 140029,
        BankAccountId: bankAccountId,
        dependOn: {
          value: bankAccountId,
          fieldName: "BankAccountId",
        },
      },
      order: 2,
    },
    {
      fieldName: "MaturityDate",
      fieldCaption: "تاریخ سررسید",
      fieldType: "date",
      visibility: { kind: "always" },
      order: 3,
    },
    {
      fieldName: "DocPrice",
      fieldCaption: "مبلغ",
      fieldType: "price",
      visibility: { kind: "always" },
      order: 4,
    },
    {
      fieldName: "IsForToday",
      fieldCaption: "چک روز",
      fieldType: "checkbox",
      visibility: { kind: "always" },
      order: 5,
    },
    {
      fieldName: "DetailDesc",
      fieldCaption: "شرح",
      fieldType: "text",
      visibility: { kind: "always" },
      order: 6,
    },
    {
      fieldName: "DocumentChequeId",
      fieldCaption: "شناسه چک",
      fieldType: "number",
      order: 7,
      visibility: { kind: "always" },
    },
  ];
};
