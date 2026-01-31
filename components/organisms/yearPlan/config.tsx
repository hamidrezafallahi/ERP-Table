"use client";
import { IDetailColumnConfig } from "@services/generalType/type";
import type { IFormFieldConfig } from "@type/elementType";
import { useTranslations } from "next-intl";

export const useFormConfig = () => {
  const t = useTranslations();

  const formConfig: IFormFieldConfig[] = [
    {
      name: "Year",
      caption: t("general.year"),
      type: "number",
      value: undefined,
      originalValue: undefined,
      isTitleField: true,
    },
    {
      name: "Date",
      caption: t("general.date"),
      type: "date",
      value: undefined,
      originalValue: undefined,
      isTitleField: false,
    },
    {
      name: "Verson",
      caption: t("general.versionNumber"),
      type: "number",
      value: undefined,
      originalValue: undefined,
      isTitleField: false,
    },
    {
    name: "Details",
    caption: "اقلام",
    type: "array",
    value: [],
    originalValue: [],
    isTitleField: false,
  },
  ];

  const columnConfig: IDetailColumnConfig[] = [
    {
      fieldName: "GoodId",
      fieldCaption: t("general.good"),
      fieldType: "selectOption",
      dynamicValue: {
        endpoint: "api/sale/select/goods",
        repoViewId: 130063,
      },
      order: 1,
      mobileRender: true,
      sticky: "rightCustom",
       width:140,
    },
    {
      fieldName: "Month1",
      fieldCaption: t("general.month1"),
      fieldType: "number",
      mobileRender: true,
      order: 2,
    },
    {
      fieldName: "Month2",
      fieldCaption: t("general.month2"),
      fieldType: "number",
      mobileRender: true,
      order: 3,
    },
    {
      fieldName: "Month3",
      fieldCaption: t("general.month3"),
      fieldType: "number",
      mobileRender: true,
      order: 4,
    },
    {
      fieldName: "Month4",
      fieldCaption: t("general.month4"),
      fieldType: "number",
      mobileRender: true,
      order: 5,
    },
    {
      fieldName: "Month5",
      fieldCaption: t("general.month5"),
      fieldType: "number",
      mobileRender: true,
      order: 6,
    },
    {
      fieldName: "Month6",
      fieldCaption: t("general.month6"),
      fieldType: "number",
      mobileRender: true,
      order: 7,
    },
    {
      fieldName: "Month7",
      fieldCaption: t("general.month7"),
      fieldType: "number",
      mobileRender: true,
      order: 8,
    },
    {
      fieldName: "Month8",
      fieldCaption: t("general.month8"),
      fieldType: "number",
      mobileRender: true,
      order: 9,
    },
    {
      fieldName: "Month9",
      fieldCaption: t("general.month9"),
      fieldType: "number",
      mobileRender: true,
      order: 10,
    },
    {
      fieldName: "Month10",
      fieldCaption: t("general.month10"),
      fieldType: "number",
      mobileRender: true,
      order: 11,
    },
    {
      fieldName: "Month11",
      fieldCaption: t("general.month11"),
      fieldType: "number",
      mobileRender: true,
      order: 12,
    },
    {
      fieldName: "Month12",
      fieldCaption: t("general.month12"),
      fieldType: "number",
      mobileRender: true,
      order: 13,
    },
    {
      fieldName: "RowSum",
      fieldCaption: t("general.total"),
      fieldType: "static",
      mobileRender: true,
      sticky: "leftCustom",
      staticConfig: {
        valueType: "number",
        mode: "function",
        config: (rowData) => {
          const month1 = rowData?.["Month1"] || 0;
          const month2 = rowData?.["Month2"] || 0;
          const month3 = rowData?.["Month3"] || 0;
          const month4 = rowData?.["Month4"] || 0;
          const month5 = rowData?.["Month5"] || 0;
          const month6 = rowData?.["Month6"] || 0;
          const month7 = rowData?.["Month7"] || 0;
          const month8 = rowData?.["Month8"] || 0;
          const month9 = rowData?.["Month9"] || 0;
          const month10 = rowData?.["Month10"] || 0;
          const month11 = rowData?.["Month11"] || 0;
          const month12 = rowData?.["Month12"] || 0;
          const sum =
            month1 +
            month2 +
            month3 +
            month4 +
            month5 +
            month6 +
            month7 +
            month8 +
            month9 +
            month10 +
            month11 +
            month12;
          return sum;
        },
      },
      width:128
    },
  ];
  return { formConfig, columnConfig };
};
