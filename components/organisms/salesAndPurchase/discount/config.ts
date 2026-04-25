import moment from 'moment';

import type { IFormFieldConfig } from '@type/elementType';

interface formConfigType extends IFormFieldConfig {
  rule?: any[];
}

export const formConfig: formConfigType[] = [
  {
    name: "DiscountTitle",
    caption: "عنوان",
    type: "text",
    value: undefined,
    originalValue: undefined,
    isTitleField: true,
    colSpan: 2,
  },
  {
    name: "DiscountTypeId",
    caption: "انتخاب نوع تخفیف",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/com/select/commonInfo/discountType",
      endpoint: "/api/com/select/commonInfo/discountType",
    },
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "DiscountType",
    caption: "نوع تخفیف",
    type: "radio",
    value: false,
    radioValues: [
      {
        caption: "درصدی",
        value: false,
      },
      {
        caption: "مبلغی",
        value: true,
      },
    ],
    originalValue: false,
    isTitleField: false,
  },
  {
    name: "DiscountAmount",
    caption: "درصد",
    type: "number",
    value: undefined,

    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "DiscountAmount",
    caption: "مبلغ",
    type: "number",
    value: undefined,
    originalValue: undefined,
    isTitleField: true,
  },
  {
    name: "CurrencyId",
    caption: "ارز",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/sale/select/currencyAvailable",
      endpoint: "/api/sale/select/currencyAvailable",
      repoViewId: 130076,
    },
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "IsNonStackable",
    caption: "قابلیت ترکیب  با سایر تخفیفات",
    type: "checkBox",
    value: false,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "Priority",
    caption: "اولویت",
    type: "number",
    value: undefined,
    originalValue: undefined,
    isTitleField: true,
  },
  {
    name: "IsSetNow",
    caption: "هم اکنون",
    type: "checkBox",
    value: false,
    originalValue: undefined,
    isTitleField: false,
  },

  {
    name: "EffectiveDate",
    caption: "تاریخ شروع",
    type: "date",
    value: moment(new Date()).toISOString(),
    originalValue: moment(new Date()).toISOString(),
    isTitleField: false,
  },
  {
    name: "ExpireDate",
    caption: "تاریخ پایان",
    type: "date",
    value: moment(new Date()).toISOString(),
    originalValue: moment(new Date()).toISOString(),
    isTitleField: false,
  },

  {
    name: "CustomerDiscountIds",
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
  },
  {
    name: "CustomerGroupDiscountIds",
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
  },
  {
    name: "GoodsDiscountIds",
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
  },
  {
    name: "GoodsCategoryDiscountIds",
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
  },
  {
    name: "DiscountSaleTypesIds",
    caption: "نوع  فروش",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/sale/Select/Type4SelectOption",
      endpoint: "api/sale/Select/Type4SelectOption",
      repoViewId: 130044,
    },
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "DiscountPaymentWaysIds",
    caption: "نحوه پرداخت",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/sale/Select/PaymentWay4SelectOption",
      endpoint: "api/sale/Select/PaymentWay4SelectOption",
      repoViewId: 130051,
    },
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "DiscountLocationsIds",
    caption: "محل جغرافیایی",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/com/Select/Location4selectoption",
      endpoint: "api/com/Select/Location4selectoption",
    },
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "DiscountSaleTeamIds",
    caption: "تیم فروش",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/sale/Select/SaleTeam4SelectOption",
      endpoint: "api/sale/Select/SaleTeam4SelectOption",
      repoViewId: 130048,
    },
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "DiscountConditions",
    caption: "شرط",
    type: "array",
    value: [],
    originalValue: [],
    isTitleField: false,
  },
];
