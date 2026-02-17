import type { IDetailColumnConfig } from "@services/generalType/type";
import type { IFormFieldConfig } from "@type/elementType";

import { stateConfig } from "../../config";

export const formConfig: IFormFieldConfig[] = [
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
    name: "VoucherTypeId",
    caption: "نوع سند",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/com/select/voucherType4Voucher",
      endpoint: "/api/com/select/voucherType4Voucher",
      repoViewId: 30085,
    },
    value: 6020,
    originalValue: 6020,
  },
  {
    name: "CashierId",
    caption: "صندوقدار",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/trh/Select/Cashier4SelectOption",
      endpoint: "/api/trh/Select/Cashier4SelectOption",
      repoViewId: 140002,
    },
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
  // {
  //   name: "",
  //   caption: "دستور دریافت",
  //   type: "selectOption",
  //   selectEndpoint: {
  //     addWebUrl: "",
  //     endpoint: "",
  //   },
  // },
  {
    name: "VoucherNatureId",
    caption: "ماهیت",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/trh/select/commonInfo/voucherNature",
      endpoint: "api/trh/select/commonInfo/voucherNature",
      repoViewId: null,
    },
  },
  // {
  //   name: "",
  //   caption: "تضمینی فاقد سررسید",
  //   type: "checkBox",
  // },
  {
    name: "VoucherDesc",
    caption: "شرح سند",
    type: "text",
  },
  {
    name: "Details",
    caption: "",
    type: "array",
    value: [],
    originalValue: [],
  },
];

export const columnConfig: IDetailColumnConfig[] = [
  {
    fieldName: "index",
    fieldCaption: `ردیف - عملیات`,
    fieldType: "index",
    order: 1,
  },
  {
    fieldName: "Num",
    fieldCaption: "شماره صیاد",
    fieldType: "text",
    mobileRender: true,
    order: 2,
  },
  {
    fieldName: "MaturityDate",
    fieldCaption: "تاریخ سررسید",
    fieldType: "date",
    order: 3,
  },
  {
    fieldName: "BankId",
    fieldCaption: "نام بانک",
    fieldType: "selectOption",
    dynamicValue: {
      addWebUrl: "api/com/select/bank4BankAccount",
      endpoint: "api/com/select/bank4BankAccount",
      repoViewId: 30068,
    },
    mobileRender: true,
    order: 4,
  },
  {
    fieldName: "DocPrice",
    fieldCaption: "مبلغ",
    fieldType: "price",
    mobileRender: true,
    order: 5,
  },
  {
    fieldName: "IsRegistered",
    fieldCaption: "ثبت چک صیادی",
    fieldType: "boolean",
    mobileRender: true,
    order: 6,
  },
  {
    fieldName: "DetailDesc",
    fieldCaption: "شرح",
    fieldType: "text",
    order: 7,
  },
  {
    fieldName: "StateId",
    fieldCaption: "وضعیت چک",
    fieldType: "static",
    staticConfig: {
      mode: "staticOption",
      config: stateConfig,
      valueType: "staticOption",
    },
    mobileRender: true,
    order: 8,
  },
];
