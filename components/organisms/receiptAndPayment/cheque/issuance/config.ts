import type { IFormFieldConfig } from "@type/elementType";

export const formConfig: IFormFieldConfig[] = [
  {
    name: "VoucherNumber",
    caption: "شماره سند",
    type: "text",
  },
  {
    name: "VoucherDate",
    caption: "تاریخ سند",
    type: "date",
  },
  {
    name: "BankAccountId",
    caption: "پرداخت از بانک",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/com/select/bankAccount4selectOption",
      endpoint: "/api/com/select/bankAccount4selectOption",
      repoViewId: 106081,
    },
  },
  {
    name: "VoucherNatureId",
    caption: "ماهیت سند",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/trh/select/commonInfo/voucherNature",
      endpoint: "api/trh/select/commonInfo/voucherNature",
      repoViewId: null,
    },
  },
  {
    name: "RpWayId",
    caption: "نحوه دریافت و پرداخت",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "api/trh/select/rpWay4voucher",
      endpoint: "api/trh/select/rpWay4voucher",
      repoViewId: null,
    },
  },
  {
    name: "TafsiliId",
    caption: "سطح چهارم",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel4",
      endpoint: "/api/acc/select/tafsiliLevel4",
      repoViewId: 10017,
    },
  },
  {
    name: "FifthId",
    caption: "سطح پنجم",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel5",
      endpoint: "/api/acc/select/tafsiliLevel5",
    },
  },
  {
    name: "SixthId",
    caption: "سطح ششم",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel6",
      endpoint: "/api/acc/select/tafsiliLevel6",
    },
  },
  {
    name: "SeventhId",
    caption: "سطح 7",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel7",
      endpoint: "/api/acc/select/tafsiliLevel7",
    },
  },
  {
    name: "EightId",
    caption: "سطح 8",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel8",
      endpoint: "/api/acc/select/tafsiliLevel8",
    },
  },
  {
    name: "NineId",
    caption: "سطح 9",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel9",
      endpoint: "/api/acc/select/tafsiliLevel9",
    },
  },
  {
    name: "TenId",
    caption: "سطح 10",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel10",
      endpoint: "/api/acc/select/tafsiliLevel10",
    },
  },
  {
    name: "ElevenId",
    caption: "سطح 11",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel11",
      endpoint: "/api/acc/select/tafsiliLevel11",
    },
  },
  {
    name: "TwelveId",
    caption: "سطح 12",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel12",
      endpoint: "/api/acc/select/tafsiliLevel12",
    },
  },
  {
    name: "ThirteenId",
    caption: "سطح 13",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/acc/select/tafsiliLevel13",
      endpoint: "/api/acc/select/tafsiliLevel13",
    },
  },
  // {
  //   name: "",
  //   caption: "دستور پرداخت",
  //   type: "selectOption",
  //   selectEndpoint: {
  //     addWebUrl: "",
  //     endpoint: "",
  //   },
  // },
  {
    name: "VoucherTypeId",
    caption: "نوع سند",
    type: "selectOption",
    selectEndpoint: {
      addWebUrl: "/api/com/select/voucherType4Voucher",
      endpoint: "/api/com/select/voucherType4Voucher",
      repoViewId: 30085,
    },
    value: 6021,
    originalValue: 6021,
  },
  {
    name: "VoucherDesc",
    caption: "شرح سند",
    type: "text",
  },
  {
    name: "Details",
    caption: "",
    type: "array",
    value: [],
    originalValue: [],
  },
];

// export const columnConfig: IDetailColumnConfig[] = [
//   {
//     fieldName: "index",
//     fieldCaption: `ردیف - عملیات`,
//     fieldType: "index",
//   },

//   // {
//   //   fieldName: "CheckNumber",
//   //   fieldCaption: "شماره چک",
//   //   fieldType: "number",
//   // },
//   // {
//   //   fieldName: "SayadNumber",
//   //   fieldCaption: "شماره صیاد",
//   //   fieldType: "number",
//   // },
//   {
//     fieldName: "CheckPlaceMentDetailId",
//     fieldCaption: "چک",
//     fieldType: "selectOption",
//     dynamicValue: {
//       addWebUrl: "api/trh/select/CheckPlacementDetail/Check/Issuance",
//       endpoint: "api/trh/select/CheckPlacementDetail/Check/Issuance",
//       repoViewId: 140029,
//       BankAccountId: 10000249,
//     },
//   },
//   {
//     fieldName: "MaturityDate",
//     fieldCaption: "تاریخ سررسید",
//     fieldType: "date",
//   },
//   {
//     fieldName: "DocPrice",
//     fieldCaption: "مبلغ",
//     fieldType: "price",
//   },
//   {
//     fieldName: "IsForToday",
//     fieldCaption: "چک روز",
//     fieldType: "boolean",
//   },
//   {
//     fieldName: "DetailDesc",
//     fieldCaption: "شرح",
//     fieldType: "text",
//   },
// ];
