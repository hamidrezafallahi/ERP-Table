import { IFilterData } from "@type/filterTypes";
import { ValueTypeEnum } from "./enum";

export const filterFields: IFilterData[] = [
   {
      label: "نوع سند",
      value: "VoucherTypeIds",
      type: "dynamicMultiSelect",
      dynamicValue: {
        endpoint: "/api/acc/select/VoucherTypeCategoryReport",
        //OrderInfo: [{ Asc: true, ColName: "voucherTypeId" }]
      },
    },
    {
      label: "وضعیت سند",
      value: "docStatusIds",
      type: "multiSelect",
      options: [
        { caption: "پیش نویس", value: ValueTypeEnum.Draft },
        { caption: "تنظیم شده", value: ValueTypeEnum.Prepared },
        { caption: "ابطال شده", value: ValueTypeEnum.Canceled },
        { caption: "قطعی شده", value: ValueTypeEnum.Finalized },
      ],
    },
  {
    label: "کد معین",
    type: "dynamicSelect",
    value: "MoeenId",
    dynamicValue: {
      endpoint: "api/acc/select/account/moeen",
    },
  },
  {
    label: "کد گروه",
    value: "GrohId",
    type: "dynamicSelect",
    dynamicValue: {
      endpoint: "api/acc/select/account/groh",
    },
  },
  {
    label: "کد کل",
    value: "ColId",
    type: "dynamicSelect",
    dynamicValue: {
      endpoint: "api/acc/select/account/kol",
    },
  },
  {
    label: "کد تفصیلی",
    value: "TafsiliId",
    type: "dynamicSelect",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsili4RepReview",
    },
  },
  {
    label: "کد سطح 5",
    value: "FifthId",
    type: "dynamicSelect",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsili4RepReview",
    },
  },
  {
    label: "کد سطح 6",
    value: "SixthId",
    type: "dynamicSelect",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsili4RepReview",
    },
  },
  {
    label: "کد سطح 7",
    value: "SeventhId",
    type: "dynamicSelect",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsili4RepReview",
    },
  },
  {
    label: "کد سطح 8",
    value: "EightId",
    type: "dynamicSelect",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsili4RepReview",
    },
  },
  {
    label: "کد سطح 9",
    value: "NinthId",
    type: "dynamicSelect",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsili4RepReview",
    },
  },
  {
    label: "کد سطح 10",
    value: "TenthId",
    type: "dynamicSelect",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsili4RepReview",
    },
  },
  {
    label: "کد سطح 11",
    value: "EleventhId",
    type: "dynamicSelect",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsili4RepReview",
    },
  },
  {
    label: "کد سطح 12",
    value: "TwelfthId",
    type: "dynamicSelect",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsili4RepReview",
    },
  },
  {
    label: "کد سطح 13",
    value: "ThirteenIdId",
    type: "dynamicSelect",
    dynamicValue: {
      endpoint: "/api/acc/select/tafsili4RepReview",
    },
  },
  {
    label: "شرح ردیف",
    value: "DetailDesc",
    type: "string",
  },
  {
    label: "شرح سند",
    value: "VoucherDesc",
    type: "string",
  },
  {
    label: "تاریخ پیگیری",
    value: "ReferDate",
    type: "date",
  },
  {
    label: "شماره پیگیری",
    value: "ReferNumber",
    type: "number",
  },
  {
    label: "شماره ارجاع",
    value: "FollowUpNumber",
    type: "number",
  },
  {
    label: "محل تابع",
    value: "FollowUpNumber2",
    type: "number",
  },
];
