import type { IDetailColumnConfig } from '@services/generalType/type';
import type { IFormFieldConfig } from '@type/elementType';
import { SystemEnum } from '@type/enum';

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
  // {
  //   name: "ReferNumber",
  //   caption: "مرجع",
  //   type: "selectOption",
  //   selectEndpoint: {
  //     addWebUrl: "",
  //     endpoint: "",
  //     repoViewId: null,
  //   },
  // },
  {
    name: "ReferNumber",
    caption: "شماره ارجاع",
    type: "number",
  },
  {
    name: "CustomerId",
    caption: "مشتری",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/sale/select/customer4SelectOption",
      endpoint: "api/sale/select/customer4SelectOption",
      repoViewId: 130045,
    },
    isTitleField: true,
  },
  {
    name: "SaleTypeId",
    caption: "نوع فروش",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/sale/select/type4SelectOption",
      endpoint: "api/sale/select/type4SelectOption",
      repoViewId: 130044,
    },
  },
  {
    name: "Details",
    caption: "اقلام فاکتور",
    type: "array",
    value: [],
    originalValue: [],
  },
  {
    name: "AddElementIds",
    caption: "سایر عوامل افزاینده و کاهنده",
    type: "array",
    value: [],
    originalValue: [],
  },
  {
    name: "TaxIds",
    caption: "مالیات",
    type: "array",
    value: [],
    originalValue: [],
  },
  {
    name: "TaxItems",
    caption: "مالیات",
    type: "array",
    value: [],
    originalValue: [],
  },
  {
    name: "DiscountIds",
    caption: "تخفیف",
    type: "array",
    value: [],
    originalValue: [],
  },
  {
    name: "DiscountItems",
    caption: "تخفیف",
    type: "array",
    value: [],
    originalValue: [],
  },
  {
    name: "VoucherDesc",
    caption: "شماره سند",
    type: "text",
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
    fieldName: "GoodsId",
    fieldCaption: "کالا",
    mobileRender: true,
    fieldType: "selectOption",
    calcIndependent: true,
    dynamicValue: {
      endpoint: "api/sale/select/goods4selectOption/elk",
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
    fieldName: "Unit1Id",
    fieldCaption: "واحد شمارش",
    conditionKey: "GoodsId",
    calcIndependent: true,
    fieldType: "treeOption",
    dynamicValue: {
      endpoint: "/api/sale/select/measureUnit4selectOption",
    },
    order: 3,
  },
  {
    fieldName: "Quantity1",
    fieldCaption: "تعداد",
    conditionKey: "GoodsId",
    calcIndependent: true,
    fieldType: "number",
    order: 4,
    width: 90,
  },
  {
    fieldName: "Unit2Id",
    fieldCaption: "واحد شمارش دوم",
    conditionKey: "GoodsId",
    calcIndependent: true,
    fieldType: "treeOption",
    dynamicValue: {
      endpoint: "/api/sale/select/measureUnit4selectOption",
    },
    order: 5,
  },
  {
    fieldName: "Quantity2",
    fieldCaption: "تعداد دوم",
    conditionKey: "GoodsId",
    calcIndependent: true,
    fieldType: "number",
    order: 6,
    width: 90,
  },
  {
    fieldName: "Unit3Id",
    fieldCaption: "واحد شمارش سوم",
    conditionKey: "GoodsId",
    calcIndependent: true,
    fieldType: "treeOption",
    dynamicValue: {
      endpoint: "/api/sale/select/measureUnit4selectOption",
    },
    order: 7,
  },
  {
    fieldName: "Quantity3",
    fieldCaption: "تعداد سوم",
    conditionKey: "GoodsId",
    calcIndependent: true,
    fieldType: "number",
    order: 8,
    width: 90,
  },
  {
    fieldName: "Fee",
    fieldCaption: "فی کالا",
    fieldType: "price",
    independentValue: true,
    calcIndependent: true,
    order: 9,
  },
  {
    fieldName: "TotalRowAmount",
    fieldCaption: "مبلغ",
    mobileRender: true,
    fieldType: "static",
    staticConfig: {
      mode: "function",
      valueType: "price",
      config: (rowData) => {
        let decreasingValue = 0;
        let increasingValue = 0;
        const decreasingParameter = rowData?.["DiscountItems"] || 0;
        const increasingParameter = rowData?.["TaxItems"] || 0;

        if (decreasingParameter?.length > 0) {
          decreasingValue =
            decreasingParameter.reduce(
              (total, item) => total + item["amount"],
              0
            ) || 0;
        }
        if (increasingParameter?.length > 0) {
          increasingValue =
            increasingParameter.reduce(
              (total, item) => total + item["amount"],
              0
            ) || 0;
        }

        const value = rowData["FinalQuantity"] * rowData["Fee"] || 0;

        const result = value - decreasingValue + increasingValue;

        return result ? result : value;
      },
    },
    order: 13,
  },
  {
    fieldName: "BeforeTax",
    fieldCaption: "قبل مالیات",
    mobileRender: true,
    fieldType: "static",
    staticConfig: {
      mode: "function",
      valueType: "price",
      config: (rowData) => {
        let decreasingValue = 0;

        const decreasingParameter = rowData?.["DiscountItems"] || 0;

        if (decreasingParameter?.length > 0) {
          decreasingValue =
            decreasingParameter.reduce(
              (total, item) => total + item["amount"],
              0
            ) || 0;
        }

        const value = rowData["FinalQuantity"] * rowData["Fee"] || 0;

        const result = value - decreasingValue;

        return result ? result : value;
      },
    },
    order: 11,
  },
  {
    fieldName: "DetailDesc",
    fieldCaption: "شرح",
    fieldType: "text",
    order: 14,
  },
];
