import type { IDetailColumnConfig } from "@services/generalType/type";
import type { IFormFieldConfig } from "@type/elementType";
import { SystemEnum } from "@type/enum";

export const formConfig: IFormFieldConfig[] = [
  {
    name: "VoucherNumber",
    caption: "شماره فاکتور",
    type: "number",
  },

  {
    name: "PatternId",
    caption: "الگوی شماره گذاری",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: null,
      endpoint: null,
      repoViewId: null,
    },
  },
  {
    name: "VoucherDate",
    caption: "تاریخ فاکتور",
    type: "date",
  },

  {
    name: "Details",
    caption: "اقلام فاکتور",
    type: "array",
    value: [],
    originalValue: [],
  },

  {
    name: "VoucherDesc",
    caption: "شماره سند",
    type: "text",
  },
  {
    name: "IsMasterDetail",
    caption: "شماره سند",
    type: "boolean",
    value: true,
    originalValue: true,
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
    fieldName: "GoodId",
    fieldCaption: "کالا",
    mobileRender: true,
    fieldType: "selectOption",
    calcIndependent: true,
    dynamicValue: {
      endpoint: "api/buy/select/good4selectOption",
      repoViewId: 130063,
      addButton: {
        url: "com/good",
        RepoId: 106023,
        SystemId: SystemEnum.com,
      },
    },
    order: 2,
  },
  {
    fieldName: "MeasureUnitId",
    fieldCaption: "واحد شمارش",
    conditionKey: "GoodId",
    // calcIndependent: true,
    fieldType: "treeOption",
    dynamicValue: {
      endpoint: "/api/buy/select/measureUnit4selectOption",
    },
    order: 3,
  },

  {
    fieldName: "Qty",
    fieldCaption: "تعداد",
    conditionKey: "GoodId",
    // calcIndependent: true,
    fieldType: "number",
    order: 4,
    width: 90,
  },
];
