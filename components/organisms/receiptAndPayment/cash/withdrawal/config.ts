import moment from 'moment';

import type { IDetailColumnConfig } from '@services/generalType/type';
import type { IFormFieldConfig } from '@type/elementType';

export const formConfig: IFormFieldConfig[] = [
  {
    name: "VoucherNumber",
    caption: "شماره سند",
    type: "number",
    value: null,
    originalValue: null,
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
    caption: "از صندوقدار",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/trh/Select/Cashier4SelectOption",
      endpoint: "/api/trh/Select/Cashier4SelectOption",
      repoViewId: 140002,
    },
    value: null,
    originalValue: null,
  },
  {
    name: "Price",
    caption: "مبلغ",
    type: "price",
    value: null,
    originalValue: null,
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
    fieldCaption: `ردیف - عملیات`,
    fieldType: "index",
    order: 1,
  },
  {
    fieldName: "VoucherDate",
    fieldCaption: "تاریخ سند",
    fieldType: "date",
    mobileRender: true,
    order: 2,
  },
  {
    fieldName: "FishNumber",
    fieldCaption: "شماره فیش",
    fieldType: "text",
    order: 3,
  },
  // {
  // fieldName: "",
  // fieldCaption: "دستور پرداخت",
  // fieldType: "selectOption",
  // dynamicValue: {
  //     endpoint: "/api/acc/select/tafsiliLevel4",
  //   },
  // },
  // order: 5,
  {
    fieldName: "RpWayId",
    fieldCaption: "نحوه دریافت و پرداخت",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "api/trh/select/rpWay4voucher",
      repoViewId: null,
    },
    order: 6,
  },

  {
    fieldName: "TafsiliId",
    fieldCaption: "سطح چهارم",
    conditionKey: "RpWayId",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsiliLevel4",
      repoViewId: 10017,
    },
    order: 7,
  },
  {
    fieldName: "FifthId",
    fieldCaption: "سطح پنجم",
    conditionKey: "RpWayId",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsiliLevel5",
      repoViewId: null,
    },
    order: 8,
  },
  {
    fieldName: "SixthId",
    fieldCaption: "سطح ششم",
    conditionKey: "RpWayId",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsiliLevel6",
      repoViewId: null,
    },
    order: 9,
  },
  {
    fieldName: "SeventhId",
    fieldCaption: "سطح 7",
    conditionKey: "RpWayId",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsiliLevel7",
      repoViewId: null,
    },
    order: 10,
  },
  {
    fieldName: "EightId",
    fieldCaption: "سطح 8",
    conditionKey: "RpWayId",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsiliLevel8",
      repoViewId: null,
    },
    order: 11,
  },
  {
    fieldName: "NineId",
    fieldCaption: "سطح 9",
    conditionKey: "RpWayId",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsiliLevel9",
      repoViewId: null,
    },
    order: 12,
  },
  {
    fieldName: "TenId",
    fieldCaption: "سطح 10",
    conditionKey: "RpWayId",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsiliLevel10",
      repoViewId: null,
    },
    order: 13,
  },
  {
    fieldName: "ElevenId",
    fieldCaption: "سطح 11",
    conditionKey: "RpWayId",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsiliLevel11",
      repoViewId: null,
    },
    order: 14,
  },
  {
    fieldName: "TwelveId",
    fieldCaption: "سطح 12",
    conditionKey: "RpWayId",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsiliLevel12",
      repoViewId: null,
    },
    order: 15,
  },
  {
    fieldName: "ThirteenId",
    fieldCaption: "سطح 13",
    conditionKey: "RpWayId",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsiliLevel13",
      repoViewId: null,
    },
    order: 16,
  },
  {
    fieldName: "Price",
    fieldCaption: "مبلغ",
    fieldType: "price",
    mobileRender: true,
    order: 17,
  },
  {
    fieldName: "VoucherDesc",
    fieldCaption: "شرح",
    fieldType: "text",
    order: 18,
  },
];
