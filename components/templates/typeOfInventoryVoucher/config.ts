import type { IDetailColumnConfig } from '@services/generalType/type';
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
    name: "ReferNumber",
    caption: "شماره ارجاع",
    type: "number",
  },
  {
    name: "InvoiceHeaderId",
    caption: "فاکتور مرجع",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/sale/select/invoice4selectOption/elk",
      endpoint: "api/sale/select/invoice4selectOption/elk",
      // repoViewId: 1052,
    },
    isTitleField: true,
  },

  {
    name: "Details",
    caption: "اقلام سند",
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
      endpoint: "api/sale/select/invoiceReturn/goods",
      // repoViewId: 1070,
      // InvoiceHeaderId: detailRequiredValue?.value,
    },
    order: 2,
  },
  {
    fieldName: "UnitId",
    fieldCaption: "واحد شمارش",
    conditionKey: "GoodsId",
    calcIndependent: true,
    fieldType: "treeOption",
    dynamicValue: {
      endpoint: "api/sale/select/measureUnit",
      repoViewId: 1069,
    },
    order: 3,
  },
  {
    fieldName: "Quantity",
    fieldCaption: "تعداد",
    conditionKey: "GoodsId",
    calcIndependent: true,
    fieldType: "number",
    order: 4,
    width: 90,
  },
  {
    fieldName: "Fee",
    isChangeField: "IsPriceChange",
    isApplyField: "IsPriceApply",
    applyTooltip: "درج به عنوان قیمت اصلی کالا",
    fieldCaption: "فی کالا",
    fieldType: "changeablePrice",
    independentValue: true,
    calcIndependent: true,
    order: 5,
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
        const pureAmount = rowData["FinalQuantity"] * rowData["Fee"] || 0;

        const result = pureAmount;

        return result ? result : 0;
      },
    },
    order: 6,
  },

  {
    fieldName: "DetailDesc",
    fieldCaption: "شرح",
    fieldType: "text",
    order: 7,
  },
];
