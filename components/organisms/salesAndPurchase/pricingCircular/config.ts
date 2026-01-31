import type { IDetailColumnConfig } from "@services/generalType/type";
import type { IFormFieldConfig } from "@type/elementType";
import { SystemEnum } from "@type/enum";

export const formConfig: IFormFieldConfig[] = [
  {
    name: "PriceOrderDesc",
    caption: "توضیحات تعرفه",
    type: "text",
  },
  {
    name: "PriceOrderDate",
    caption: "تاریخ تعرفه",
    type: "date",
  },
  {
    name: "CustomerId",
    caption: "مشتری",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/sale/Select/Customer4SelectOption",
      endpoint: "api/sale/Select/Customer4SelectOption",
      repoViewId: 130045,
    },
  },
  {
    name: "PriceOrderNumber",
    caption: "شماره تعرفه",
    type: "text",
  },
  {
    name: "StartDate",
    caption: "تاریخ شروع",
    type: "date",
  },
  {
    name: "EndDate",
    caption: "تاریخ پایان",
    type: "date",
  },
  {
    name: "IsSetNow",
    caption: "هم اکنون",
    type: "checkBox",
    value: false,
    originalValue: false,
    isTitleField: false,
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
    fieldName: "GoodsId",
    fieldCaption: "کالا",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "api/sale/select/goods",
      repoViewId: 130063,
      addButton: {
        url: "com/good",
        RepoId: 106023,
        SystemId: SystemEnum.com,
      },
    },
    width: 250,
    mobileRender: true,
    order: 2,
  },
  {
    fieldName: "CurrencyId",
    fieldCaption: "ارز",
    fieldType: "selectOption",
    dynamicValue: {
      endpoint: "api/sale/select/currency",
      repoViewId: 130065,
    },
    width: 200,
    mobileRender: true,
    order: 3,
  },
  {
    fieldName: "Price",
    fieldCaption: "قیمت",
    fieldType: "price",
    width: 200,
    mobileRender: true,
    order: 4,
  },
];
