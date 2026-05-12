import { IData } from "@components/molecules/advancedFilter/type";
import { ValueTypeEnum } from "./enum";
import { CheckboxItemsType } from "./types";

export const filterFields: IData[] = [
  { label: "گزارش جامع", value: "ComprehensiveReport", type: "" },
  { label: "شماره سند", value: "DocumentNumber", type: "string" },
  { label: "شماره ارجاع", value: "ReferenceNumber", type: "string" },
  { label: "شماره سریال", value: "SerialNumber", type: "string" },
  {
    label: "نوع سند",
    value: "DocumentType",
    type: "select",
    valueOption: {
      endpoint: "/api/acc/select/voucherType4searchBox",
    },
  },
  {
    label: "وضعیت سند",
    value: "DocumentStatus",
    type: "select",
    valueOption: {
      Options: [
        { caption: "پیش نویس", value: ValueTypeEnum.Draft },
        { caption: "تنظیم شده", value: ValueTypeEnum.Prepared },
        { caption: "ابطال شده", value: ValueTypeEnum.Canceled },
        { caption: "قطعی شده", value: ValueTypeEnum.Finalized },
      ],
    },
  },
  { label: "کد گروه", value: "GroupCode", type: "select" },
  { label: "کد کل", value: "GeneralLedgerCode", type: "select" },
  { label: "کد معین", value: "SubsidiaryCode", type: "select" },
  { label: "کد تفصیلی", value: "DetailCode", type: "select" },
  { label: "کد سطح 5", value: "Level5Code", type: "select" },
  { label: "کد سطح 6", value: "Level6Code", type: "select" },
  { label: "کد سطح 7", value: "Level7Code", type: "select" },
  { label: "کد سطح 8", value: "Level8Code", type: "select" },
  { label: "کد سطح 9", value: "Level9Code", type: "select" },
  { label: "کد سطح 10", value: "Level10Code", type: "select" },
  { label: "کد سطح 11", value: "Level11Code", type: "select" },
  { label: "کد سطح 12", value: "Level12Code", type: "select" },
  { label: "کد سطح 13", value: "Level13Code", type: "select" },
  { label: "ایجاد کننده", value: "CreatedBy", type: "select" },
  { label: "شرکت", value: "Company", type: "select" },
];

//  {
//       value: "DocumentCheque.StateId",
//       label: "آخرین وضعیت",
//       type: "select",
//       valueOption: {
//         Options: [
//           {
//             caption: "نزد بانک",
//             value: StateTypeEnum.Bank,
//           },
//           {
//             caption: "نزد صندوق",
//             value: StateTypeEnum.CashDesk,
//           },
//           {
//             caption: "وصول شده",
//             value: StateTypeEnum.Collected,
//           },
//           {
//             caption: "نزد شخص",
//             value: StateTypeEnum.Person,
//           },
//           {
//             caption: "نزد تنخواه",
//             value: StateTypeEnum.Tankhah,
//           },
//           {
//             caption: "استرداد شده",
//             value: StateTypeEnum.Returned,
//           },
//         ],
//       },
//     },
//     {
//       value: "CheckReceiptHeader.TafsiliId",
//       label: "صادرکننده چک",
//       type: "select",
//       valueOption: {
//         endpoint: "/api/acc/select/tafsili4SelectOption",
//         TafsiliTypeId: 1,
//         repoViewId: 10017,
//       },
//     },

export const checkboxItems: CheckboxItemsType[] = [
  { name: "ShowInadept", label: "بدهکار" },
  { name: "ShowCreditor", label: "بستانکار" },
  { name: "ShowHasRemain", label: "مانده دار" },
  { name: "ShowHasNotRemain", label: "بدون مانده" },
];
