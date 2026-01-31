import type { IFormFieldConfig } from "@type/elementType";

export const formConfig: IFormFieldConfig[] = [
  {
    name: "VoucherNumber",
    caption: "شماره سند",
    type: "number",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "VoucherDate",
    caption: "تاریخ سند",
    type: "date",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "VoucherTypeId",
    caption: "نوع سند",
    type: "number",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "ReferNumber",
    caption: "شماره ارجاع",
    type: "number",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "VoucherDesc",
    caption: "شرح سند",
    type: "text",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "Details",
    caption: "اقلام سند",
    type: "array",
    value: [],
    originalValue: [],
    isTitleField: false,
  },
];
