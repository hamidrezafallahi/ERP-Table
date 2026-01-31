import { IDetailColumnConfig } from '@services/generalType/type';
import type { IFormFieldConfig } from '@type/elementType';

export const formConfig: IFormFieldConfig[] = [
  {
    name: "VoucherNumber",
    caption: "شماره سند",
    type: "number",
  },
  {
    name: "VoucherTypeId",
    caption: "نوع انبار",
    type: "number",
    rules: [
      {
        rule: "required",
        condition: "number",
        message: "این فیلد الزامی است ",
      },
    ],
  },
  {
    name: "VoucherDate",
    caption: "تاریخ سند",
    type: "date",
  },
  // {
  //   name: "VoucherTypeId",
  //   caption: "نوع سند",
  //   type: "selectOption",
  //   selectEndpoint: {
  //     addWebUrl: "/api/com/select/voucherType4searchBox",
  //     endpoint: "/api/com/select/voucherType4searchBox",
  //     repoViewId: 106065,
  //   },
  // },
  {
    name: "ReferId",
    caption: "مرجع",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "",
      endpoint: "api/inv/select/voucher4selectOption",
      repoViewId: null,
    },
  },

  {
    name: "StockId",
    caption: "انبار مبدا",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/inv/select/stock4SelectOption",
      endpoint: "/api/inv/select/stock4SelectOption",
      repoViewId: 70004,
    },
  },
  {
    name: "ToStockId",
    caption: "انبار مقصد",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/inv/select/stock4SelectOption",
      endpoint: "/api/inv/select/stock4SelectOption",
      repoViewId: 70004,
    },
  },
  {
    name: "TafsiliId",
    caption: "تفصیلی",
    type: "selectOption",
    selectEndpoint: {
      endpoint: "/api/acc/select/tafsili4selectOption",
      repoViewId: 70004,
    },
  },
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
  },

  {
    fieldName: "GoodsId",
    fieldCaption: "کالا",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "api/com/select/goods4SelectOption",
    },
    calcIndependent: true,
    order: 1,
  },
  {
    fieldName: "Unit1Id",
    fieldCaption: "واحد شمارش",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "api/sale/select/measureUnit4SelectOption",
      addWebUrl: "api/sale/select/measureUnit4SelectOption",
      repoViewId: null,
    },
    order: 2,
    conditionKey: "GoodsId",
  },
  {
    fieldName: "Quantity1",
    fieldCaption: "تعداد",
    fieldType: "number",
    conditionKey: "GoodsId",
    order: 3,
  },
  {
    fieldName: "Unit2Id",
    fieldCaption: "واحد شمارش",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "api/sale/select/measureUnit4SelectOption",
      addWebUrl: "api/sale/select/measureUnit4SelectOption",
      repoViewId: null,
    },
    conditionKey: "GoodsId",
    order: 4,
  },
  {
    fieldName: "Quantity2",
    fieldCaption: "تعداد",
    fieldType: "number",
    conditionKey: "GoodsId",
    order: 5,
  },
  {
    fieldName: "Unit3Id",
    fieldCaption: "واحد شمارش",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "api/sale/select/measureUnit4SelectOption",
      addWebUrl: "api/sale/select/measureUnit4SelectOption",
      repoViewId: null,
    },
    conditionKey: "GoodsId",
    order: 6,
  },
  {
    fieldName: "Quantity3",
    fieldCaption: "تعداد",
    fieldType: "number",
    conditionKey: "GoodsId",
    order: 7,
  },
  {
    fieldName: "InventoryLocationId",
    fieldCaption: "لوکیشن",
    fieldType: "selectOption",

    dynamicValue: {
      endpoint: "api/inv/Select/StockLocation4SelectOption",
    },
    conditionKey: "GoodsId",
    order: 8,
  },
  {
    fieldName: "BatchNo",
    fieldCaption: "بچ",
    fieldType: "text",
    conditionKey: "GoodsId",
    order: 9,
  },
];
