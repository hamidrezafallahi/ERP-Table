import { IDetailColumnConfig } from '@components/organisms/erp-table';
import type { IFormFieldConfig } from '@type/elementType';

export const formConfig: IFormFieldConfig[] = [
  {
    name: "VoucherNumber",
    caption: "شماره سند",
    type: "number",
  },
  {
    name: "VoucherDate",
    caption: "تاریخ سند",
    type: "date",
  },
  {
    name: "BankAccountId",
    caption: "از حساب بانکی",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/trh/select/bankAccount4SelectOption",
      endpoint: "api/trh/select/bankAccount4SelectOption",
      repoViewId: 106081,
    },
  },
  {
    name: "CurrencyId",
    caption: "ارز",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/trh/select/currencyAvailable",
      endpoint: "/api/trh/select/currencyAvailable",
      repoViewId: 140036,
    },
  },
  {
    name: "Price",
    caption: "مبلغ",
    type: "price",
  },
  {
    name: "CashStatements",
    caption: "صندوق",
    type: "array",
    value: [],
    originalValue: [],
  },
  {
    name: "TankhahStatements",
    caption: "تنخواه",
    type: "array",
    value: [],
    originalValue: [],
  },
  {
    name: "TafsiliStatements",
    caption: "افراد",
    type: "array",
    value: [],
    originalValue: [],
  },
  {
    name: "BankStatements",
    caption: "حساب بانکی",
    type: "array",
    value: [],
    originalValue: [],
  },
];

