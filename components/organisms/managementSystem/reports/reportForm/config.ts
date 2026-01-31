import type { IFormFieldConfig } from "@type/elementType";

interface formConfigType extends IFormFieldConfig {
  rule?: any[];
}
export const formConfig: formConfigType[] = [
  {
    name: "Title",
    caption: "عنوان",
    type: "text",
    value: undefined,
    originalValue: undefined,
    isTitleField: true,
    colSpan: 2,
  },

  {
    name: "Type",
    caption: "نوع",
    type: "radio",
    value: false,
    radioValues: [
      {
        caption: "گزارش",
        value: 1,
      },
      {
        caption: "داشبورد",
        value: 2,
      },
      {
        caption: "چاپ",
        value: 3,
      },
    ],
    originalValue: false,
    isTitleField: false,
  },

  {
    name: "DataSourceIds",
    caption: "مخزن داده",
    type: "multiSelectOption",
    selectEndpoint: {
      addWebUrl: "api/report/select/DataSources",
      endpoint: "api/report/select/DataSources",
      repoViewId: 12005,
    },
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
];
