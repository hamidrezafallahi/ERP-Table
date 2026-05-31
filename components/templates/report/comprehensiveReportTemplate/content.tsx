import { ListColumn } from "@components/organisms/sideBarForm/types";

export const levelColumnMap = {
  GrohGroupLevel: [
    {
      fieldName: "GrohCode",
      fieldCaption: "کد گروه",
      fieldType: "string",
      width: 100,
    },
    {
      fieldName: "GrohDesc",
      fieldCaption: "شرح گروه",
      fieldType: "string",
      width: 200,
    },
  ],
  ColGroupLevel: [
    {
      fieldName: "ColCode",
      fieldCaption: "کد کل",
      fieldType: "string",
      width: 100,
    },
    {
      fieldName: "ColDesc",
      fieldCaption: "شرح کل",
      fieldType: "string",
      width: 200,
    },
  ],
  MoeenGroupLevel: [
    {
      fieldName: "MoeenCode",
      fieldCaption: "کد معین",
      fieldType: "string",
      width: 100,
    },
    {
      fieldName: "MoeenDesc",
      fieldCaption: "شرح معین",
      fieldType: "string",
      width: 250,
    },
  ],
  FourthLevelGroup: [
    {
      fieldName: "TafsiliCode",
      fieldCaption: "کد تفصیلی",
      fieldType: "string",
      width: 100,
    },
    {
      fieldName: "TafsiliDesc",
      fieldCaption: "شرح تفصیلی",
      fieldType: "string",
      width: 250,
    },
  ],
  FifthLevelGroup: [
    {
      fieldName: "FifthCode",
      fieldCaption: "کد سطح 5",
      fieldType: "string",
      width: 100,
    },
    {
      fieldName: "FifthDesc",
      fieldCaption: "شرح سطح 5",
      fieldType: "string",
      width: 250,
    },
  ],
  SixthLevelGroup: [
    {
      fieldName: "SixthCode",
      fieldCaption: "کد سطح 6",
      fieldType: "string",
      width: 100,
    },
    {
      fieldName: "SixthDesc",
      fieldCaption: "شرح سطح 6",
      fieldType: "string",
      width: 250,
    },
  ],
  SeventhLevelGroup: [
    {
      fieldName: "SeventhCode",
      fieldCaption: "کد سطح 7",
      fieldType: "string",
      width: 100,
    },
    {
      fieldName: "SeventhDesc",
      fieldCaption: "شرح سطح 7",
      fieldType: "string",
      width: 250,
    },
  ],
  EightLevelGroup: [
    {
      fieldName: "EightCode",
      fieldCaption: "کد سطح 8",
      fieldType: "string",
      width: 100,
    },
    {
      fieldName: "EightDesc",
      fieldCaption: "شرح سطح 8",
      fieldType: "string",
      width: 250,
    },
  ],
  NinthLevelGroup: [
    {
      fieldName: "NinthCode",
      fieldCaption: "کد سطح 9",
      fieldType: "string",
      width: 100,
    },
    {
      fieldName: "NinthDesc",
      fieldCaption: "شرح سطح 9",
      fieldType: "string",
      width: 250,
    },
  ],
  TenthLevelGroup: [
    {
      fieldName: "TenthCode",
      fieldCaption: "کد سطح 10",
      fieldType: "string",
      width: 100,
    },
    {
      fieldName: "TenthDesc",
      fieldCaption: "شرح سطح 10",
      fieldType: "string",
      width: 250,
    },
  ],
  EleventhLevelGroup: [
    {
      fieldName: "EleventhCode",
      fieldCaption: "کد سطح 11",
      fieldType: "string",
      width: 100,
    },
    {
      fieldName: "EleventhDesc",
      fieldCaption: "شرح سطح 11",
      fieldType: "string",
      width: 250,
    },
  ],
  TwelfthLevelGroup: [
    {
      fieldName: "TwelfthCode",
      fieldCaption: "کد سطح 12",
      fieldType: "string",
      width: 100,
    },
    {
      fieldName: "TwelfthDesc",
      fieldCaption: "شرح سطح 12",
      fieldType: "string",
      width: 250,
    },
  ],
  ThirteenthLevelGroup: [
    {
      fieldName: "ThirteenthCode",
      fieldCaption: "کد سطح 13",
      fieldType: "string",
      width: 100,
    },
    {
      fieldName: "ThirteenthDesc",
      fieldCaption: "شرح سطح 13",
      fieldType: "string",
      width: 250,
    },
  ],
};

