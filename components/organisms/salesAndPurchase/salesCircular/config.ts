import type { IFormFieldConfig } from '@type/elementType';

interface formConfigType extends IFormFieldConfig {
  rule?: any[];
}

export const formConfig: formConfigType[] = [
  {
    name: "SaleRuleNumber",
    caption: "شماره",
    type: "text",
    value: undefined,
    originalValue: undefined,
    isTitleField: true,
    colSpan: 1,
  },
  {
    name: "SaleRuleDate",
    caption: "تاریخ بخش نامه",
    type: "date",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
    colSpan: 2,
  },
  {
    name: "RuleType",
    caption: "نوع",
    type: "radio",
    value: false,
    radioValues: [
      {
        caption: "معمولی",
        value: 0,
      },
      {
        caption: "توقف فروش",
        value: 1,
      },
      {
        caption: "توقف تخفیف",
        value: 2,
      },
      {
        caption: "توقف مالیات",
        value: 3,
      },
      {
        caption: "جلوگیری از موجودی",
        value: 4,
      },
      {
        caption: "غیر فعال",
        value: 5,
      },
    ],
    originalValue: false,
    isTitleField: false,
    colSpan: 3,
  },
  {
    name: "SourceType",
    caption: "منبع",
    type: "number",
    value: undefined,

    originalValue: undefined,
    isTitleField: false,
    colSpan: 4,
  },
  // {
  //   name: "RuleTypeId",
  //   caption: "انتخاب نوع ...",
  //   type: "selectOption",
  //   selectEndpoint: {
  //     addWebUrl: "/api/com/Select/CommonInfo/discountType", //check she
  //     endpoint: "/api/com/Select/CommonInfo/discountType", //check kon
  //   },
  //   value: undefined,
  //   originalValue: undefined,
  //   isTitleField: false,
  // },
  {
    name: "StartDate",
    caption: "تاریخ شروع",
    type: "date",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
    colSpan: 5,
  },

  {
    name: "EndDate",
    caption: "تاریخ پایان",
    type: "date",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
    colSpan: 6,
  },
  {
    name: "CustomerRuleIds",
    caption: "مشتری",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/sale/select/customer4SelectOption",
      endpoint: "api/sale/select/customer4SelectOption",
      repoViewId: 130045,
    },
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
    colSpan: 7,
  },
  {
    name: "CustomerGroupRuleIds",
    caption: "گروه مشتری",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/sale/select/customerGroup4SelectOption",
      endpoint: "api/sale/select/customerGroup4SelectOption",
      repoViewId: 1061,
    },
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
    colSpan: 8,
  },
  {
    name: "GoodsRuleIds",
    caption: "کالا",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/sale/select/goods",
      endpoint: "api/sale/select/goods",
      repoViewId: 130063,
    },
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
    colSpan: 9,
  },
  {
    name: "GoodsCategoryRuleIds",
    // name: "GoodGroupId",
    caption: "گروه کالا",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/sale/select/goodsCategory",
      endpoint: "api/sale/select/goodsCategory",
      repoViewId: 130061,
    },
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
    colSpan: 10,
  },
];
