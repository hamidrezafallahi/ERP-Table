import type { IDetailColumnConfig } from '@services/generalType/type';
import {
  InvoicePatternTypeTwoEnum,
} from '@services/sale/standardSalesInvoice/type';
import type { IFormFieldConfig } from '@type/elementType';
import { SystemEnum } from '@type/enum';

import {
  calcDiscount,
  calcFactor,
  calcTax,
} from '../utils';

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
    name: "PayOfTypeId",
    caption: "روش تسویه",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/sale/select/settlementWay",
      endpoint: "api/sale/select/settlementWay",
      repoViewId: null,
    },
  },
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
    name: "AddElement",
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
  {
    name: "eInvoicePatternTypeTwo",
    caption: "الگوی صورت حساب الکترونیکی شماره دو",
    type: "number",
    value: InvoicePatternTypeTwoEnum.JewelryWithoutBuyer,
    originalValue: InvoicePatternTypeTwoEnum.JewelryWithoutBuyer,
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
    isChangeField: "IsPriceChange",
    isApplyField: "IsPriceApply",
    applyTooltip: "درج به عنوان قیمت اصلی کالا",
    fieldCaption: "فی کالا",
    fieldType: "changeablePrice",
    independentValue: true,
    calcIndependent: true,
    order: 9,
  },
  {
    fieldName: "ConstructionCost",
    fieldCaption: "اجرت ساخت",
    fieldType: "price",
    independentValue: true,
    calcIndependent: true,
    order: 10,
  },
  // {
  //   fieldName: "Purity",
  //   fieldCaption: "عیار",
  //   fieldType: "number",
  //   independentValue: true,
  //   order: 11,
  // },
  {
    fieldName: "SellerProfit",
    fieldCaption: "سود فروشنده",
    fieldType: "price",
    independentValue: true,
    calcIndependent: true,
    order: 12,
  },
  {
    fieldName: "Commission",
    fieldCaption: "حق العمل",
    fieldType: "price",
    independentValue: true,
    calcIndependent: true,
    order: 13,
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
        const factors = rowData?.["AddElementDetailItems"] || [];
        const discounts = rowData?.["DiscountItems"] || [];
        const taxes = rowData?.["TaxItems"] || [];
        const increasingValue2 = rowData?.["TaxFundsAmount"] || 0;
        const increasingValue3 = rowData?.["LegalFundsAmount"] || 0;
        const additionalAmount =
          (rowData?.["ConstructionCost"] || 0) +
          (rowData?.["Commission"] || 0) +
          (rowData?.["SellerProfit"] || 0);
        const { increasingFactorValue, decreasingFactorValue } = calcFactor(
          pureAmount,
          factors
        );
        const { totalDiscountValue } = calcDiscount(
          pureAmount,
          discounts,
          factors
        );
        const { totalTaxValue } = calcTax(
          pureAmount,
          taxes,
          discounts,
          factors,
          null,
          additionalAmount,
          "JEWELRY"
        );

        const result =
          pureAmount -
          totalDiscountValue +
          increasingValue2 +
          increasingValue3 +
          totalTaxValue +
          increasingFactorValue -
          decreasingFactorValue +
          additionalAmount;

        return result ? result : 0;
      },
    },
    order: 19,
  },
  // {
  //   fieldName: "BeforeTax",
  //   fieldCaption: "قبل مالیات",
  //   mobileRender: true,
  //   fieldType: "static",
  //   staticConfig: {
  //     mode: "function",
  //     valueType: "price",
  //     config: (rowData) => {
  //       // let decreasingValue = 0;

  //       const decreasingParameter = rowData?.["DiscountItems"] || 0;

  //       if (decreasingParameter?.length > 0) {
  //         // decreasingValue =
  //         //   decreasingParameter.reduce(
  //         //     (total, item) => total + item["amount"],
  //         //     0
  //         //   ) || 0;
  //       }

  //       const value = rowData["FinalQuantity"] * rowData["Fee"] || 0;

  //       // const result = value - decreasingValue;
  //       const result = value;

  //       return result ? result : value;
  //     },
  //   },
  //   order: 15,
  // },
  {
    fieldName: "DetailDesc",
    fieldCaption: "شرح",
    fieldType: "text",
    order: 20,
  },
];
