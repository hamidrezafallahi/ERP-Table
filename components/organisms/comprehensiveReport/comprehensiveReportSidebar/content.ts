import { AccGlobalReportColEnum, RepReviewModeEnum } from "./enum";
import { selectsConfigType } from "./types";

export const selectOptionCol = Object.values(AccGlobalReportColEnum)
  .filter((reportCol) => typeof reportCol === "number")
  .map((col) => ({
    value: col,
    label: `${col} ستون`,
    title: `${col} ستون`,
  }));

export const selectsConfig: selectsConfigType[] = [
  {
    index: 1,
    name: "سطح 1",
    label: "سطح 1",
    colName: "",
  },
  {
    index: 2,
    name: "سطح 2",
    label: "سطح 2",
    colName: "",
  },
  {
    index: 3,
    name: "سطح 3",
    label: "سطح 3",
    colName: "",
  },
  {
    index: 4,
    name: "سطح 4",
    label: "سطح 4",
    colName: "",
  },
  {
    index: 5,
    name: "سطح 5",
    label: "سطح 5",
    colName: "",
  },
  {
    index: 6,
    name: "سطح 6",
    label: "سطح 6",
    colName: "",
  },
  {
    index: 7,
    name: "سطح 7",
    label: "سطح 7",
    colName: "",
  },
  {
    index: 8,
    name: "سطح 8",
    label: "سطح 8",
    colName: "",
  },
  {
    index: 9,
    name: "سطح 9",
    label: "سطح 9",
    colName: "",
  },
  {
    index: 10,
    name: "سطح 10",
    label: "سطح 10",
    colName: "",
  },
  {
    index: 11,
    name: "سطح 11",
    label: "سطح 11",
    colName: "",
  },
  {
    index: 12,
    name: "سطح 12",
    label: "سطح 12",
    colName: "",
  },
  {
    index: 13,
    name: "سطح 13",
    label: "سطح 13",
    colName: "",
  },
];

export const sourceArray = [
  { label: "تراز حسابداری در سطح گروه", value: RepReviewModeEnum.Groh },
  { label: "تراز حسابداری در سطح کل", value: RepReviewModeEnum.Col },
  { label: "تراز حسابداری در سطح معین", value: RepReviewModeEnum.Moeen },
  { label: "تراز حسابداری در سطح تفصیلی", value: RepReviewModeEnum.Tafsili },
  { label: "تراز حسابداری در سطح سطح 5", value: RepReviewModeEnum.Fifth },
  { label: "تراز حسابداری در سطح 6", value: RepReviewModeEnum.Sixth },
  { label: "تراز حسابداری در سطح 7", value: RepReviewModeEnum.Seventh },
  { label: "تراز حسابداری در سطح 8", value: RepReviewModeEnum.Eigth },
  { label: "تراز حسابداری در سطح 9", value: RepReviewModeEnum.Nine },
  { label: "تراز حسابداری در سطح 10", value: RepReviewModeEnum.Ten },
  { label: "تراز حسابداری در سطح 11", value: RepReviewModeEnum.Eleven },
  { label: "تراز حسابداری در سطح 12", value: RepReviewModeEnum.Twelve },
  { label: "تراز حسابداری در سطح 13", value: RepReviewModeEnum.Thirteen },
];
