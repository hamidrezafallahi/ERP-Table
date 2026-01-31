import type { IFormFieldConfig } from "@type/elementType";

interface formConfigType extends IFormFieldConfig {
  rule?: any[];
}

export const formConfig: formConfigType[] = [
  {
    name: "PatternDesc",
    caption: "عنوان الگو",
    type: "text",
    value: undefined,
    originalValue: undefined,
    isTitleField: true,
  },
  {
    name: "StartNumber",
    caption: "شماره شروع",
    type: "number",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "EndNumber",
    caption: "شماره پایان",
    type: "number",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "ResetYear",
    caption: "در سال مالی باز نشانی شود",
    type: "boolean",
    value: false,
    originalValue: false,
    isTitleField: false,
  },
  {
    name: "IndicatorCount",
    caption: "تعداد شماره های اندیکاتور",
    type: "number",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "IndicatorStartNo",
    caption: "شماره شروع اندیکاتور",
    type: "number",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
  {
    name: "PatternItem",
    caption: "آیتم های الگو",
    type: "array",
    value: [],
    originalValue: [],
    isTitleField: false,
  },
  {
    name: "RepoId",
    caption: "آیتم های الگو",
    type: "number",
    value: undefined,
    originalValue: undefined,
    isTitleField: false,
  },
];
