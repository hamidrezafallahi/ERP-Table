import { IDetailColumnConfig } from "@components/organisms/erp-table";
import type { IFormFieldConfig } from "@type/elementType";
import moment from "moment";

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
    value: moment(new Date()).toISOString(),
    originalValue: moment(new Date()).toISOString(),
  },
  {
    name: "CashierId",
    caption: "صندوقدار",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "/api/trh/Select/Cashier4SelectOption",
      repoViewId: 140002,
    },
  },
  {
    name: "VoucherNatureId",
    caption: "ماهیت",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "api/trh/select/commonInfo/voucherNature",
      repoViewId: null,
    },
  },
  {
    name: "IsGuaranteeWithoutDueDate",
    caption: "تضمینی فاقد سررسید",
    type: "checkBox",
  },
  {
    name: "VoucherDesc",
    caption: "شرح سند",
    type: "text",
  },
  {
    name: "AccountingSerial",
    caption: "شماره سند حسابداری",
    type: "text",
  },
  {
    name: "RpWayId",
    caption: "نحوه دریافت و پرداخت",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "api/trh/select/rpWay4voucher",
      repoViewId: null,
    },
  },
  {
    name: "DayCountAndDate",
    caption: "تاریخ راس - تعداد روز",
    type: "text",
  },
  {
    name: "VoucherNumber",
    caption: "شماره سند",
    type: "text",
  },
  {
    name: "TafsiliId",
    caption: "سطح چهارم",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "/api/acc/select/tafsiliLevel4",
      repoViewId: 10017,
    },
  },
  {
    name: "FifthId",
    caption: "سطح پنجم",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "/api/acc/select/tafsiliLevel5",
    },
  },
  {
    name: "SixthId",
    caption: "سطح ششم",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "/api/acc/select/tafsiliLevel6",
    },
  },
  {
    name: "SeventhId",
    caption: "سطح 7",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "/api/acc/select/tafsiliLevel7",
    },
  },
  {
    name: "EightId",
    caption: "سطح 8",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "/api/acc/select/tafsiliLevel8",
    },
  },
  {
    name: "NineId",
    caption: "سطح 9",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "/api/acc/select/tafsiliLevel9",
    },
  },
  {
    name: "TenId",
    caption: "سطح 10",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "/api/acc/select/tafsiliLevel10",
    },
  },
  {
    name: "ElevenId",
    caption: "سطح 11",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "/api/acc/select/tafsiliLevel11",
    },
  },
  {
    name: "TwelveId",
    caption: "سطح 12",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "/api/acc/select/tafsiliLevel12",
    },
  },
  {
    name: "ThirteenId",
    caption: "سطح 13",
    type: "selectOption",
    selectEndpoint: {
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

export const checkColumnConfig: IDetailColumnConfig[] = [
  {
    fieldName: "index",
    fieldCaption: " ردیف - عملیات",
    fieldType: "index",
    order: 1,
    enableDeleteButton: true,
    enableExpandButton: false,
    enableMoveButton: true,
    enableOptionsButton: true,
    visibility: { kind: "always" },
  },
  {
    fieldName: "IssuerSerial",
    fieldCaption: "شماره صیاد",
    fieldType: "text",
    visibility: { kind: "always" },
    order: 2,
  },
  {
    fieldName: "ShibaNumber",
    fieldCaption: "شماره شبا",
    fieldType: "text",
    visibility: { kind: "always" },
    order: 3,
  },
  {
    fieldName: "SerialNumber",
    fieldCaption: "سریال چک",
    fieldType: "text",
    visibility: { kind: "always" },
    order: 4,
  },
  {
    fieldName: "CheckSeries",
    fieldCaption: "سری چک",
    fieldType: "text",
    visibility: { kind: "always" },
    order: 5,
  },
  {
    fieldName: "MaturityDate",
    fieldCaption: "تاریخ سررسید",
    fieldType: "date",
    visibility: {
      kind: "always",
    },
    order: 6,
  },
  {
    fieldName: "BankId",
    fieldCaption: "نام بانک",
    fieldType: "selectOption",
    dynamicSource: {
      addWebUrl: "api/com/select/bank4BankAccount",
      endpoint: "api/com/select/bank4BankAccount",
      repoViewId: 30068,
    },
    visibility: {
      kind: "always",
    },
    order: 7,
  },
  {
    fieldName: "DocPrice",
    fieldCaption: "مبلغ",
    fieldType: "price",
    visibility: {
      kind: "always",
    },
    order: 8,
  },
  {
    fieldName: "DigitalCheck",
    fieldCaption: "دیجیتال چک",
    fieldType: "checkbox",
    visibility: { kind: "always" },
    order: 9,
  },
  {
    fieldName: "IsRegistered",
    fieldCaption: "ثبت چک صیادی",
    fieldType: "checkbox",
    visibility: {
      kind: "always",
    },
    order: 10,
  },
  {
    fieldName: "DetailDesc",
    fieldCaption: "شرح",
    fieldType: "text",
    visibility: {
      kind: "always",
    },
    order: 11,
  },
  {
    fieldName: "ChequeStateDesc",
    fieldCaption: "وضعیت چک",
    fieldType: "static",
    visibility: {
      kind: "always",
    },
    order: 12,
  },
  {
    fieldName: "DocumentChequeId",
    fieldCaption: "شناسه چک",
    fieldType: "number",
    order: 13,
    visibility: { kind: "always" },
  },
];
