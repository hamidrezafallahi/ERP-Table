import { IDetailColumnConfig } from '@services/generalType/type';
import { IPageInfo } from '@slice/pages/type';
import { IFormFieldConfig } from '@type/elementType';

interface IMasterDetailConfig {
  caption: string;
  titleField: string;
  componentName: string;
  listUrl: string;
  getUrl: string;
  repoViewId: number;
  getDetailUrl: string;
  detailsRepoViewId: number;
  info: IPageInfo;
  columnsConfig: IDetailColumnConfig[];
  formData: IFormFieldConfig[];
}

export const priceConfig: IMasterDetailConfig = {
  caption: "title.priceListIssuance",
  titleField: "PriceListHeaderDesc",
  componentName: "PriceComponent",
  listUrl: "sale/priceList",
  getUrl: "/api/sale/select/priceListHeader",
  repoViewId: 130005,
  getDetailUrl: "api/sale/select/priceListDetail",
  detailsRepoViewId: 130004,
  info: {
    addEndpoint: "api/sale/insert/priceList",
    deleteEndpoint: "api/sale/delete/priceList",
    updateEndpoint: "api/sale/update/priceList",
    formIdField: "PriceListHeaderId",
  },

  columnsConfig: [
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
        endpoint: "api/sale/select/goods",
        repoViewId: 130063,
      },
      width: 470,
      mobileRender: true,
    },
    {
      fieldName: "Price",
      fieldCaption: "قیمت",
      fieldType: "price",
      width: 200,
      mobileRender: true,
    },
  ],

  formData: [
    {
      name: "PriceListHeaderDesc",
      caption: "عنوان لیست قیمت",
      type: "text",
      value: null,
      originalValue: null,
      isTitleField: false,
    },
    {
      name: "CurrencyId",
      caption: "نوع ارز",
      type: "selectOption",
      value: null,
      originalValue: null,
      isTitleField: false,
      selectEndpoint: {
        addWebUrl: "api/sale/select/currency",
        endpoint: "api/sale/select/currency",
        repoViewId: null,
      },
    },
    {
      name: "Details",
      caption: "اقلام لیست",
      type: "array",
      value: undefined,
      originalValue: undefined,
      isTitleField: false,
    },
  ],
};