export const columnConfig: IDetailColumnConfig[] = [
  {
    fieldName: "index",
    fieldCaption: " ردیف - عملیات",
    fieldType: "index",
    order: 1,
    visibility: { kind: "always" },
  },
  {
    fieldName: "VoucherDate",
    fieldCaption: "تاریخ سند",
    fieldType: "date",
    visibility: { kind: "always" },
    order: 2,
  },
  {
    fieldName: "FishNumber",
    fieldCaption: "شماره فیش",
    fieldType: "text",
    visibility: { kind: "always" },
    order: 3,
  },
  {
    fieldName: "CashierId",
    fieldCaption: "صندوقدار",
    fieldType: "selectOption",
    visibility: { kind: "always" },
    dynamicSource: {
      endpoint: "api/trh/Select/Cashier4SelectOption",
      repoViewId: 140002,
    },
    order: 4,
  },
  {
    fieldName: "TankhahdarId",
    fieldCaption: "تنخواه دار",
    fieldType: "selectOption",
    visibility: { kind: "always" },
    dynamicSource: {
      endpoint: "api/trh/Select/TankhahDar4SelectOption",
      repoViewId: 140002,
    },
    order: 5,
  },
  {
    fieldName: "BankAccountId",
    fieldCaption: "حساب بانکی",
    fieldType: "selectOption",
    visibility: { kind: "always" },
    dynamicSource: {
      endpoint: "api/trh/select/bankAccount4SelectOption",
      repoViewId: 106081,
    },
    order: 6,
  },
  {
    fieldName: "RpWayId",
    fieldCaption: "نحوه دریافت و پرداخت",
    fieldType: "selectOption",
    dynamicSource: { endpoint: "api/trh/select/rpWay4voucher" },
    visibility: { kind: "always" },
    resolveOn: {
      fieldName: "RpWayId",
      endpoint: "/api/trh/select/account",
      buildParams: (row) => ({ RpWayId: Number(row.RpWayId) }),
      mapFlags: (res) => {
        const temp = res.Data[0]
        console.log(temp)
        return {
          TafsiliId: res.Data[0].HasTafsili,
          FifthId: res.Data[0].HasFifth,
          SixthId: res.Data[0].HasSixth,
          SeventhId: res.Data[0].HasSeventh,
          EightId: res.Data[0].HasEight,
          NineId: res.Data[0].HasNine,
          TenId: res.Data[0].HasTen,
          ElevenId: res.Data[0].HasEleven,
          TwelveId: res.Data[0].HasTwelve,
          ThirteenId: res.Data[0].HasThirteen,
        }
      },
    },
    order: 7,
  },

  {
    fieldName: "TafsiliId",
    fieldCaption: "سطح چهارم",
    fieldType: "selectOption",
    visibility: {
      kind: "whenRemoteFlag",
      sourceFieldName: "RpWayId",
      flag: "TafsiliId",
    },
    dynamicSource: {
      endpoint: "/api/acc/select/tafsiliLevel4",
      repoViewId: 10017
    },
    order: 8,
  },
  {
    fieldName: "FifthId",
    fieldCaption: "سطح پنجم",
    fieldType: "selectOption",
    visibility: {
      kind: "whenRemoteFlag",
      sourceFieldName: "RpWayId",
      flag: "FifthId",
    },
    dynamicSource: {
      endpoint: "/api/acc/select/tafsiliLevel5",
      repoViewId: 10017
     },
    order: 9,

  },
  {
    fieldName: "SixthId",
    fieldCaption: "سطح ششم",

    fieldType: "selectOption",
    visibility: {
      kind: "whenRemoteFlag",
      sourceFieldName: "RpWayId",
      flag: "SixthId",
    },
    dynamicSource: { endpoint: "/api/acc/select/tafsiliLevel6",repoViewId: 10017 },
    order: 10,
  },
  {
    fieldName: "SeventhId",
    fieldCaption: "سطح 7",

    fieldType: "selectOption",
    visibility: {
      kind: "whenRemoteFlag",
      sourceFieldName: "RpWayId",
      flag: "SeventhId",
    },
    dynamicSource: { endpoint: "/api/acc/select/tafsiliLevel7",repoViewId: 10017 },
    order: 11,
  },
  {
    fieldName: "EightId",
    fieldCaption: "سطح 8",

    fieldType: "selectOption",
    visibility: {
      kind: "whenRemoteFlag",
      sourceFieldName: "RpWayId",
      flag: "EightId",
    },
    dynamicSource: { endpoint: "/api/acc/select/tafsiliLevel8",repoViewId: 10017 },
    order: 12,
  },
  {
    fieldName: "NineId",
    fieldCaption: "سطح 9",

    fieldType: "selectOption",
    visibility: {
      kind: "whenRemoteFlag",
      sourceFieldName: "RpWayId",
      flag: "NineId",
    },
    dynamicSource: { endpoint: "/api/acc/select/tafsiliLevel9",repoViewId: 10017 },
    order: 13,
  },
  {
    fieldName: "TenId",
    fieldCaption: "سطح 10",
    fieldType: "selectOption",
    visibility: {
      kind: "whenRemoteFlag",
      sourceFieldName: "RpWayId",
      flag: "TenId",
    },
    dynamicSource: { endpoint: "/api/acc/select/tafsiliLevel10",repoViewId: 10017 },
    order: 14,
  },
  {
    fieldName: "ElevenId",
    fieldCaption: "سطح 11",

    fieldType: "selectOption",
    visibility: {
      kind: "whenRemoteFlag",
      sourceFieldName: "RpWayId",
      flag: "ElevenId",
    },
    dynamicSource: { endpoint: "/api/acc/select/tafsiliLevel11",repoViewId: 10017 },
    order: 15,
  },
  {
    fieldName: "TwelveId",
    fieldCaption: "سطح 12",

    fieldType: "selectOption",
    visibility: {
      kind: "whenRemoteFlag",
      sourceFieldName: "RpWayId",
      flag: "TwelveId",
    },
    dynamicSource: { endpoint: "/api/acc/select/tafsiliLevel12",repoViewId: 10017 },
    order: 16,
  },
  {
    fieldName: "ThirteenId",
    fieldCaption: "سطح 13",
    fieldType: "selectOption",
    visibility: {
      kind: "whenRemoteFlag",
      sourceFieldName: "RpWayId",
      flag: "ThirteenId",
    },
    dynamicSource: { endpoint: "/api/acc/select/tafsiliLevel13",repoViewId: 10017 },
    order: 17,
  },
  {
    fieldName: "Price",
    fieldCaption: "مبلغ",
    fieldType: "price",
    visibility: { kind: "always" },
    order: 18,
  },
  {
    fieldName: "VoucherDesc",
    fieldCaption: "شرح",
    fieldType: "text",
    visibility: { kind: "always" },
    order: 19,
  },

]