export const neededFieldsColumns = [
  "GrohGroupLevel",
  "ColGroupLevel",
  "MoeenGroupLevel",
  "FourthLevelGroup",
  "FifthLevelGroup",
  "SixthLevelGroup",
  "SeventhLevelGroup",
  "EightLevelGroup",
  "NinthLevelGroup",
  "TenthLevelGroup",
  "EleventhLevelGroup",
  "TwelfthLevelGroup",
  "ThirteenthLevelGroup",
];

export const baseColumns = [
  {
    fieldName: "AccCode",
    fieldCaption: "کد حساب",
    fieldType: "string",
    width: 100,
  },
  {
    fieldName: "AccDesc",
    fieldCaption: "شرح حساب",
    fieldType: "string",
    width: 200,
  },
];

export const colsTypeColumnMap: Record<number, ListColumn[]> = {
  2: [
    {
      fieldName: "MandBed",
      fieldCaption: "مانده بدهکار",
      fieldType: "number",
      width: 100,
    },
    {
      fieldName: "MandBes",
      fieldCaption: "مانده بستانکار",
      fieldType: "number",
      width: 100,
    },
  ],
  4: [
    {
      fieldName: "SumBed",
      fieldCaption: "گردش بدهکار",
      fieldType: "number",
      width: 100,
    },
    {
      fieldName: "SumBes",
      fieldCaption: "گردش بستانکار",
      fieldType: "number",
      width: 100,
    },
    {
      fieldName: "MandBed",
      fieldCaption: "مانده بدهکار",
      fieldType: "number",
      width: 100,
    },
    {
      fieldName: "MandBes",
      fieldCaption: "مانده بستانکار",
      fieldType: "number",
      width: 100,
    },
  ],
  6: [
    {
      fieldName: "FirstPeriodBed",
      fieldCaption: "اول دوره بدهکار",
      fieldType: "number",
      width: 100,
    },
    {
      fieldName: "FirstPeriodBes",
      fieldCaption: "اول دوره بستانکار",
      fieldType: "number",
      width: 100,
    },
    {
      fieldName: "SumBed",
      fieldCaption: "گردش بدهکار",
      fieldType: "number",
      width: 100,
    },
    {
      fieldName: "SumBes",
      fieldCaption: "گردش بستانکار",
      fieldType: "number",
      width: 100,
    },
    {
      fieldName: "MandBed",
      fieldCaption: "مانده بدهکار",
      fieldType: "number",
      width: 100,
    },
    {
      fieldName: "MandBes",
      fieldCaption: "مانده بستانکار",
      fieldType: "number",
      width: 100,
    },
  ],
  8: [
    {
      fieldName: "FirstPeriodBed",
      fieldCaption: "اول دوره بدهکار",
      fieldType: "number",
      width: 150,
    },
    {
      fieldName: "FirstPeriodBes",
      fieldCaption: "اول دوره بستانکار",
      fieldType: "number",
      width: 150,
    },
    {
      fieldName: "PreviousMonthBed",
      fieldCaption: "گردش بدهکار تا ماه قبل",
      fieldType: "number",
      width: 180,
    },
    {
      fieldName: "PreviousMonthBes",
      fieldCaption: "گردش بستانکار تا ماه قبل",
      fieldType: "number",
      width: 180,
    },
    {
      fieldName: "CurrentMonthBed",
      fieldCaption: "گردش ماه جاری بدهکار",
      fieldType: "number",
      width: 180,
    },
    {
      fieldName: "CurrentMonthBes",
      fieldCaption: "گردش ماه جاری بستانکار",
      fieldType: "number",
      width: 180,
    },
    {
      fieldName: "MandBed",
      fieldCaption: "مانده بدهکار",
      fieldType: "number",
      width: 100,
    },
    {
      fieldName: "MandBes",
      fieldCaption: "مانده بستانکار",
      fieldType: "number",
      width: 150,
    },
  ],
};
